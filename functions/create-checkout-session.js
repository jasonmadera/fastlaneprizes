import Stripe from "stripe";

export async function onRequestPost({ request, env }) {
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    // This is the safest way on Cloudflare Pages:
    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success.html`,
      cancel_url: `${origin}/`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || "Stripe error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
