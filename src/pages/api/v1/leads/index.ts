import type { APIRoute } from 'astro';
import { leadsRepo } from '../../../../lib/leads.repo';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const status = url.searchParams.get('status') || undefined;
  const type = url.searchParams.get('type') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  const { items, total } = leadsRepo.list({ status, type, limit, offset });
  return new Response(JSON.stringify({ items, total }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
