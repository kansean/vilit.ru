import { getDb } from './db';

export interface EquipmentRow {
  id: string;
  title: string;
  description: string;
  meta_title: string;
  meta_description: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  old_price: number | null;
  image: string | null;
  in_stock: number;
  features: string;
  specs: string;
  sort_order: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export const equipmentRepo = {
  list(): EquipmentRow[] {
    return getDb().prepare('SELECT * FROM equipment ORDER BY sort_order ASC').all() as EquipmentRow[];
  },

  listByCategory(category: string): EquipmentRow[] {
    return getDb().prepare('SELECT * FROM equipment WHERE category = ? ORDER BY sort_order ASC').all(category) as EquipmentRow[];
  },

  getById(id: string): EquipmentRow | undefined {
    return getDb().prepare('SELECT * FROM equipment WHERE id = ?').get(id) as EquipmentRow | undefined;
  },

  create(data: Omit<EquipmentRow, 'created_at' | 'updated_at'>): EquipmentRow {
    const db = getDb();
    db.prepare(`
      INSERT INTO equipment (id, title, description, meta_title, meta_description, category, brand, model, price, old_price, image, in_stock, features, specs, sort_order, content)
      VALUES (@id, @title, @description, @meta_title, @meta_description, @category, @brand, @model, @price, @old_price, @image, @in_stock, @features, @specs, @sort_order, @content)
    `).run(data);
    return this.getById(data.id)!;
  },

  update(id: string, data: Partial<Omit<EquipmentRow, 'id' | 'created_at' | 'updated_at'>>): EquipmentRow | undefined {
    const ALLOWED_FIELDS = new Set([
      'title', 'description', 'meta_title', 'meta_description', 'category',
      'brand', 'model', 'price', 'old_price', 'image', 'in_stock',
      'features', 'specs', 'sort_order', 'content',
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
    db.prepare(`UPDATE equipment SET ${fields.join(', ')} WHERE id = @id`).run(values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = getDb().prepare('DELETE FROM equipment WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count(): number {
    const row = getDb().prepare('SELECT COUNT(*) as cnt FROM equipment').get() as { cnt: number };
    return row.cnt;
  },

  categories(): string[] {
    const rows = getDb().prepare('SELECT DISTINCT category FROM equipment ORDER BY category').all() as { category: string }[];
    return rows.map(r => r.category);
  },

  listFiltered(filters: {
    category?: string;
    brands?: string[];
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
  }): EquipmentRow[] {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.category) {
      conditions.push('category = @category');
      params.category = filters.category;
    }
    if (filters.brands && filters.brands.length > 0) {
      const placeholders = filters.brands.map((_, i) => `@brand${i}`);
      conditions.push(`brand IN (${placeholders.join(', ')})`);
      filters.brands.forEach((b, i) => { params[`brand${i}`] = b; });
    }
    if (filters.priceMin != null) {
      conditions.push('price >= @priceMin');
      params.priceMin = filters.priceMin;
    }
    if (filters.priceMax != null) {
      conditions.push('price <= @priceMax');
      params.priceMax = filters.priceMax;
    }
    if (filters.inStock) {
      conditions.push('in_stock = 1');
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return getDb().prepare(`SELECT * FROM equipment ${where} ORDER BY sort_order ASC`).all(params) as EquipmentRow[];
  },

  brands(category?: string): string[] {
    const sql = category
      ? 'SELECT DISTINCT brand FROM equipment WHERE category = ? ORDER BY brand'
      : 'SELECT DISTINCT brand FROM equipment ORDER BY brand';
    const rows = category
      ? getDb().prepare(sql).all(category) as { brand: string }[]
      : getDb().prepare(sql).all() as { brand: string }[];
    return rows.map(r => r.brand);
  },

  priceRange(category?: string): { min: number; max: number } {
    const sql = category
      ? 'SELECT MIN(price) as min, MAX(price) as max FROM equipment WHERE category = ?'
      : 'SELECT MIN(price) as min, MAX(price) as max FROM equipment';
    const row = category
      ? getDb().prepare(sql).get(category) as { min: number; max: number }
      : getDb().prepare(sql).get() as { min: number; max: number };
    return { min: row.min || 0, max: row.max || 0 };
  },
};
