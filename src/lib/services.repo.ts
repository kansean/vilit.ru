import { getDb } from './db';

export interface ServiceRow {
  id: string;
  title: string;
  description: string;
  meta_title: string;
  meta_description: string;
  icon: string;
  hero_title: string;
  hero_subtitle: string;
  price: string | null;
  price_note: string | null;
  sort_order: number;
  features: string;
  steps: string;
  faq: string;
  related_services: string;
  related_industries: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const servicesRepo = {
  list(): ServiceRow[] {
    return getDb().prepare('SELECT * FROM services ORDER BY sort_order ASC').all() as ServiceRow[];
  },

  getById(id: string): ServiceRow | undefined {
    return getDb().prepare('SELECT * FROM services WHERE id = ?').get(id) as ServiceRow | undefined;
  },

  create(data: Omit<ServiceRow, 'created_at' | 'updated_at'>): ServiceRow {
    const db = getDb();
    db.prepare(`
      INSERT INTO services (id, title, description, meta_title, meta_description, icon, hero_title, hero_subtitle, price, price_note, sort_order, features, steps, faq, related_services, related_industries, content)
      VALUES (@id, @title, @description, @meta_title, @meta_description, @icon, @hero_title, @hero_subtitle, @price, @price_note, @sort_order, @features, @steps, @faq, @related_services, @related_industries, @content)
    `).run(data);
    return this.getById(data.id)!;
  },

  update(id: string, data: Partial<Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'>>): ServiceRow | undefined {
    const ALLOWED_FIELDS = new Set([
      'title', 'description', 'meta_title', 'meta_description', 'icon',
      'hero_title', 'hero_subtitle', 'price', 'price_note', 'sort_order',
      'features', 'steps', 'faq', 'related_services', 'related_industries', 'content',
    ]);
    const db = getDb();
    const fields: string[] = [];
    const values: Record<string, unknown> = { id };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && ALLOWED_FIELDS.has(key)) {
        fields.push(`${key} = @${key}`);
        values[key] = value;
      }
    }
    if (fields.length === 0) return this.getById(id);

    fields.push("updated_at = datetime('now')");
    db.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = @id`).run(values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = getDb().prepare('DELETE FROM services WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count(): number {
    const row = getDb().prepare('SELECT COUNT(*) as cnt FROM services').get() as { cnt: number };
    return row.cnt;
  },
};
