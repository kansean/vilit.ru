import { randomBytes } from 'node:crypto';
import { getDb } from './db';

const SESSION_TTL_HOURS = 24;

export function login(username: string, password: string): string | null {
  const adminUser = import.meta.env.ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'admin';
  const adminPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

  if (!adminPass) return null;
  if (username !== adminUser || password !== adminPass) return null;

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();

  getDb().prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').run(token, expires);

  // Очистка просроченных сессий
  getDb().prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();

  return token;
}

export function verifySession(token: string): boolean {
  if (!token) return false;
  const row = getDb().prepare("SELECT token FROM sessions WHERE token = ? AND expires_at > datetime('now')").get(token);
  return !!row;
}

export function verifyApiKey(key: string): boolean {
  const apiKey = import.meta.env.API_KEY || process.env.API_KEY || '';
  if (!apiKey) return false;
  return key === apiKey;
}

export function deleteSession(token: string): void {
  getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

/** Проверяет авторизацию: cookie-сессия ИЛИ X-API-Key */
export function isAuthenticated(request: Request): boolean {
  // 1. Проверка API-ключа
  const apiKey = request.headers.get('x-api-key');
  if (apiKey && verifyApiKey(apiKey)) return true;

  // 2. Проверка cookie-сессии
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/session=([a-f0-9]{64})/);
  if (match && verifySession(match[1])) return true;

  return false;
}

export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/session=([a-f0-9]{64})/);
  return match ? match[1] : null;
}
