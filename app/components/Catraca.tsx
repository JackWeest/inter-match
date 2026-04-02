'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Catraca({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [autorizado, setAutorizado] = useState(false);
  const [montado, setMontado] = useState(false); // <--- Nova trava de segurança

  useEffect(() => {
    setMontado(true); // O componente "nasceu" no navegador

    const rotasLivres = ['/', '/login', '/ingressar'];
    if (rotasLivres.includes(pathname)) {
      setAutorizado(true);
      return;
    }

    const temLogin = localStorage.getItem('supabase.auth.token');

    if (!temLogin) {
      setAutorizado(false);
      router.push('/login');
    } else {
      setAutorizado(true);
    }
  }, [pathname, router]);

  // 🏥 TRATAMENTO DE CHOQUE:
  // Enquanto o React não tiver certeza de que está no navegador (SSR),
  // a gente retorna um fundo neutro sem elementos complexos.
  // Isso evita que extensões como Dark Reader quebrem a hidratação.
  if (!montado) {
    return <div className="min-h-screen bg-transparent" />;
  }

  const isRotaLivre = ['/', '/login', '/ingressar'].includes(pathname);

  // Se não está autorizado e não é rota livre, mostra o loading
  if (!autorizado && !isRotaLivre) {
    return (
      <div 
        suppressHydrationWarning // <--- Blindagem contra extensões
        style={{ 
          display: 'flex', 
          height: '100vh', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#fff7ed' 
        }}
      >
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #ea580c', 
          borderTopColor: 'transparent', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontWeight: 'bold', color: '#ea580c', marginTop: '20px' }}>
          Verificando sua pulseira... 🏥
        </p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}