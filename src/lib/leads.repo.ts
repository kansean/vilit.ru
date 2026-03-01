import { getDb } from './db';

export interface LeadRow {
  id: number;
  type: string;
  name: string | null;
  phone: string;
  email: string | null;
  business_type: string | null;
  message: string | null;
  services_list: string | null;
  total: number | null;
  status: string;
  source_page: string | null;
  created_at: string;
}

export interface LeadCreateData {
  type: string;
  name?: string | null;
  phone: string;
  email?: string | null;
  business_type?: string | null;
  message?: string | null;
  services_list?: string | null;
  total?: number | null;
  source_page?: string | null;
}

export const leadsRepo = {
  list(filters?: { status?: string; type?: string; limit?: number; offset?: number }): { items: LeadRow[]; total: number } {
    const db = getDb();
    const where: string[] = [];
    const params: any = {};

    if (filters?.status) {
      where.push('status = @status');
      params.status = filters.status;
    }
    if (filters?.type) {
      where.push('type = @type');
      params.type = filters.type;
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const totalRow = db.prepare(`SELECT COUNT(*) as cnt FROM leads ${whereClause}`).get(params) as { cnt: number };

    const limit = Math.min(Math.max(filters?.limit || 50, 1), 200);
    const offset = Math.max(filters?.offset || 0, 0);
    const items = db.prepare(`SELECT * FROM leads ${whereClause} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`).all({ ...params, limit, offset }) as LeadRow[];

    return { items, total: totalRow.cnt };
  },

  getById(id: number): LeadRow | undefined {
    return getDb().prepare('SELECT * FROM leads WHERE id = ?').get(id) as LeadRow | undefined;
  },

  create(data: LeadCreateData): LeadRow {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO leads (type, name, phone, email, business_type, message, services_list, total, source_page)
      VALUES (@type, @name, @phone, @email, @business_type, @message, @services_list, @total, @source_page)
    `).run({
      type: data.type,
      name: data.name || null,
      phone: data.phone,
      email: data.email || null,
      business_type: data.business_type || null,
      message: data.message || null,
      services_list: data.services_list || null,
      total: data.total || null,
      source_page: data.source_page || null,
    });
    return this.getById(Number(result.lastInsertRowid))!;
  },

  updateStatus(id: number, status: string): LeadRow | undefined {
    const VALID_STATUSES = ['new', 'processing', 'done'];
    if (!VALID_STATUSES.includes(status)) return this.getById(id);
    getDb().prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, id);
    return this.getById(id);
  },

  delete(id: number): boolean {
    const result = getDb().prepare('DELETE FROM leads WHERE id = ?').run(id);
    return result.changes > 0;
  },

  countNew(): number {
    const row = getDb().prepare("SELECT COUNT(*) as cnt FROM leads WHERE status = 'new'").get() as { cnt: number };
    return row.cnt;
  },

  count(): number {
    const row = getDb().prepare('SELECT COUNT(*) as cnt FROM leads').get() as { cnt: number };
    return row.cnt;
  },
};
