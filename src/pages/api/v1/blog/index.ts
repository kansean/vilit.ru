import type { APIRoute } from 'astro';
import { blogRepo } from '../../../../lib/blog.repo';

export const prerender = false;

export const GET: APIRoute = async () => {
  const items = blogRepo.list();
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

    const existing = blogRepo.getById(data.id);
    if (existing) {
      return new Response(JSON.stringify({ error: 'Статья с таким id уже существует' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const item = blogRepo.create({
      id: data.id,
      title: data.title,
      description: data.description || '',
      meta_title: data.meta_title || data.title,
      meta_description: data.meta_description || data.description || '',
      publish_date: data.publish_date || new Date().toISOString().split('T')[0],
      updated_date: data.updated_date || null,
      author: data.author || 'Вилит',
      tags: data.tags || '[]',
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
