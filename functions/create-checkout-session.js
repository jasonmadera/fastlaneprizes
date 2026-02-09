export async function onRequestPost({ request, env }) {
  try {
    const origin = new URL(request.url).origin;

    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", `${origin}/success.html`);
    body.set("cancel_url", `${origin}/`);
    body.set("line_items[0][price]", env.STRIPE_PRICE_ID);
    body.set("line_items[0][quantity]", "1");

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await resp.json();

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: data.url }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || "Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
