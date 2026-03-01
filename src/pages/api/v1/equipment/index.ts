import type { APIRoute } from 'astro';
import { equipmentRepo } from '../../../../lib/equipment.repo';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const category = url.searchParams.get('category');
  const items = category ? equipmentRepo.listByCategory(category) : equipmentRepo.list();
  return new Response(JSON.stringify({ items }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data.id || !data.title || !data.category) {
      return new Response(JSON.stringify({ error: 'id, title и category обязательны' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = equipmentRepo.getById(data.id);
    if (existing) {
      return new Response(JSON.stringify({ error: 'Товар с таким id уже существует' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const item = equipmentRepo.create({
      id: data.id,
      title: data.title,
      description: data.description || '',
      meta_title: data.meta_title || data.title,
      meta_description: data.meta_description || data.description || '',
      category: data.category,
      brand: data.brand || '',
      model: data.model || '',
      price: data.price || 0,
      old_price: data.old_price || null,
      image: data.image || null,
      in_stock: data.in_stock ?? 1,
      features: data.features || '[]',
      specs: data.specs || '{}',
      sort_order: data.sort_order || 0,
      content: data.content || '',
    });

    return new Response(JSON.stringify({ item }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Неверный запрос' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
