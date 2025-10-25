import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const { className, monthlyPrice, institutionId } = await req.json();

    if (!className || !monthlyPrice || !institutionId) {
      throw new Error("Missing required fields: className, monthlyPrice, institutionId");
    }

    // Verify user has access to this institution
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("institution_id", institutionId)
      .eq("role", "institution_admin");

    if (roleError || !roles || roles.length === 0) {
      throw new Error("User does not have permission for this institution");
    }

    // Get institution details
    const { data: institution, error: instError } = await supabase
      .from("institutions")
      .select("name")
      .eq("id", institutionId)
      .single();

    if (instError || !institution) {
      throw new Error("Institution not found");
    }

    // Create Stripe product
    const product = await stripe.products.create({
      name: `${institution.name} - ${className}`,
      description: `Monthly subscription for ${className}`,
    });

    // Create Stripe price (recurring monthly)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(monthlyPrice * 100), // Convert to cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
    });

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: "hosted_confirmation",
        hosted_confirmation: {
          custom_message: `Thank you for subscribing to ${className}!`,
        },
      },
      metadata: {
        institution_id: institutionId,
        class_name: className,
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    // Save class to database
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .insert({
        institution_id: institutionId,
        name: className,
        monthly_price: monthlyPrice,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        stripe_payment_link: paymentLink.url,
      })
      .select()
      .single();

    if (classError) {
      throw classError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        class: classData,
        paymentLink: paymentLink.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating class:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
