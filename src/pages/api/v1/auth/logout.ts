import type { APIRoute } from 'astro';
import { getSessionToken, deleteSession } from '../../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = getSessionToken(request);
  if (token) {
    deleteSession(token);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    },
  });
};
