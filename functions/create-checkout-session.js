export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "payment",
        "line_items[0][price]": env.STRIPE_PRICE_ID,
        "line_items[0][quantity]": "1",
        customer_creation: "always",
        success_url: `${env.SITE_URL}/success.html`,
        cancel_url: `${env.SITE_URL}/`,
      }).toString(),
    });

    const data = await stripeRes.json();

    if (!stripeRes.ok) {
      return new Response(JSON.stringify({ error: data.error?.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ id: data.id }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
