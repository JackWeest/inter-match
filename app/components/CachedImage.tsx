import { useEffect, useState } from 'react';
import { getCachedSrc } from '../../lib/photo-cache';

/**
 * Imagem com cache em blob URL.
 *
 * 1. Renderiza com src direto (browser baixa a imagem normalmente)
 * 2. Em background baixa a imagem e converte pra blob URL, salvando no cache
 * 3. Na próxima vez que essa mesma foto aparecer → usa blob URL direto (zero Cloudinary)
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
  const [displayedSrc, setDisplayedSrc] = useState(src);

  useEffect(() => {
    setDisplayedSrc(src); // reset quando muda a foto

    if (!src) return;

    let cancelled = false;
    (async () => {
      // Se já está em cache (de outro componente), usa o blob URL direto
      const cached = await getCachedSrc(src);
      if (!cancelled && cached !== src) {
        setDisplayedSrc(cached);
      }
    })();

    return () => { cancelled = true; };
  }, [src]);

  return <img src={displayedSrc} alt={alt} className={className} loading="lazy" decoding="async" />;
}
