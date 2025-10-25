import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Stripe keys not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No stripe signature found");
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("Received event:", event.type);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get subscription details
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      const customerPhone = session.customer_details?.phone;

      // Get payment link metadata
      const paymentLinkId = session.payment_link as string;
      if (!paymentLinkId) {
        console.error("No payment link ID in session");
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Retrieve payment link to get metadata
      const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
      const institutionId = paymentLink.metadata?.institution_id;
      const className = paymentLink.metadata?.class_name;

      if (!institutionId || !className) {
        console.error("Missing metadata in payment link");
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Find the class by institution_id and name
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id")
        .eq("institution_id", institutionId)
        .eq("name", className)
        .single();

      if (classError || !classData) {
        console.error("Class not found:", classError);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Insert student into database
      const { error: studentError } = await supabase.from("students").insert({
        class_id: classData.id,
        name: customerName || "Unknown",
        email: customerEmail || "",
        phone: customerPhone || null,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: "active",
      });

      if (studentError) {
        console.error("Error inserting student:", studentError);
        throw studentError;
      }

      console.log("Student enrolled successfully");
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;

      // Update student status
      const { error: updateError } = await supabase
        .from("students")
        .update({ subscription_status: "canceled" })
        .eq("stripe_subscription_id", subscriptionId);

      if (updateError) {
        console.error("Error updating student status:", updateError);
      } else {
        console.log("Student subscription canceled");
      }
    }

    // Handle subscription updates (paused, resumed, etc.)
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;
      const status = subscription.status;

      let dbStatus = "active";
      if (status === "canceled" || status === "incomplete_expired") {
        dbStatus = "canceled";
      } else if (status === "paused") {
        dbStatus = "paused";
      }

      const { error: updateError } = await supabase
        .from("students")
        .update({ subscription_status: dbStatus })
        .eq("stripe_subscription_id", subscriptionId);

      if (updateError) {
        console.error("Error updating student status:", updateError);
      } else {
        console.log("Student subscription updated");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
