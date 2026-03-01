import { getDb } from './db';

export interface BlogRow {
  id: string;
  title: string;
  description: string;
  meta_title: string;
  meta_description: string;
  publish_date: string;
  updated_date: string | null;
  author: string;
  tags: string;
  related_services: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const blogRepo = {
  list(): BlogRow[] {
    return getDb().prepare('SELECT * FROM blog ORDER BY publish_date DESC').all() as BlogRow[];
  },

  getById(id: string): BlogRow | undefined {
    return getDb().prepare('SELECT * FROM blog WHERE id = ?').get(id) as BlogRow | undefined;
  },

  create(data: Omit<BlogRow, 'created_at' | 'updated_at'>): BlogRow {
    const db = getDb();
    db.prepare(`
      INSERT INTO blog (id, title, description, meta_title, meta_description, publish_date, updated_date, author, tags, related_services, content)
      VALUES (@id, @title, @description, @meta_title, @meta_description, @publish_date, @updated_date, @author, @tags, @related_services, @content)
    `).run(data);
    return this.getById(data.id)!;
  },

  update(id: string, data: Partial<Omit<BlogRow, 'id' | 'created_at' | 'updated_at'>>): BlogRow | undefined {
    const ALLOWED_FIELDS = new Set([
      'title', 'description', 'meta_title', 'meta_description',
      'publish_date', 'updated_date', 'author', 'tags', 'related_services', 'content',
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
    db.prepare(`UPDATE blog SET ${fields.join(', ')} WHERE id = @id`).run(values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = getDb().prepare('DELETE FROM blog WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count(): number {
    const row = getDb().prepare('SELECT COUNT(*) as cnt FROM blog').get() as { cnt: number };
    return row.cnt;
  },
};
