import type { APIRoute } from 'astro';
import { settingsRepo } from '../../../lib/settings.repo';

export const prerender = false;

export const GET: APIRoute = async () => {
  const settings = settingsRepo.getAll();
  return new Response(JSON.stringify(settings), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    settingsRepo.setMany(data);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Неверный запрос' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
