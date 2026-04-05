'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';

type AuthState = {
  userId: string;
  temPerfil: boolean;
};

// Cache em memória por sessão (não faz query ao Supabase toda navegação)
const sessionCache: { current: AuthState | null } = { current: null };

export default function Catraca({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pronto, setPronto] = useState(false);
  const verificandoRef = useRef(false);

  const rotasPublicas = ['/', '/ingressar'];
  const rotasCriarPerfil = ['/perfil/criar'];

  useEffect(() => {
    let ignorado = false;

    const verificar = async () => {
      if (verificandoRef.current) return;
      verificandoRef.current = true;

      try {
        // 1. Rotas públicas sem sessão
        const { data: { session } } = await supabase.auth.getSession();

        if (rotasPublicas.includes(pathname)) {
          if (!session) { setPronto(true); return; }
          // Logado em rota pública → redireciona pra triagem
          router.replace('/triagem');
          return;
        }

        // 2. Sem sessão em rota protegida → home
        if (!session) {
          router.replace('/');
          return;
        }

        // 3. Usa cache em memória se válido (mesmo usuário)
        if (sessionCache.current?.userId === session.user.id) {
          const cached = sessionCache.current;
          if (!cached.temPerfil && !rotasCriarPerfil.includes(pathname)) {
            router.replace('/perfil/criar');
          } else if (cached.temPerfil && rotasCriarPerfil.includes(pathname)) {
            router.replace('/perfil/editar');
          }
          setPronto(true);
          return;
        }

        // 4. Sem cache → verifica perfil (só 1x por sessão)
        let temPerfil = false;
        try {
          const { data: perfil } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();
          temPerfil = !!perfil;
          sessionCache.current = { userId: session.user.id, temPerfil };
        } catch {
          temPerfil = false;
          sessionCache.current = { userId: session.user.id, temPerfil };
        }

        // 5. Redireciona se necessário
        if (!temPerfil && !rotasCriarPerfil.includes(pathname)) {
          router.replace('/perfil/criar');
          return;
        }
        if (temPerfil && rotasCriarPerfil.includes(pathname)) {
          router.replace('/perfil/editar');
          return;
        }
      } finally {
        verificandoRef.current = false;
      }

      if (!ignorado) setPronto(true);
    };

    verificar();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        sessionCache.current = null;
        setPronto(false);
        if (!rotasPublicas.includes(pathname)) router.push('/');
      }
    });

    return () => {
      ignorado = true;
      listener?.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (!pronto) {
    return (
      <div
        suppressHydrationWarning
        style={{
          display: 'flex',
          height: '100vh',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff7ed',
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #ea580c',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
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
