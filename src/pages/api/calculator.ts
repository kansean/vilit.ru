import type { APIRoute } from 'astro';
import { sendNotification } from '../../utils/notify';
import { leadsRepo } from '../../lib/leads.repo';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, phone, services, total } = data;

    if (!phone) {
      return new Response(JSON.stringify({ error: 'Телефон обязателен' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    leadsRepo.create({
      type: 'calculator',
      name: name || null,
      phone,
      services_list: services || null,
      total: total ? Number(total) : null,
      source_page: request.headers.get('referer') || null,
    });

    await sendNotification('🧮 Заявка из калькулятора', {
      'Имя': name || '—',
      'Телефон': phone,
      'Услуги': services || '—',
      'Сумма': total ? `от ${Number(total).toLocaleString('ru-RU')} ₽` : '—',
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
