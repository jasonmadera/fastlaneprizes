export async function onRequestPost({ request, env }) {
  try {
    const origin = new URL(request.url).origin;

    let qty = 1;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      qty = parseInt(body?.qty || 1, 10);
    }

    if (!Number.isFinite(qty)) qty = 1;
    qty = Math.max(1, Math.min(100, qty)); // limit 1–100 tickets

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", `${origin}/success.html`);
    params.set("cancel_url", `${origin}/`);
    params.set("line_items[0][price]", env.STRIPE_PRICE_ID);
    params.set("line_items[0][quantity]", String(qty));

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await stripeRes.json();

    if (!stripeRes.ok) {
      return new Response(JSON.stringify({ error: data }), { status: 400 });
    }

    return new Response(JSON.stringify({ url: data.url }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

