import { getDb } from './db';

export interface SearchResult {
  type: 'equipment' | 'service' | 'blog';
  id: string;
  title: string;
  description: string;
  url: string;
  extra?: string;
}

export function siteSearch(query: string, limit = 30): SearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const db = getDb();
  const pattern = `%${query.trim()}%`;
  const results: SearchResult[] = [];

  // Оборудование
  const equipment = db.prepare(`
    SELECT id, title, description, category, brand
    FROM equipment
    WHERE title LIKE @q OR description LIKE @q OR brand LIKE @q OR model LIKE @q
    ORDER BY sort_order ASC
    LIMIT @limit
  `).all({ q: pattern, limit }) as { id: string; title: string; description: string; category: string; brand: string }[];

  for (const e of equipment) {
    results.push({
      type: 'equipment',
      id: e.id,
      title: e.title,
      description: e.description,
      url: `/oborudovanie/${e.category}/${e.id}`,
      extra: e.brand,
    });
  }

  // Услуги
  const services = db.prepare(`
    SELECT id, title, description
    FROM services
    WHERE title LIKE @q OR description LIKE @q
    ORDER BY sort_order ASC
    LIMIT @limit
  `).all({ q: pattern, limit }) as { id: string; title: string; description: string }[];

  for (const s of services) {
    results.push({
      type: 'service',
      id: s.id,
      title: s.title,
      description: s.description,
      url: `/uslugi/${s.id}`,
    });
  }

  // Блог
  const blog = db.prepare(`
    SELECT id, title, description
    FROM blog
    WHERE title LIKE @q OR description LIKE @q OR content LIKE @q
    ORDER BY publish_date DESC
    LIMIT @limit
  `).all({ q: pattern, limit }) as { id: string; title: string; description: string }[];

  for (const b of blog) {
    results.push({
      type: 'blog',
      id: b.id,
      title: b.title,
      description: b.description,
      url: `/blog/${b.id}`,
    });
  }

  return results;
}
