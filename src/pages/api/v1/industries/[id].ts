import type { APIRoute } from 'astro';
import { industriesRepo } from '../../../../lib/industries.repo';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const item = industriesRepo.getById(params.id!);
  if (!item) {
    return new Response(JSON.stringify({ error: 'Не найдено' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ item }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const data = await request.json();
    const item = industriesRepo.update(params.id!, data);
    if (!item) {
      return new Response(JSON.stringify({ error: 'Не найдено' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ item }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Неверный запрос' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const ok = industriesRepo.delete(params.id!);
  if (!ok) {
    return new Response(JSON.stringify({ error: 'Не найдено' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
