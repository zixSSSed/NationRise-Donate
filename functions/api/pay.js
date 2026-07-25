// Cloudflare Pages Function — эндпоинт POST /api/pay
// Держит секретный ключ магазина EasyDonate на сервере (в браузер он не попадает).
// Принимает от сайта {customer, email, products:[{id,quantity}], coupon}
// → создаёт платёж в EasyDonate → возвращает {url} со ссылкой на оплату.
//
// Переменные окружения проекта Cloudflare Pages (Settings → Variables and Secrets):
//   SHOP_KEY   — ключ магазина EasyDonate (Secret)
//   SERVER_ID  — ID сервера из панели EasyDonate
//
// API: POST https://api.easydonate.ru/v0/payments/create, заголовок X-Shop-Key.
// (Старый метод shop/payment-create помечен устаревшим и больше не используется.)

const API = "https://api.easydonate.ru/v0/payments/create";
const MAX_PRODUCTS = 10; // ограничение EasyDonate: не более 10 позиций в одном платеже

// Зеркало на GitHub Pages (nationrise.ru) обращается сюда с другого домена,
// поэтому явно разрешаем ему запросы. Посторонние сайты — не разрешаем.
const ALLOWED = ["https://nationrise.space", "https://www.nationrise.space",
                 "https://nationrise.ru", "https://www.nationrise.ru"];

function cors(request) {
  const origin = request.headers.get("Origin") || "";
  if (!ALLOWED.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

// предварительный запрос браузера перед POST с другого домена
export function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: cors(context.request) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const ch = cors(request);

  let body;
  try { body = await request.json(); } catch { return j({ error: "Некорректный запрос" }, 400, ch); }

  const { customer, email, products, coupon } = body || {};

  if (!Array.isArray(products) || !products.length)
    return j({ error: "Корзина пуста." }, 400, ch);
  if (products.length > MAX_PRODUCTS)
    return j({ error: `В одном заказе можно оплатить не больше ${MAX_PRODUCTS} разных товаров. Разбейте покупку.` }, 400, ch);
  if (!/^[A-Za-z0-9_]{1,32}$/.test(String(customer || "")))
    return j({ error: "Некорректный ник." }, 400, ch);
  if (!/^\S+@\S+\.\S+$/.test(String(email || "")))
    return j({ error: "Некорректный email." }, 400, ch);

  if (!env.SHOP_KEY || !env.SERVER_ID)
    return j({ error: "Оплата ещё не настроена администратором." }, 503, ch);

  const payload = {
    username: String(customer),
    email: String(email),
    server_id: Number(env.SERVER_ID),
    products: products.map(p => ({ id: Number(p.id), quantity: Math.max(1, Number(p.quantity) || 1) })),
    return_url: "https://nationrise.space",
  };
  if (coupon) payload.promocode = String(coupon);

  let res, data;
  try {
    res = await fetch(API, {
      method: "POST",
      headers: {
        "X-Shop-Key": env.SHOP_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });
    data = await res.json();
  } catch (e) {
    return j({ error: "EasyDonate недоступен, попробуйте позже." }, 502, ch);
  }

  if (data && data.success && data.data && data.data.url)
    return j({ url: data.data.url }, 200, ch);

  // показываем причину отказа, если EasyDonate её прислал
  const why = data && (data.message || data.error ||
    (data.errors && JSON.stringify(data.errors)));
  return j({ error: why ? "EasyDonate: " + why : "Не удалось создать платёж." }, 502, ch);
}

function j(obj, status, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(extraHeaders || {}) },
  });
}
