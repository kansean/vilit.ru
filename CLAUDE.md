# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Проект

Бизнес-сайт **vilit.ru** — компания по автоматизации розничной торговли в РФ. Оборудование (ККТ, ФН, сканеры, принтеры, ТСД), услуги (ОФД, маркировка, ЕГАИС, ЭЦП), отраслевые решения.

## Команды

```bash
npm run dev      # Локальный dev-сервер
npm run build    # Продакшен-сборка → dist/
npm run preview  # Предпросмотр сборки
```

## Стек

- **Astro 5** (hybrid: static pages + server API endpoints)
- **Tailwind CSS 4** через `@tailwindcss/vite`
- **TypeScript** strict
- **@astrojs/node** адаптер для серверных API-эндпоинтов
- **astro-icon** (Iconify: heroicons + mdi)
- Контент: Markdown + Zod-схемы через Astro Content Collections (glob loader)

## Архитектура

### Контент-коллекции (`src/content.config.ts`)
6 коллекций: `services` (10), `industries` (12), `equipment` (15), `blog` (6), `faq` (пусто), `testimonials` (пусто). Glob loader генерирует ID с расширением `.md` — в `getStaticPaths()` slug очищается через `entry.id.replace(/\.md$/, '')`.

### Макеты (`src/layouts/`)
`BaseLayout` → `PageLayout` → специализированные (`ServiceLayout`, `IndustryLayout`, `EquipmentLayout`, `BlogLayout`). SEO-компоненты (`SEOHead`, `JsonLd*`) подключаются в макетах.

### Формы
3 формы: `QuickCallbackForm` (модалка), `InlineLeadForm` (врезка), `FullRequestForm` (полная). Плюс `CalculatorForm` (калькулятор стоимости). Все отправляют POST на `/api/*` и стреляют целью в Яндекс.Метрику через `window.ym`.

### API (`src/pages/api/`)
3 серверных эндпоинта: `callback.ts`, `request.ts`, `calculator.ts`. Помечены `export const prerender = false`. Используют `sendNotification()` из `src/utils/notify.ts` для Telegram-уведомлений.

### Данные (`src/data/`)
`company.ts` (реквизиты — ЗАГЛУШКИ), `navigation.ts`, `trust-numbers.ts`, `partners.ts`, `metrika.ts` (ID Метрики — пустой).

## Важные особенности

- Контент-конфиг обязательно в `src/content.config.ts` (не в корне — требование Astro 5)
- `output: 'static'` + `@astrojs/node` → API-эндпоинты серверные, остальное статика
- Яндекс.Метрика загружается условно: если `METRIKA_ID` непустой в `src/data/metrika.ts`
- Telegram-уведомления через env: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`
- Логотипы партнёров — SVG-плейсхолдеры, заменить на реальные
- Шрифт Inter Variable self-hosted в `public/fonts/`

## Что нужно заполнить перед деплоем

1. `src/data/company.ts` — реальные реквизиты компании
2. `src/data/metrika.ts` — ID счётчика Яндекс.Метрики
3. `.env` (по шаблону `.env.example`) — токен Telegram-бота и chat ID
4. `src/components/seo/SEOHead.astro` — yandex-verification код
5. `public/images/partners/` — реальные SVG-логотипы партнёров
6. Яндекс.Карта в `src/pages/kontakty.astro` — реальные координаты офиса
