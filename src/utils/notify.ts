/**
 * Отправка уведомлений о заявках.
 *
 * Для работы нужны переменные окружения:
 * - TELEGRAM_BOT_TOKEN — токен бота (@BotFather)
 * - TELEGRAM_CHAT_ID — ID чата или группы для уведомлений
 *
 * Если переменные не заданы, уведомления просто логируются в консоль.
 */

const TELEGRAM_BOT_TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = import.meta.env.TELEGRAM_CHAT_ID || '';

export async function sendNotification(subject: string, fields: Record<string, string>): Promise<void> {
  const lines = [`<b>${escapeHtml(subject)}</b>`, ''];
  for (const [key, value] of Object.entries(fields)) {
    if (value) {
      lines.push(`${escapeHtml(key)}: ${escapeHtml(value)}`);
    }
  }
  lines.push('', `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);

  const text = lines.join('\n');

  // Логируем всегда
  console.log(`[notify] ${subject}`, fields);

  // Telegram
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      });
    } catch (err) {
      console.error('[notify] Ошибка отправки в Telegram:', err);
    }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
