'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Catraca({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [autorizado, setAutorizado] = useState(false);
  const [montado, setMontado] = useState(false); 

  useEffect(() => {
    setMontado(true);

    // 💉 AJUSTE 1: Removido o '/login' já que sua Home (/) faz esse papel
    const rotasLivres = ['/', '/ingressar'];
    
    if (rotasLivres.includes(pathname)) {
      setAutorizado(true);
      return;
    }

    const temLogin = localStorage.getItem('supabase.auth.token');

    if (!temLogin) {
      setAutorizado(false);
      // 💉 AJUSTE 2: Redireciona para a raiz se não houver login
      router.push('/');
    } else {
      setAutorizado(true);
    }
  }, [pathname, router]);

  // 🏥 TRATAMENTO DE CHOQUE:
  if (!montado) {
    return <div className="min-h-screen bg-transparent" />;
  }

  // 💉 AJUSTE 3: Sincronizando com as rotas livres atuais
  const isRotaLivre = ['/', '/ingressar'].includes(pathname);

  // Se não está autorizado e não é rota livre, mostra o loading
  if (!autorizado && !isRotaLivre) {
    return (
      <div 
        suppressHydrationWarning 
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