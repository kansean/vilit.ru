/**
 * Безопасный JSON.parse с fallback-значением.
 * Не выбрасывает ошибку при невалидном JSON.
 */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
