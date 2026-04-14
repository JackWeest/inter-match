/**
 * Cache persistente por sessão via sessionStorage.
 * Sobrevive a reloads (F5), mas limpa quando a aba fecha.
 * Protegido contra SSR (Next.js) e erros de parse.
 */
export function createCache<T>(key: string, ttlMs: number) {
  // Verificação de segurança para não quebrar no servidor do Next.js
  const isBrowser = typeof window !== 'undefined';

  return {
    get(): T | null {
      if (!isBrowser) return null;
      try {
        const item = sessionStorage.getItem(key);
        if (!item) return null;
        
        const entry = JSON.parse(item) as { data: T; expiresAt: number };
        
        if (entry.expiresAt > Date.now()) {
          return entry.data;
        }
        
        // Expirou: faz a limpeza
        sessionStorage.removeItem(key);
        return null;
      } catch {
        return null; // Falha no parse de JSON, ignora e busca novo
      }
    },
    set(data: T) {
      if (!isBrowser) return;
      try {
        const entry = { data, expiresAt: Date.now() + ttlMs };
        sessionStorage.setItem(key, JSON.stringify(entry));
      } catch (err) {
        // Silencioso. Pode falhar se o sessionStorage estourar limite de tamanho (raro)
      }
    },
    invalidate() {
      if (!isBrowser) return;
      sessionStorage.removeItem(key);
    },
  };
}