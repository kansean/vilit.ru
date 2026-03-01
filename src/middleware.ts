import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated, verifySession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Защита админских API-эндпоинтов (кроме login)
  if (pathname.startsWith('/api/v1/') && !pathname.startsWith('/api/v1/auth/login')) {
    if (!isAuthenticated(context.request)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Защита страниц админки (кроме логина)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = context.request.headers.get('cookie') || '';
    const match = cookie.match(/session=([a-f0-9]{64})/);
    const token = match ? match[1] : null;

    if (!token || !verifySession(token)) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
