/** SQL-схема базы данных vilit.ru */

export const SCHEMA_SQL = `
-- Услуги
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  hero_title TEXT NOT NULL DEFAULT '',
  hero_subtitle TEXT NOT NULL DEFAULT '',
  price TEXT,
  price_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  features TEXT DEFAULT '[]',
  steps TEXT DEFAULT '[]',
  faq TEXT DEFAULT '[]',
  related_services TEXT DEFAULT '[]',
  related_industries TEXT DEFAULT '[]',
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Отрасли
CREATE TABLE IF NOT EXISTS industries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  hero_title TEXT NOT NULL DEFAULT '',
  hero_subtitle TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  pain_points TEXT DEFAULT '[]',
  legal_requirements TEXT DEFAULT '[]',
  equipment_list TEXT DEFAULT '[]',
  faq TEXT DEFAULT '[]',
  related_services TEXT DEFAULT '[]',
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Оборудование
CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  price INTEGER NOT NULL,
  old_price INTEGER,
  image TEXT,
  in_stock INTEGER NOT NULL DEFAULT 1,
  features TEXT DEFAULT '[]',
  specs TEXT DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Блог
CREATE TABLE IF NOT EXISTS blog (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  updated_date TEXT,
  author TEXT NOT NULL DEFAULT 'Вилит',
  tags TEXT DEFAULT '[]',
  related_services TEXT DEFAULT '[]',
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Настройки (company data, metrika ID, etc.)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Лиды (заявки с форм)
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  business_type TEXT,
  message TEXT,
  services_list TEXT,
  total INTEGER,
  status TEXT NOT NULL DEFAULT 'new',
  source_page TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Сессии админа
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
`;
