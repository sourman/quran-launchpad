import Stripe from "https://esm.sh/stripe@14?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, Stripe-Signature",
};

// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
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
    });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the signature from headers (Stripe uses capital S in header name)
    const signature = req.headers.get("Stripe-Signature");
    if (!signature) {
      console.error("No stripe signature found in headers");
      return new Response(
        JSON.stringify({ error: "No stripe signature found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // First step is to verify the event. The .text() method must be used as the
    // verification relies on the raw request body rather than the parsed JSON.
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Webhook signature verification failed:", errorMessage);
      console.error("Signature header present:", !!signature);
      console.error("Webhook secret configured:", !!webhookSecret);
      console.error("Body length:", body.length);
      return new Response(
        JSON.stringify({ 
          error: "Webhook signature verification failed",
          details: errorMessage 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Received event:", event.type);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get subscription details
      const subscriptionId = session.subscription as string | null;
      const customerId = session.customer as string | null;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      const customerPhone = session.customer_details?.phone;

      if (!subscriptionId || !customerId) {
        console.error("Missing subscription or customer ID in session:", {
          subscriptionId,
          customerId,
        });
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get payment link metadata
      const paymentLinkId = session.payment_link as string | null;
      if (!paymentLinkId) {
        console.log("No payment link ID in session, skipping enrollment");
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Retrieve payment link to get metadata
      let paymentLink: Stripe.PaymentLink;
      try {
        paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Error retrieving payment link:", errorMessage);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const institutionId = paymentLink.metadata?.institution_id;
      const className = paymentLink.metadata?.class_name;

      if (!institutionId || !className) {
        console.error("Missing metadata in payment link:", {
          institutionId,
          className,
          metadata: paymentLink.metadata,
        });
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        console.error("Class not found:", {
          error: classError,
          institutionId,
          className,
        });
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        const errorMessage = studentError.message || String(studentError);
        console.error("Error inserting student:", {
          error: studentError,
          classId: classData.id,
          customerId,
          subscriptionId,
        });
        // Don't throw - return 200 to prevent Stripe from retrying
        // We can handle this error separately
        return new Response(
          JSON.stringify({ 
            received: true,
            warning: "Student enrollment failed",
            error: errorMessage
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Webhook error:", errorMessage);
    if (errorStack) {
      console.error("Error stack:", errorStack);
    }
    
    const errorResponse: Record<string, unknown> = { 
      error: errorMessage
    };
    if (errorStack) {
      errorResponse.stack = errorStack;
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
