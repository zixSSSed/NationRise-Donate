// Cloudflare Pages Function — эндпоинт POST /api/pay
// Держит секретный Shop-Key EasyDonate на сервере (в браузер он не попадает).
// Принимает от сайта {customer, email, products:{edId:qty}, coupon} → создаёт платёж
// в EasyDonate → возвращает {url} со ссылкой на оплату.
//
// В настройках проекта Cloudflare Pages задай переменные окружения (Settings → Environment variables):
//   SHOP_KEY   — ключ магазина EasyDonate (32 символа, в настройках магазина)
//   SERVER_ID  — ID сервера из панели EasyDonate (вкладка «Серверы»)

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } catch { return j({ error: "Некорректный запрос" }, 400); }

  const { customer, email, products, coupon } = body || {};
  if (!customer || !email || !products || !Object.keys(products).length)
    return j({ error: "Заполните ник, email и добавьте товары." }, 400);

  if (!env.SHOP_KEY || !env.SERVER_ID)
    return j({ error: "Оплата ещё не настроена администратором (нет ключа магазина)." }, 503);

  const params = new URLSearchParams();
  params.set("customer", String(customer));
  params.set("email", String(email));
  params.set("server_id", String(env.SERVER_ID));
  params.set("products", JSON.stringify(products)); // {"23":1,"24":2}
  if (coupon) params.set("coupon", String(coupon));
  params.set("success_url", "https://nationrise.space"); // куда вернуть после оплаты

  let data = null;
  try {
    const res = await fetch("https://easydonate.ru/api/v3/shop/payment/create?" + params.toString(), {
      method: "GET",
      headers: { "Shop-Key": env.SHOP_KEY, "Accept": "application/json" },
    });
    data = await res.json();
  } catch (e) {
    return j({ error: "EasyDonate недоступен, попробуйте позже." }, 502);
  }

  if (data && data.success && data.response && data.response.url)
    return j({ url: data.response.url }, 200);

  return j({ error: (data && (data.message || data.error)) || "EasyDonate: не удалось создать платёж." }, 502);
}

function j(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
