export const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dcsiucytm/image/upload';

// Esta função recebe a URL da foto e coloca as "regras" de otimização nela
export function otimizarUrlCloudinary(urlOriginal: string): string {
  if (!urlOriginal || !urlOriginal.includes('res.cloudinary.com')) return urlOriginal;
  
  // Se a URL já estiver otimizada, não faz nada
  if (urlOriginal.includes('c_fill')) return urlOriginal;

  // Aqui a gente diz: corta no rosto (g_face), preenche o quadrado (c_fill),
  // limita o tamanho (w_600, h_800) e melhora o peso (q_auto, f_auto)
  return urlOriginal.replace(
    '/upload/',
    '/upload/c_fill,g_face,w_600,h_800,q_auto,f_auto/'
  );
}