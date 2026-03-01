/**
 * Миграция контента из Markdown-файлов в SQLite.
 * Запуск: npx tsx scripts/migrate.ts
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../data/app.db');
const CONTENT_DIR = path.resolve(__dirname, '../src/content');

// --- Схема (дублируем, чтобы скрипт был самодостаточным) ---
const SCHEMA_SQL = `
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

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
`;

// --- Утилиты ---

function readMdFiles(dir: string): { id: string; data: Record<string, any>; content: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const { data, content } = matter(raw);
      const id = f.replace(/\.md$/, '');
      return { id, data, content: content.trim() };
    });
}

function toISODate(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return new Date(d).toISOString().split('T')[0];
}

// --- Миграция ---

function main() {
  console.log('Создание БД:', DB_PATH);
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA_SQL);

  // --- Services ---
  const services = readMdFiles(path.join(CONTENT_DIR, 'services'));
  const insertService = db.prepare(`
    INSERT OR REPLACE INTO services (id, title, description, meta_title, meta_description, icon, hero_title, hero_subtitle, price, price_note, sort_order, features, steps, faq, related_services, related_industries, content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of services) {
    const d = s.data;
    insertService.run(
      s.id,
      d.title || '',
      d.description || '',
      d.metaTitle || '',
      d.metaDescription || '',
      d.icon || '',
      d.heroTitle || '',
      d.heroSubtitle || '',
      d.price || null,
      d.priceNote || null,
      d.order || 0,
      JSON.stringify(d.features || []),
      JSON.stringify(d.steps || []),
      JSON.stringify(d.faq || []),
      JSON.stringify(d.relatedServices || []),
      JSON.stringify(d.relatedIndustries || []),
      s.content,
    );
  }
  console.log(`  services: ${services.length} записей`);

  // --- Industries ---
  const industries = readMdFiles(path.join(CONTENT_DIR, 'industries'));
  const insertIndustry = db.prepare(`
    INSERT OR REPLACE INTO industries (id, title, description, meta_title, meta_description, icon, hero_title, hero_subtitle, sort_order, pain_points, legal_requirements, equipment_list, faq, related_services, content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of industries) {
    const d = s.data;
    insertIndustry.run(
      s.id,
      d.title || '',
      d.description || '',
      d.metaTitle || '',
      d.metaDescription || '',
      d.icon || '',
      d.heroTitle || '',
      d.heroSubtitle || '',
      d.order || 0,
      JSON.stringify(d.painPoints || []),
      JSON.stringify(d.legalRequirements || []),
      JSON.stringify(d.equipment || []),
      JSON.stringify(d.faq || []),
      JSON.stringify(d.relatedServices || []),
      s.content,
    );
  }
  console.log(`  industries: ${industries.length} записей`);

  // --- Equipment ---
  const equipment = readMdFiles(path.join(CONTENT_DIR, 'equipment'));
  const insertEquipment = db.prepare(`
    INSERT OR REPLACE INTO equipment (id, title, description, meta_title, meta_description, category, brand, model, price, old_price, image, in_stock, features, specs, sort_order, content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of equipment) {
    const d = s.data;
    insertEquipment.run(
      s.id,
      d.title || '',
      d.description || '',
      d.metaTitle || '',
      d.metaDescription || '',
      d.category || '',
      d.brand || '',
      d.model || '',
      d.price || 0,
      d.oldPrice || null,
      d.image || null,
      d.inStock !== false ? 1 : 0,
      JSON.stringify(d.features || []),
      JSON.stringify(d.specs || {}),
      d.order || 0,
      s.content,
    );
  }
  console.log(`  equipment: ${equipment.length} записей`);

  // --- Blog ---
  const blog = readMdFiles(path.join(CONTENT_DIR, 'blog'));
  const insertBlog = db.prepare(`
    INSERT OR REPLACE INTO blog (id, title, description, meta_title, meta_description, publish_date, updated_date, author, tags, related_services, content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of blog) {
    const d = s.data;
    insertBlog.run(
      s.id,
      d.title || '',
      d.description || '',
      d.metaTitle || '',
      d.metaDescription || '',
      toISODate(d.publishDate),
      d.updatedDate ? toISODate(d.updatedDate) : null,
      d.author || 'Вилит',
      JSON.stringify(d.tags || []),
      JSON.stringify(d.relatedServices || []),
      s.content,
    );
  }
  console.log(`  blog: ${blog.length} записей`);

  // --- Settings (из company.ts) ---
  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
  `);
  const companySettings: Record<string, string> = {
    company_name: 'Вилит',
    company_legal_name: 'ООО «Вилит»',
    company_site: 'https://vilit.ru',
    company_phone: '+7 (495) 123-45-67',
    company_phone_raw: '+74951234567',
    company_email: 'info@vilit.ru',
    company_address_full: 'г. Москва, ул. Примерная, д. 1, офис 100',
    company_address_city: 'Москва',
    company_address_region: 'Москва',
    company_address_postal: '123456',
    company_address_country: 'RU',
    company_working_hours: 'Пн–Пт: 9:00–18:00',
    company_inn: '7700000000',
    company_ogrn: '1177700000000',
    company_social_telegram: 'https://t.me/vilit_ru',
    company_social_vk: 'https://vk.com/vilit_ru',
    company_founded_year: '2017',
    company_description: 'Автоматизация розничной торговли: онлайн-кассы, ОФД, маркировка, ЕГАИС, ЭЦП. Поставка оборудования и подключение сервисов для магазинов, кафе и сферы услуг.',
    metrika_id: '',
  };

  for (const [key, value] of Object.entries(companySettings)) {
    insertSetting.run(key, value);
  }
  console.log(`  settings: ${Object.keys(companySettings).length} записей`);

  db.close();
  console.log('\nМиграция завершена!');
}

main();
