# Saffet Education — сайт

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4.
Референсы и разбор sitconnect.net и похожих сайтов лежат в `../references/`.

## Запуск

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # продакшен-сборка
```

## Данные

Сайт берёт вузы и программы из `../turkey_universities/sitconnect_turkey/<город>/`.
Скрипт сжимает их в `src/data/*.json` (42 вуза, 5 203 программы).
После того как обновите данные парсером, запустите:

```bash
npm run data
```

## Языки

Русский, азербайджанский и английский: адреса `/ru/...`, `/az/...`, `/en/...`.

- `/` перенаправляет на язык, выбранный раньше (cookie `NEXT_LOCALE`), иначе на язык браузера, иначе на русский (`src/proxy.ts`).
- Все тексты лежат в `src/i18n/dictionaries/{ru,az,en}.ts`. Русский словарь задаёт структуру: если в `az.ts` или `en.ts` пропустить ключ, TypeScript выдаст ошибку.
- В серверных компонентах: `const { t, locale, href } = await getI18n()`. `href("/programs")` даёт `/az/programs`.
- Новый язык: добавить код в `src/i18n/config.ts` и файл словаря.
- Названия вузов и программ остаются на английском, как в исходных данных.

## Структура

```
src/
  app/[lang]/                 все страницы внутри языкового сегмента
    page.tsx                  главная
    programs/page.tsx         поиск программ (фильтры в URL)
    programs/[id]/page.tsx    страница программы
    universities/page.tsx     список вузов
    universities/[slug]/      страница вуза
    apply/page.tsx            заявка
  i18n/                       языки: config, словари, getI18n()
  proxy.ts                    редирект на нужный язык
  components/                 шапка, футер, карточки, формы
  lib/
    data.ts                   загрузка данных и поиск
    format.ts                 форматирование цен, дат, сроков
    site.ts                   телефон, WhatsApp, почта, меню  ← заменить на реальные
  data/                       сгенерированные JSON
scripts/build-data.mjs        сборка src/data из спарсенных файлов
```

## Что заменить перед запуском

- `src/lib/site.ts`: телефон, номер WhatsApp, почта, соцсети.
- Логотип: `src/components/logo.tsx`.
- Цвета и шрифты: токены в `src/app/globals.css` (блок `@theme`).
- Обложки вузов сейчас сгенерированы (градиент + инициалы). Свои фото можно положить в `public/` и подключить в `UniCover`.
- Форма заявки пока открывает WhatsApp с готовым текстом. Отправка на сервер (Telegram-бот или почта) помечена `TODO` в `src/components/apply-form.tsx`.
