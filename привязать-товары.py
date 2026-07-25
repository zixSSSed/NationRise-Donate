# -*- coding: utf-8 -*-
"""
Подтягивает товары из EasyDonate и прописывает их ID в index.html.

Зачем: на сайте у каждого товара есть поле edId (у привилегий — ed с тремя сроками).
Пока оно пустое, кнопка оплаты не работает. Скрипт находит товар в EasyDonate
по названию и подставляет его ID — вручную ничего переписывать не нужно.

Как пользоваться:
    py -3.13 привязать-товары.py <ключ-магазина>

Ключ нигде не сохраняется, передаётся только аргументом.

Как скрипт сопоставляет товары: по названию, без учёта регистра и лишних пробелов.
У привилегий ожидаются названия вида «Октавиан [30 дней]», «Октавиан [90 дней]»,
«Октавиан [навсегда]» — в квадратных скобках срок. Что не совпало — покажет списком.
"""
import json
import re
import sys
import urllib.request

API = "https://easydonate.ru/api/v3/shop/products"
HTML = "index.html"

# срок у привилегии -> как он может быть записан в названии товара EasyDonate
DUR_WORDS = {
    "30": ["30 дней", "30 дн", "30d", "месяц"],
    "90": ["90 дней", "90 дн", "90d", "3 месяца"],
    "forever": ["навсегда", "forever", "вечно", "бессрочно"],
}


def fetch(key):
    req = urllib.request.Request(API, headers={"Shop-Key": key, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.loads(r.read().decode("utf-8"))
    if not d.get("success"):
        sys.exit("EasyDonate отказал: %s" % d.get("response"))
    return d.get("response") or []


def norm(s):
    """Нормализуем название: нижний регистр, ё->е, схлопнутые пробелы."""
    return re.sub(r"\s+", " ", (s or "").lower().replace("ё", "е")).strip()


def base_and_dur(name):
    """«Октавиан [30 дней]» -> («октавиан», «30»). Если срока нет — (имя, None)."""
    n = norm(name)
    m = re.match(r"^(.*?)\s*[\[(]([^\])]+)[\])]\s*$", n)
    if not m:
        return n, None
    base, tail = m.group(1).strip(), m.group(2).strip()
    for code, words in DUR_WORDS.items():
        if any(w in tail for w in words):
            return base, code
    return base, None


def site_products(html):
    """Достаём из index.html id, name и признак «есть варианты сроков»."""
    out = []
    for m in re.finditer(r'\{id:"([^"]+)"[^\n]*?name:"([^"]+)"([^\n]*)', html):
        pid, name, rest = m.group(1), m.group(2), m.group(3)
        out.append({"pid": pid, "name": name, "variants": "variants:" in rest})
    return out


def main():
    if len(sys.argv) < 2:
        sys.exit("Укажи ключ магазина: py -3.13 привязать-товары.py <ключ>")
    key = sys.argv[1].strip()

    remote = fetch(key)
    if not remote:
        sys.exit("В магазине EasyDonate пока нет ни одного товара — сначала создай их в панели.")
    print("товаров в EasyDonate: %d" % len(remote))

    # индекс: (базовое имя, срок) -> id
    index = {}
    for p in remote:
        b, d = base_and_dur(p.get("name"))
        index[(b, d)] = p.get("id")

    html = open(HTML, encoding="utf-8").read()
    original = html
    linked, missed = [], []

    for sp in site_products(html):
        base = norm(sp["name"])
        if sp["variants"]:
            found = {}
            for code in ("30", "90", "forever"):
                pid = index.get((base, code))
                if pid:
                    found[code] = pid
            if len(found) == 3:
                ed = "ed:{" + ",".join('"%s":%d' % (c, found[c]) for c in ("30", "90", "forever")) + "}"
                html = re.sub(r'(\{id:"%s",[^\n]*?)ed:\{[^}]*\}' % re.escape(sp["pid"]),
                              lambda m: m.group(1) + ed, html, count=1)
                linked.append("%s -> %s" % (sp["name"], found))
            else:
                missed.append("%s (нашлось сроков: %d из 3)" % (sp["name"], len(found)))
        else:
            pid = index.get((base, None)) or index.get((base, "30"))
            if pid:
                html = re.sub(r'(\{id:"%s",[^\n]*?)edId:\s*(?:null|\d+)' % re.escape(sp["pid"]),
                              lambda m: m.group(1) + "edId:%d" % pid, html, count=1)
                linked.append("%s -> %d" % (sp["name"], pid))
            else:
                missed.append(sp["name"])

    if html != original:
        open(HTML, "w", encoding="utf-8", newline="\n").write(html)
        print("\nпривязано товаров: %d" % len(linked))
        for s in linked:
            print("   " + s)
    else:
        print("\nничего не изменилось")

    if missed:
        print("\nне нашлись в EasyDonate (создай их там с такими же названиями):")
        for s in missed:
            print("   " + s)


if __name__ == "__main__":
    main()
