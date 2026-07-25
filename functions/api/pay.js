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

  let data;
  try {
    const res = await fetch(API, {
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
    // 200, а не 5xx: иначе Cloudflare подменит наш JSON своей страницей ошибки
    return j({ error: "Платёжный сервис не отвечает. Попробуйте чуть позже." }, 200, ch);
  }

  if (data && data.success && data.data && data.data.url)
    return j({ url: data.data.url }, 200, ch);

  return j({ error: describe(data) }, 200, ch);
}

/** Понятный текст вместо технической ошибки EasyDonate. */
function describe(data) {
  const err = data && data.error;
  const code = err && (err.code || err);
  const raw = (err && err.message) || (data && data.message) || "";

  const known = {
    BANK_ACCOUNT_INACTIVE: "Приём платежей ещё не активирован владельцем магазина. Загляните позже.",
    SHOP_NOT_FOUND: "Магазин не найден. Напишите администрации.",
    PRODUCT_NOT_FOUND: "Один из товаров больше не продаётся — обновите страницу.",
    SERVER_NOT_FOUND: "Сервер выдачи не настроен. Напишите администрации.",
    VALIDATION_ERROR: "Проверьте ник и email.",
  };
  if (typeof code === "string" && known[code]) return known[code];
  if (raw) return "Платёж не создан: " + raw;
  return "Не удалось создать платёж. Попробуйте позже.";
}

function j(obj, status, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(extraHeaders || {}) },
  });
}
