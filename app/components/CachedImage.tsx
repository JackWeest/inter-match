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

  useEffect(() => {
    if (!src) { setDisplayedSrc(''); return; }

    setDisplayedSrc(''); // reset
    let cancelled = false;

    (async () => {
      const cached = await getCachedSrc(src);
      if (!cancelled) setDisplayedSrc(cached);
    })();

    return () => { cancelled = true; };
  }, [src]);

  if (!displayedSrc) return null;
  return <img src={displayedSrc} alt={alt} className={className} loading="lazy" decoding="async" />;
}
