import type { APIRoute } from 'astro';
import { servicesRepo } from '../../../../lib/services.repo';

export const prerender = false;

export const GET: APIRoute = async () => {
  const items = servicesRepo.list();
  return new Response(JSON.stringify({ items }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data.id || !data.title) {
      return new Response(JSON.stringify({ error: 'id и title обязательны' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = servicesRepo.getById(data.id);
    if (existing) {
      return new Response(JSON.stringify({ error: 'Услуга с таким id уже существует' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const item = servicesRepo.create({
      id: data.id,
      title: data.title,
      description: data.description || '',
      meta_title: data.meta_title || data.title,
      meta_description: data.meta_description || data.description || '',
      icon: data.icon || '',
      hero_title: data.hero_title || data.title,
      hero_subtitle: data.hero_subtitle || '',
      price: data.price || null,
      price_note: data.price_note || null,
      sort_order: data.sort_order || 0,
      features: data.features || '[]',
      steps: data.steps || '[]',
      faq: data.faq || '[]',
      related_services: data.related_services || '[]',
      related_industries: data.related_industries || '[]',
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
