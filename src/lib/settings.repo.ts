import { getDb } from './db';

const ALLOWED_KEYS = new Set([
  'company_name', 'company_legal_name', 'company_site', 'company_description',
  'company_phone', 'company_phone_raw', 'company_email', 'company_working_hours',
  'company_address_full', 'company_address_city', 'company_address_region',
  'company_address_postal', 'company_address_country',
  'company_inn', 'company_ogrn', 'company_founded_year',
  'company_social_telegram', 'company_social_vk',
  'metrika_id',
]);

export const settingsRepo = {
  get(key: string): string | undefined {
    const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value;
  },

  getAll(): Record<string, string> {
    const rows = getDb().prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  },

  set(key: string, value: string): void {
    getDb().prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run(key, value);
  },

  setMany(data: Record<string, string>): void {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `);
    const tx = db.transaction((entries: [string, string][]) => {
      for (const [key, value] of entries) {
        if (ALLOWED_KEYS.has(key)) {
          stmt.run(key, String(value));
        }
      }
    });
    tx(Object.entries(data));
  },

  /** Собирает объект company из настроек (для шаблонов сайта) */
  getCompany() {
    const s = this.getAll();
    return {
      name: s.company_name || '',
      legalName: s.company_legal_name || '',
      site: s.company_site || '',
      phone: s.company_phone || '',
      phoneRaw: s.company_phone_raw || '',
      email: s.company_email || '',
      address: {
        full: s.company_address_full || '',
        city: s.company_address_city || '',
        region: s.company_address_region || '',
        postalCode: s.company_address_postal || '',
        country: s.company_address_country || '',
      },
      workingHours: s.company_working_hours || '',
      inn: s.company_inn || '',
      ogrn: s.company_ogrn || '',
      socials: {
        telegram: s.company_social_telegram || '',
        vk: s.company_social_vk || '',
      },
      foundedYear: parseInt(s.company_founded_year || '2017', 10),
      description: s.company_description || '',
    };
  },
};
