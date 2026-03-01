import type { APIRoute } from 'astro';
import { equipmentRepo } from '../../../../lib/equipment.repo';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const item = equipmentRepo.getById(params.id!);
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
    const item = equipmentRepo.update(params.id!, data);
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
  const ok = equipmentRepo.delete(params.id!);
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
