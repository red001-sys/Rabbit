import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { plan } = await req.json().catch(() => ({ plan: "mensal" }));

    const plans: Record<string, { price: string; mode: "payment" | "subscription" }> = {
      mensal: { price: "price_1T7MwuRjaZ0FbxXhG6NbSa6r", mode: "payment" },
      anual: { price: "price_1T7NgZRjaZ0FbxXhuuej6tpT", mode: "subscription" },
    };

    const selected = plans[plan];
    if (!selected) throw new Error(`Plano inválido: ${plan}`);

    const origin = req.headers.get("origin") || "https://nutri-buddy-coach-10.lovable.app";

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: selected.price, quantity: 1 }],
      mode: selected.mode,
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/premium`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
