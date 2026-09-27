// Cloudflare Pages Function — эндпоинт POST /api/pay
// Держит секретный ключ кассы на сервере (в браузер он не попадает).
// Принимает от сайта {customer, email, items:[{id,variant,qty}], products:[{id,quantity}], coupon}
// → создаёт счёт → возвращает {url} со ссылкой на оплату.
//
// КАССА (27.09.2026): Millida Trade — EasyDonate заморозил вывод. Пока в переменных нет
// MILLIDA_KEY, платёж по-старому уходит в EasyDonate; как только ключ вписан — в Millida.
//
// Переменные окружения проекта Cloudflare Pages (Settings → Variables and Secrets):
//   MILLIDA_KEY — ключ Merchant API Millida (mtk_live_…, Secret; ЛК магазина → Интеграции → API-ключи)
//   SHOP_KEY, SERVER_ID — старая касса EasyDonate (после переезда можно удалить)
//
// Millida: POST https://api.millida.net/v2/merchant/invoices, Authorization: Bearer <ключ>,
// позиции каталога {productId, variantId, quantity} — цену и выдачу считает Millida сама.

const API = "https://api.easydonate.ru/v0/payments/create";
const MILLIDA_API = "https://api.millida.net/v2/merchant/invoices";

// ID товаров сайта → товары (и сроки) магазина Millida «nationrise». Источник — millida-map.json.
const MILLIDA = {"nobleman":{"id":"w4jzsdnq8kn0vbzej2ytqxit","v":{"30":"fwlk2zvx1k31i5bo85ju65w0","90":"jw19eofsmf0x94pmkxxcr7xe","forever":"v8eaghwkrvr2xj9rm2z9f8gs"}},"prince":{"id":"ayqea9d4z4b40739i1p062fo","v":{"30":"azwmp043zgykj72qcitx834t","90":"rt2ljjibvgltwldgmr8bnt39","forever":"a0xdvvhe6ir4v35l3sjjwgr1"}},"elite":{"id":"a99s95mj0dxjguh2osmdm80r","v":{"30":"x566labbmj3h2fltkwbe9hgt","90":"o9f93dbvoq8a7jgp82uv7ffd","forever":"mwxmo4fxvgz3gnc37m1zg307"}},"king":{"id":"kx5od2120yodndwbfr3hci3g","v":{"30":"btfk4wo0hzqr28inund9l4ed","90":"ep34j69et64f9cgaovej0pax","forever":"ply8q3psbou4f95njczfz11k"}},"archont":{"id":"pomjf085s14ulvix3crb0e7o","v":{"30":"h7vn5a859fgye5sx3zxo4475","90":"h2f1z7nz487r4t00kgj1mhvm","forever":"hk5f00s611a2ywljfloimvjz"}},"oktavian":{"id":"ieq00x5qtesuxoyg3nonzsbd","v":{"30":"qmsog4q6r84wo5xrzvcvyb1t","90":"eh2cu7mgf3gm32rlebs0wf6j","forever":"e6xudv8dlptvmlce05afaq3i"}},"custom":{"id":"xhklxs1p5hcnwqb4vuyv8cl5","v":{"30":"wg3fk4o0cz6n0z7thruml7s2","90":"xrsodcauom1822ijgb15sttk","forever":"ocdxibxdjned9wdt5w6r7yr9"}},"tfly":{"id":"kcf9sw95wgfpsgzjzo5lao4t"},"kit_builder":{"id":"ltefwkqa6877tv7xta2u25e1"},"kit_farmer":{"id":"rdswx4lfvwy66tk0qsli74sm"},"kit_miner":{"id":"eejtf57s9mwg87h6ess5a3ge"},"kit_fisher":{"id":"ihrkfmy6gg9m2vcbl0lel5dj"},"kit_pvp":{"id":"e6wb008lgwwwph2xjtovf5ha"},"kit_hunter":{"id":"wevp1inu2brfgbabfs3yap4v"},"kit_alchemist":{"id":"iouifq0en4ybvhutvxensejw"},"crate_privilege":{"id":"yahehi8j9p8ndy36jvszkmt9"},"crate_crystal":{"id":"zcfzti3bctb8byt7bu438gfv"},"crate_money":{"id":"nshky06jtls3j7yv34xi09xx"},"crate_item":{"id":"b7pdx5m410ba3o2pjiaxbxax"},"crate_title":{"id":"dqe3fywmd8vfag7ane9kvnck"},"crate_title_3":{"id":"dk336ktxngpg351z2kfxwlcd"},"crate_title_5":{"id":"w4hml8x481edyj7sldtvch3q"},"crate_privilege_3":{"id":"viehazl5iqp9ukimea0vdxz5"},"crate_privilege_5":{"id":"fyosstakwsge7y4zydhopsj3"},"crate_crystal_5":{"id":"o5v6x8dn3lo19ayiyvuxu5g5"},"spawner_zombie":{"id":"fncy2232k2marqp1pmyts25k"},"spawner_skeleton":{"id":"b7mc75hkyapljf8n276gcwn4"},"spawner_creeper":{"id":"sh8zxmzgd183smtee7vhr9dw"},"spawner_blaze":{"id":"yv82csluf1s1wfmtlb8fxfh3"},"spawner_golem":{"id":"vjswrft9rrljlu43ejyth9n5"},"prom_pickaxe":{"id":"q8eca5lbajvahref0pnlz04u"},"prom_axe":{"id":"xojnlvjmm6dmbnghcywa0xnu"},"prom_shovel":{"id":"c856ifne6t1n06whx4msz4pk"},"minion_universal":{"id":"fhohxvc4x2mky78ae5iqc3q7"},"skin_homeboby":{"id":"qo1w9kw900ov8pq2nzaugpn2"},"skin_lelouch":{"id":"bp69ckedu0rv6il0tsk6v7lx"},"skin_cc":{"id":"bjj1vhawtkfs8xvcdh3kes07"},"skin_nekmeng":{"id":"g4qnartrwed27gsshwa2dzqm"},"skin_minion":{"id":"pfelr8pmbyhjef8ey4k60476"},"skin_pudge":{"id":"r8cwjil6kypccnubzglfly3b"},"skin_cure":{"id":"zjy0eud47xvqxn8pvb0sthks"},"skin_kub1ik":{"id":"txwt5vg65i849tbvsfyccwp8"},"skin_pepe":{"id":"zdvws9mahpfib1afuzzuef47"},"skin_xx4xx":{"id":"eerpys1jibnuosi4ran5hi9b"},"skin_lettyrxzx":{"id":"km4c2qrfqk3554jaw26inmxm"},"city_2":{"id":"sbivpfcold2sfkihvjacg83p"},"city_3":{"id":"mukv02osy2beiccm5qsxczzb"},"city_4":{"id":"jx18vz2yai3dn34qlygku6hc"},"city_5":{"id":"jaqelebtogcsic24oi7euep2"},"city_6":{"id":"v88lyedccfckm63rh16j9iag"},"city_restore":{"id":"lqunjfokgacg2tdczorgrnng"},"unban":{"id":"apdhokaa8k2349azi9wa4vrk"},"unmute":{"id":"tvmru5q6hor6j41fnifcqznv"},"rise":{"id":"l5y3vs4y3nor15x5t5f5z1sw"},"coins_100":{"id":"bje22qievvj5s5hlmsdkndxc"},"coins_500":{"id":"gxdy1o19i3kbjrd3236nahmt"},"coins_1000":{"id":"hdv77c8uhie8bx4mlnrsfoi4"}};
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

  if (!/^[A-Za-z0-9_]{1,32}$/.test(String(customer || "")))
    return j({ error: "Некорректный ник." }, 400, ch);
  if (!/^\S+@\S+\.\S+$/.test(String(email || "")))
    return j({ error: "Некорректный email." }, 400, ch);

  if (env.MILLIDA_KEY) return payMillida(body, env, ch);

  if (!Array.isArray(products) || !products.length)
    return j({ error: "Корзина пуста." }, 400, ch);
  if (products.length > MAX_PRODUCTS)
    return j({ error: `В одном заказе можно оплатить не больше ${MAX_PRODUCTS} разных товаров. Разбейте покупку.` }, 400, ch);

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

/** Счёт в Millida по каталогу: цену, скидку по промокоду и выдачу Millida считает сама. */
async function payMillida(body, env, ch) {
  const { customer, email, items, coupon } = body;
  if (!Array.isArray(items) || !items.length) return j({ error: "Корзина пуста." }, 400, ch);
  const lines = [];
  for (const it of items) {
    const t = MILLIDA[String(it && it.id)];
    const qty = Math.max(1, Math.floor(Number(it && it.qty) || 1));
    if (!t) return j({ error: "Один из товаров больше не продаётся — обновите страницу." }, 200, ch);
    const line = { productId: t.id, quantity: qty };
    if (t.v) {
      const vid = t.v[String(it.variant || "30")];
      if (!vid) return j({ error: "Выберите срок привилегии." }, 200, ch);
      line.variantId = vid;
    }
    lines.push(line);
  }
  const origin = ALLOWED.includes(body.origin) ? body.origin : "https://nationrise.space";
  const payload = {
    externalId: "nr-" + crypto.randomUUID(),
    playerNickname: String(customer),
    customerEmail: String(email),
    items: lines,
    successUrl: origin + "/?paid=1",
    failureUrl: origin + "/?paid=0",
  };
  if (coupon) payload.promoCode = String(coupon);
  let res, data;
  try {
    res = await fetch(MILLIDA_API, {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.MILLIDA_KEY, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });
    data = await res.json();
  } catch (e) {
    return j({ error: "Платёжный сервис не отвечает. Попробуйте чуть позже." }, 200, ch);
  }
  if (res.ok && data && data.paymentUrl) return j({ url: data.paymentUrl }, 200, ch);
  const msg = data && data.message;
  const text = Array.isArray(msg) ? msg.join("; ") : (msg || "");
  if (res.status === 401 || res.status === 403) return j({ error: "Касса временно недоступна. Напишите администрации." }, 200, ch);
  return j({ error: text ? "Платёж не создан: " + text : "Не удалось создать платёж. Попробуйте позже." }, 200, ch);
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
