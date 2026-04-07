import { useEffect, useState } from 'react';
import { getCachedSrc } from '../../lib/photo-cache';

/**
 * Imagem com cache persistente.
 *
 * 1. Verifica se a foto já está em cache (disco)
 * 2. Se SIM → renderiza direto do cache (zero Cloudinary)
 * 3. Se NÃO → renderiza a URL original, depois baixa e salva em cache
 *
 * Na próxima sessão ou página, a foto vem do cache (zero Cloudinary).
 *
 * Sem blink: mantém a foto anterior visível até a nova estar pronta,
 * com crossfade suave.
 */
export default function CachedImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [displayedSrc, setDisplayedSrc] = useState<string>(src ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!src) { setDisplayedSrc(''); setLoading(false); return; }

    setLoading(true);
    let cancelled = false;

    (async () => {
      const cached = await getCachedSrc(src);
      if (!cancelled) {
        setDisplayedSrc(cached);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [src]);

  if (!displayedSrc && !loading) return null;

  return (
    <img
      src={displayedSrc}
      alt={alt}
      className={`${className} transition-opacity duration-200 ${loading ? 'opacity-70' : 'opacity-100'}`}
      loading="lazy"
      decoding="async"
    />
  );
}
