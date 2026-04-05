/**
 * Cache simples em memÃ³ria por sessÃ£o.
 * Evita re-fetch desnecessÃ¡rio ao navegar entre pÃ¡ginas.
 * TTL padrÃ£o: 120s (configurÃ¡vel na criaÃ§Ã£o).
 */
type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const store: Record<string, CacheEntry<unknown>> = {};

export function createCache<T>(key: string, ttlMs: number) {
  return {
    get(): T | null {
      const entry = store[key];
      if (entry && entry.expiresAt > Date.now()) return entry.data as T;
      // expirado ou nÃ£o existe
      if (entry) delete store[key];
      return null;
    },
    set(data: T) {
      store[key] = { data, expiresAt: Date.now() + ttlMs };
    },
    invalidate() {
      delete store[key];
    },
  };
}
