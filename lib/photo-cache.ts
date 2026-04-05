/**
 * Cache persistente de fotos via Cache Storage API (nível do browser).
 *
 * Como funciona:
 * 1. Primeira vez: baixa do Cloudinary → salva em disco no browser (persiste)
 * 2. Segunda vez: serve do disco (zero request ao Cloudinary)
 * 3. A foto persiste após fechar/reabrir/relarregar a aba
 * 4. TTL: 7 dias (cobre todo o evento)
 *
 * Só some se o usuário for nas configurações do navegador e
 * limpar os dados do site.
 *
 * ~60-80% redução de bandwidth no Cloudinary.
 */

const CACHE_NAME = 'im-fotos-v1';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const cachePromise = typeof caches !== 'undefined'
  ? caches.open(CACHE_NAME).catch(() => null)
  : Promise.resolve(null);

async function getCache() {
  return cachePromise;
}

/** Verifica se uma foto está em cache e dentro do TTL */
async function isValid(cache: Cache, url: string): Promise<boolean> {
  try {
    const resp = await cache.match(url);
    if (!resp) return false;
    const cachedAt = resp.headers.get('x-cached-at');
    if (!cachedAt) return true;
    return Date.now() - parseInt(cachedAt, 10) <= TTL_MS;
  } catch {
    return false;
  }
}

/** Serve a foto do cache de disco */
async function serveFromCache(cache: Cache, url: string): Promise<string | null> {
  const resp = await cache.match(url);
  if (!resp) return null;
  const blob = await resp.blob();
  return URL.createObjectURL(blob);
}

/** Baixa, salva em disco e retorna blob URL */
async function downloadAndCache(cache: Cache, url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;

    const blob = await resp.blob();
    const mimeType = resp.headers.get('content-type') || 'image/jpeg';

    await cache.put(url, new Response(blob, {
      headers: {
        'content-type': mimeType,
        'x-cached-at': Date.now().toString(),
      },
    }));

    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/**
 * Resolve a URL de uma foto.
 * Se está em cache: serve do disco.
 * Se não est: baixa, salva em disco e serve.
 * Se tudo falha: retorna a URL original.
 */
export async function getCachedSrc(url: string): Promise<string> {
  if (!url) return url;

  const cache = await getCache();
  if (!cache) return url;

  // J em cache?
  if (await isValid(cache, url)) {
    const cached = await serveFromCache(cache, url);
    if (cached) return cached;
  }

  // Baixa e salva
  const blobUrl = await downloadAndCache(cache, url);
  if (blobUrl) return blobUrl;

  // Fallback
  return url;
}

/**
 * Pré-carrega um lote de fotos em background.
 */
export async function preloadBatch(urls: string[]): Promise<void> {
  const cache = await getCache();
  if (!cache) return;

  const urlsToPreload = [...new Set(urls)].filter(Boolean);

  for (let i = 0; i < urlsToPreload.length; i += 3) {
    const chunk = urlsToPreload.slice(i, i + 3);
    await Promise.allSettled(chunk.map(async (url) => {
      if (await isValid(cache, url)) return;
      await downloadAndCache(cache, url);
    }));
  }
}
