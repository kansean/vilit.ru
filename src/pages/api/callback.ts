import type { APIRoute } from 'astro';
import { sendNotification } from '../../utils/notify';
import { leadsRepo } from '../../lib/leads.repo';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, phone } = data;

    if (!phone) {
      return new Response(JSON.stringify({ error: 'Телефон обязателен' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    leadsRepo.create({
      type: 'callback',
      name: name || null,
      phone,
      source_page: request.headers.get('referer') || null,
    });

    await sendNotification('📞 Обратный звонок', {
      'Имя': name || '—',
      'Телефон': phone,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Неверный запрос' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
