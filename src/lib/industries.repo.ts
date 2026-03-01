import { getDb } from './db';

export interface IndustryRow {
  id: string;
  title: string;
  description: string;
  meta_title: string;
  meta_description: string;
  icon: string;
  hero_title: string;
  hero_subtitle: string;
  sort_order: number;
  pain_points: string;
  legal_requirements: string;
  equipment_list: string;
  faq: string;
  related_services: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const industriesRepo = {
  list(): IndustryRow[] {
    return getDb().prepare('SELECT * FROM industries ORDER BY sort_order ASC').all() as IndustryRow[];
  },

  getById(id: string): IndustryRow | undefined {
    return getDb().prepare('SELECT * FROM industries WHERE id = ?').get(id) as IndustryRow | undefined;
  },

  create(data: Omit<IndustryRow, 'created_at' | 'updated_at'>): IndustryRow {
    const db = getDb();
    db.prepare(`
      INSERT INTO industries (id, title, description, meta_title, meta_description, icon, hero_title, hero_subtitle, sort_order, pain_points, legal_requirements, equipment_list, faq, related_services, content)
      VALUES (@id, @title, @description, @meta_title, @meta_description, @icon, @hero_title, @hero_subtitle, @sort_order, @pain_points, @legal_requirements, @equipment_list, @faq, @related_services, @content)
    `).run(data);
    return this.getById(data.id)!;
  },

  update(id: string, data: Partial<Omit<IndustryRow, 'id' | 'created_at' | 'updated_at'>>): IndustryRow | undefined {
    const ALLOWED_FIELDS = new Set([
      'title', 'description', 'meta_title', 'meta_description', 'icon',
      'hero_title', 'hero_subtitle', 'sort_order', 'pain_points',
      'legal_requirements', 'equipment_list', 'faq', 'related_services', 'content',
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
    db.prepare(`UPDATE industries SET ${fields.join(', ')} WHERE id = @id`).run(values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = getDb().prepare('DELETE FROM industries WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count(): number {
    const row = getDb().prepare('SELECT COUNT(*) as cnt FROM industries').get() as { cnt: number };
    return row.cnt;
  },
};
