# Товары для панели EasyDonate

Создай товары с **точно такими названиями** — тогда скрипт `привязать-товары.py`
сам подставит их ID на сайт, вручную ничего копировать не придётся.

Команда выдачи вписывается в поле «Команды» товара. `%player%` подставит ник покупателя.

Наборы, предметы и восстановление города требуют, чтобы игрок был в сети — если он офлайн,
покупка встаёт в очередь и выдаётся при первом входе. Проверить очередь: `/nrgive queue`.


## Привилегии

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| Дворянин [30 дней] | 79 | `kmrank set %player% noble 30` |
| Дворянин [90 дней] | 179 | `kmrank set %player% noble 90` |
| Дворянин [навсегда] | 249 | `kmrank set %player% noble` |
| Принц [30 дней] | 129 | `kmrank set %player% prince 30` |
| Принц [90 дней] | 289 | `kmrank set %player% prince 90` |
| Принц [навсегда] | 399 | `kmrank set %player% prince` |
| Элита [30 дней] | 219 | `kmrank set %player% elite 30` |
| Элита [90 дней] | 479 | `kmrank set %player% elite 90` |
| Элита [навсегда] | 699 | `kmrank set %player% elite` |
| Король [30 дней] | 349 | `kmrank set %player% king 30` |
| Король [90 дней] | 749 | `kmrank set %player% king 90` |
| Король [навсегда] | 1099 | `kmrank set %player% king` |
| Архонт [30 дней] | 599 | `kmrank set %player% archon 30` |
| Архонт [90 дней] | 1299 | `kmrank set %player% archon 90` |
| Архонт [навсегда] | 1899 | `kmrank set %player% archon` |
| Октавиан [30 дней] | 1249 | `kmrank set %player% octavian 30` |
| Октавиан [90 дней] | 2699 | `kmrank set %player% octavian 90` |
| Октавиан [навсегда] | 3699 | `kmrank set %player% octavian` |
| Custom [30 дней] | 1699 | `kmrank set %player% custom 30` |
| Custom [90 дней] | 3199 | `kmrank set %player% custom 90` |
| Custom [навсегда] | 4199 | `kmrank set %player% custom` |

## Наборы

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| Набор строителя | 89 | `nrgive kit %player% builder` |
| Набор фермера | 89 | `nrgive kit %player% farmer` |
| Набор шахтёра | 89 | `nrgive kit %player% miner` |
| Набор рыбака | 89 | `nrgive kit %player% fisher` |
| Набор бойца | 89 | `nrgive kit %player% pvp` |
| Набор охотника | 89 | `nrgive kit %player% hunter` |
| Набор алхимика | 89 | `nrgive kit %player% alchemist` |

## Ресурсы

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| Набор железа | 49 | `nrgive item %player% IRON_INGOT 64` |
| Набор алмазов | 149 | `nrgive item %player% DIAMOND 32` |
| Набор незерита | 399 | `nrgive item %player% NETHERITE_INGOT 8` |

## Спавнеры

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| Спавнер зомби | 199 | `nrgive item %player% SPAWNER_ZOMBIE` |
| Спавнер скелета | 199 | `nrgive item %player% SPAWNER_SKELETON` |
| Спавнер крипера | 249 | `nrgive item %player% SPAWNER_CREEPER` |
| Спавнер ифрита | 349 | `nrgive item %player% SPAWNER_BLAZE` |
| Спавнер голема | 449 | `nrgive item %player% SPAWNER_IRON_GOLEM` |

## Инструменты Прометея

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| Кирка Прометея | 119 | `nrgive item %player% EFFPICK` |
| Топор Прометея | 99 | `nrgive item %player% EFFAXE` |
| Лопата Прометея | 89 | `nrgive item %player% EFFSHOVEL` |

## Уровни города

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| Город → Уровень 2 | 299 | `nrgive citylevel %player% 2` |
| Город → Уровень 3 | 599 | `nrgive citylevel %player% 3` |
| Город → Уровень 4 | 999 | `nrgive citylevel %player% 4` |
| Город → Уровень 5 | 1599 | `nrgive citylevel %player% 5` |
| Город → Уровень 6 | 2499 | `nrgive citylevel %player% 6` |

## Восстановление

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| Восстановление города | 139 | `nrgive cityrestore %player%` |

## Снятие наказаний

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| Разбан | 299 | `unban %player%` |
| Размут | 99 | `unmute %player%` |

## Райзики

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| Райзики | сколько введёт | `nrgive rise %player% <кол-во>` |

## Монеты

| Название товара | Цена ₽ | Команда выдачи |
|---|---|---|
| 100 монет | 40 | `nrgive coins %player% 100` |
| 500 монет | 180 | `nrgive coins %player% 500` |
| 1000 монет | 340 | `nrgive coins %player% 1000` |

## Про райзики

В EasyDonate нельзя ввести произвольное количество, поэтому сделай
несколько фиксированных товаров, например «100 райзиков», «500 райзиков», «1000 райзиков»,
и в каждом укажи своё число в команде. На сайте поле ввода останется —
оно подберёт ближайший подходящий товар.
