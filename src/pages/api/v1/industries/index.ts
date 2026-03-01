import type { APIRoute } from 'astro';
import { industriesRepo } from '../../../../lib/industries.repo';

export const prerender = false;

export const GET: APIRoute = async () => {
  const items = industriesRepo.list();
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

    const existing = industriesRepo.getById(data.id);
    if (existing) {
      return new Response(JSON.stringify({ error: 'Отрасль с таким id уже существует' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const item = industriesRepo.create({
      id: data.id,
      title: data.title,
      description: data.description || '',
      meta_title: data.meta_title || data.title,
      meta_description: data.meta_description || data.description || '',
      icon: data.icon || '',
      hero_title: data.hero_title || data.title,
      hero_subtitle: data.hero_subtitle || '',
      sort_order: data.sort_order || 0,
      pain_points: data.pain_points || '[]',
      legal_requirements: data.legal_requirements || '[]',
      equipment_list: data.equipment_list || '[]',
      faq: data.faq || '[]',
      related_services: data.related_services || '[]',
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
