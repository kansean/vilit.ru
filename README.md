# vilit.ru — Бизнес-сайт с админ-панелью

Сайт компании **Вилит** — автоматизация розничной торговли в РФ. Оборудование (ККТ, ФН, сканеры, принтеры, ТСД), услуги (ОФД, маркировка, ЕГАИС, ЭЦП), отраслевые решения для магазинов, кафе, аптек и др.

---

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Фреймворк | [Astro 5](https://astro.build/) (режим `server` — полный SSR) |
| CSS | [Tailwind CSS 4](https://tailwindcss.com/) через `@tailwindcss/vite` |
| Язык | TypeScript (strict) |
| База данных | SQLite через [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Markdown-рендер | [marked](https://github.com/markedjs/marked) |
| Админка (UI) | [Alpine.js](https://alpinejs.dev/) (CDN, 17 KB) |
| Серверный адаптер | [@astrojs/node](https://docs.astro.build/en/guides/adapters/) (standalone) |
| Иконки | [astro-icon](https://github.com/natemoo-re/astro-icon) (Iconify: heroicons + mdi) |
| Шрифт | Inter Variable (self-hosted, cyrillic + latin) |
| Уведомления | Telegram Bot API |

---

## Архитектура

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Сайт      │────→│   REST API   │←────│  Админка   │
│ (SSR pages) │     │  /api/v1/*   │     │  /admin/*  │
└─────────────┘     └──────┬───────┘     └────────────┘
                           │
                    ┌──────┴───────┐
                    │  Репозитории  │
                    │  (src/lib/)   │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │   SQLite     │
                    │ data/app.db  │
                    └──────────────┘
```

**Все страницы сайта** рендерятся на сервере (SSR) из SQLite. Контент хранится в формате Markdown и конвертируется в HTML через `marked` при каждом запросе.

**Админ-панель** — набор Astro-страниц с Alpine.js для интерактивности. Формы отправляют данные через REST API, который сохраняет их в ту же SQLite-базу.

**Публичные формы** (обратный звонок, заявка, калькулятор) сохраняют лиды в БД и отправляют уведомление в Telegram.

---

## Структура проекта

```
vilit.ru/
├── astro.config.mjs          # Конфигурация Astro (output: server)
├── package.json
├── .env.example               # Шаблон переменных окружения
├── data/
│   └── app.db                 # SQLite база данных (создаётся автоматически)
├── scripts/
│   └── migrate.ts             # Миграция контента из MD-файлов в SQLite
├── public/
│   ├── fonts/                 # Inter Variable (woff2)
│   └── images/                # Статические изображения
├── src/
│   ├── lib/                   # Слой работы с данными
│   │   ├── db.ts              # Подключение SQLite, инициализация таблиц
│   │   ├── schema.ts          # SQL-схема (7 таблиц)
│   │   ├── markdown.ts        # Рендеринг Markdown → HTML
│   │   ├── auth.ts            # Аутентификация (cookie-сессии + API-ключ)
│   │   ├── services.repo.ts   # CRUD для услуг
│   │   ├── industries.repo.ts # CRUD для отраслей
│   │   ├── equipment.repo.ts  # CRUD для оборудования
│   │   ├── blog.repo.ts       # CRUD для блога
│   │   ├── leads.repo.ts      # CRUD для заявок (лидов)
│   │   └── settings.repo.ts   # CRUD для настроек
│   ├── middleware.ts           # Защита /admin/* и /api/v1/*
│   ├── pages/
│   │   ├── api/
│   │   │   ├── callback.ts    # POST — обратный звонок → лид + Telegram
│   │   │   ├── request.ts     # POST — заявка → лид + Telegram
│   │   │   ├── calculator.ts  # POST — калькулятор → лид + Telegram
│   │   │   └── v1/            # REST API (см. раздел «API»)
│   │   ├── admin/             # Админ-панель (14 страниц)
│   │   ├── uslugi/            # Страницы услуг (SSR из БД)
│   │   ├── dlya-biznesa/      # Страницы отраслей (SSR из БД)
│   │   ├── oborudovanie/      # Каталог оборудования (SSR из БД)
│   │   ├── blog/              # Блог (SSR из БД)
│   │   └── index.astro        # Главная страница
│   ├── layouts/               # Макеты страниц
│   ├── components/
│   │   ├── admin/             # Компоненты админки
│   │   ├── forms/             # Формы сайта
│   │   ├── sections/          # Секции главной страницы
│   │   ├── seo/               # JSON-LD, SEO-компоненты
│   │   ├── layout/            # Header, Footer, Breadcrumbs
│   │   └── ui/                # UI-компоненты (Button, Card, etc.)
│   ├── data/                  # Статические данные (navigation, partners)
│   ├── utils/                 # Утилиты (notify, formatters, breadcrumbs)
│   └── content/               # Исходные MD-файлы (архив, данные уже в БД)
└── dist/                      # Собранный проект (после npm run build)
```

---

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# Telegram-уведомления (необязательно для разработки)
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id

# Админка (обязательно)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ваш_надёжный_пароль

# API-ключ для внешних интеграций (Telegram-бот и т.д.)
API_KEY=ваш_случайный_ключ_32_символа

# Секрет сессий
SESSION_SECRET=ваш_случайный_секрет_32_символа
```

### 3. Миграция контента в базу данных

При первом запуске нужно перенести контент из Markdown-файлов в SQLite:

```bash
npx tsx scripts/migrate.ts
```

Скрипт создаст файл `data/app.db` и наполнит его:
- 10 услуг
- 12 отраслей
- 15 товаров оборудования
- 6 статей блога
- 19 настроек компании

> Если `data/app.db` уже существует, миграция перезапишет данные (INSERT OR REPLACE).

### 4. Запуск dev-сервера

```bash
npm run dev
```

Сайт будет доступен на `http://localhost:4321`.

### 5. Вход в админку

Откройте `http://localhost:4321/admin/login` и войдите с логином/паролем из `.env`.

---

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера с hot-reload |
| `npm run build` | Продакшен-сборка в `dist/` |
| `npm run preview` | Предпросмотр собранной версии |
| `npx tsx scripts/migrate.ts` | Миграция MD-файлов → SQLite |

---

## База данных

### Таблицы

| Таблица | Описание | Полей |
|---------|----------|-------|
| `services` | Услуги (ККТ, ОФД, маркировка и т.д.) | 19 |
| `industries` | Отрасли (кафе, магазин, аптека и т.д.) | 17 |
| `equipment` | Оборудование (сканеры, кассы, ТСД и т.д.) | 18 |
| `blog` | Статьи блога | 13 |
| `settings` | Настройки (реквизиты, контакты, метрика) | 3 |
| `leads` | Заявки с форм сайта | 12 |
| `sessions` | Сессии авторизации | 3 |

### Формат хранения

- Простые поля — `TEXT`, `INTEGER`
- Массивы (`features`, `tags`, `faq`) — `TEXT` с JSON-сериализацией (`JSON.stringify`)
- Markdown-контент — `TEXT` (рендерится в HTML при отдаче страницы)
- Даты — `TEXT` в формате ISO 8601

### Расположение

Файл БД: `data/app.db`. Создаётся автоматически при первом обращении. Добавлен в `.gitignore`.

---

## REST API

### Авторизация

Два способа доступа к `/api/v1/*`:

1. **Cookie `session`** — автоматически устанавливается при входе через `/admin/login`
2. **Заголовок `X-API-Key`** — для внешних интеграций (значение из `.env`)

```bash
# Пример: вход
curl -X POST http://localhost:4321/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme123"}'

# Пример: запрос с API-ключом
curl http://localhost:4321/api/v1/services \
  -H "X-API-Key: ваш_ключ"
```

### Эндпоинты

#### Аутентификация

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/v1/auth/login` | Вход (username, password) → Set-Cookie |
| POST | `/api/v1/auth/logout` | Выход → очистка cookie |

#### Контент (одинаковый формат для services, industries, equipment, blog)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/v1/{тип}` | Список всех записей |
| GET | `/api/v1/{тип}/{id}` | Получить одну запись |
| POST | `/api/v1/{тип}` | Создать запись |
| PUT | `/api/v1/{тип}/{id}` | Обновить запись |
| DELETE | `/api/v1/{тип}/{id}` | Удалить запись |

Где `{тип}` — `services`, `industries`, `equipment` или `blog`.

#### Заявки (лиды)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/v1/leads` | Список (фильтры: `?status=new&type=callback`) |
| GET | `/api/v1/leads/{id}` | Детали заявки |
| PUT | `/api/v1/leads/{id}` | Обновить статус (`{ "status": "done" }`) |
| DELETE | `/api/v1/leads/{id}` | Удалить заявку |

Статусы заявок: `new` → `processing` → `done`.

#### Настройки

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/v1/settings` | Все настройки (key-value) |
| PUT | `/api/v1/settings` | Обновить несколько настроек |

#### Публичные формы (без авторизации)

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/callback` | Обратный звонок → лид + Telegram |
| POST | `/api/request` | Полная заявка → лид + Telegram |
| POST | `/api/calculator` | Заявка из калькулятора → лид + Telegram |

---

## Админ-панель

### Страницы

| URL | Описание |
|-----|----------|
| `/admin/login` | Страница входа |
| `/admin` | Dashboard — счётчики контента + последние 5 заявок |
| `/admin/services` | Таблица услуг |
| `/admin/services/{id}` | Редактирование / создание услуги |
| `/admin/services/new` | Создание новой услуги |
| `/admin/industries` | Таблица отраслей |
| `/admin/industries/{id}` | Редактирование / создание отрасли |
| `/admin/equipment` | Таблица оборудования |
| `/admin/equipment/{id}` | Редактирование / создание товара |
| `/admin/blog` | Таблица статей |
| `/admin/blog/{id}` | Редактирование / создание статьи |
| `/admin/leads` | Таблица заявок (фильтры по статусу) |
| `/admin/leads/{id}` | Детали заявки, смена статуса |
| `/admin/settings` | Настройки компании, контакты, реквизиты, Метрика |

### Возможности

- **CRUD для всего контента** — создание, редактирование, удаление услуг, отраслей, оборудования, статей
- **Редактор массивов** — динамическое добавление/удаление особенностей, этапов, FAQ
- **Редактор характеристик** — key-value пары для оборудования (параметр → значение)
- **Markdown-редактор** — textarea для основного контента страницы
- **Управление заявками** — просмотр, фильтрация по статусу/типу, смена статуса
- **Настройки компании** — телефон, email, адрес, реквизиты, соцсети, Яндекс.Метрика
- **Защита** — все страницы `/admin/*` требуют авторизации, редирект на `/admin/login`

---

## Публичный сайт

### Контент из БД

Все страницы рендерятся на сервере (SSR) и читают данные из SQLite:

| URL | Источник | Кол-во |
|-----|----------|--------|
| `/uslugi/{slug}` | Таблица `services` | 10 |
| `/uslugi` | Таблица `services` (список) | — |
| `/dlya-biznesa/{slug}` | Таблица `industries` | 12 |
| `/dlya-biznesa` | Таблица `industries` (список) | — |
| `/oborudovanie` | Таблица `equipment` (по категориям) | — |
| `/oborudovanie/{category}` | Таблица `equipment` (фильтр) | 5 категорий |
| `/oborudovanie/{category}/{slug}` | Таблица `equipment` | 15 |
| `/blog/{slug}` | Таблица `blog` | 6 |
| `/blog` | Таблица `blog` (список) | — |

### Категории оборудования

| Slug | Название |
|------|----------|
| `skanery` | Сканеры штрихкодов |
| `printery-chekov` | Принтеры чеков |
| `printery-etiketok` | Принтеры этикеток |
| `tsd` | Терминалы сбора данных (ТСД) |
| `kassy` | Кассы |

### Формы

Все формы сохраняют заявку в БД и отправляют уведомление в Telegram:

- **QuickCallbackForm** — модальное окно «Обратный звонок» (имя + телефон)
- **InlineLeadForm** — врезка на страницах (имя + телефон)
- **FullRequestForm** — полная форма заявки (имя, телефон, email, тип бизнеса, сообщение)
- **CalculatorForm** — калькулятор стоимости (выбор услуг + контакты)

### SEO

- JSON-LD структурированные данные на каждой странице (Organization, Service, Product, Article, FAQ, BreadcrumbList)
- Sitemap генерируется автоматически через `@astrojs/sitemap`
- Meta-теги (title, description) берутся из БД

---

## Деплой

### Сборка

```bash
npm run build
```

Результат — в `dist/`. Запуск:

```bash
node dist/server/entry.mjs
```

Сервер стартует на порту 4321 (по умолчанию).

### Что нужно настроить перед продакшеном

1. **`.env`** — реальные значения для `ADMIN_PASSWORD`, `API_KEY`, `SESSION_SECRET`
2. **Telegram** — `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`
3. **Админка → Настройки** — реальные реквизиты компании, телефон, email, адрес
4. **Админка → Настройки** — ID Яндекс.Метрики
5. **`src/components/seo/SEOHead.astro`** — yandex-verification код
6. **`src/pages/kontakty.astro`** — координаты офиса для Яндекс.Карт
7. **`public/images/partners/`** — реальные SVG-логотипы партнёров

### Docker (пример)

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ dist/
COPY data/ data/
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
```

> Файл `data/app.db` должен быть примонтирован как persistent volume, иначе данные потеряются при перезапуске контейнера.

---

## Безопасность

- Админка и API защищены через middleware (`src/middleware.ts`)
- Сессии хранятся в SQLite, HTTP-only cookie, SameSite=Strict
- API-ключ для внешних интеграций (заголовок `X-API-Key`)
- Страницы админки имеют `<meta name="robots" content="noindex, nofollow">`
- Пароль хранится в `.env`, не в коде и не в БД

---

## Расширение

### Добавление нового типа контента

1. Добавить таблицу в `src/lib/schema.ts`
2. Создать репозиторий `src/lib/newtype.repo.ts`
3. Создать API-эндпоинты `src/pages/api/v1/newtype/`
4. Создать страницы админки `src/pages/admin/newtype/`
5. Создать публичные страницы `src/pages/newtype/`

### Подключение Telegram-бота

Бот может управлять контентом и получать заявки через REST API:

```bash
# Получить все заявки
curl -H "X-API-Key: ваш_ключ" http://localhost:4321/api/v1/leads

# Изменить статус заявки
curl -X PUT -H "X-API-Key: ваш_ключ" \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}' \
  http://localhost:4321/api/v1/leads/1

# Получить список услуг
curl -H "X-API-Key: ваш_ключ" http://localhost:4321/api/v1/services

# Обновить настройки
curl -X PUT -H "X-API-Key: ваш_ключ" \
  -H "Content-Type: application/json" \
  -d '{"company_phone": "+7 (495) 999-99-99"}' \
  http://localhost:4321/api/v1/settings
```
