'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';

type AuthState = {
  userId: string;
  temPerfil: boolean;
};

const sessionCache: { current: AuthState | null } = { current: null };

export default function Catraca({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [pronto, setPronto] = useState(false);
  const verificandoRef = useRef(false);

  const rotasPublicas = ['/', '/ingressar'];
  const rotasCriarPerfil = ['/perfil/criar'];
  const rotasSemPerfilPermitidas = ['/perfil/criar', '/redefinir'];

  useEffect(() => {
    let ignorado = false;

    const verificar = async () => {
      if (verificandoRef.current) return;
      verificandoRef.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();

        // 🔒 TRAVA ABSOLUTA DO ADMIN: Só entra se tiver sessão E for o seu e-mail
        if (pathname.startsWith('/admin')) {
          if (!session || session.user.email !== 'janiejunior123@gmail.com') {
            router.replace('/'); // Chuta de volta pra Home se tentar dar uma de espertinho
            return;
          }
          setPronto(true); // É você? Então a catraca abre.
          return;
        }

        // Sem sessão em rota pública → permite
        if (rotasPublicas.includes(pathname)) {
          if (!session) { setPronto(true); return; }
          // Logado tentando acessar rota pública → triagem
          router.replace('/triagem');
          return;
        }

        // Sem sessão em rota protegida → home
        if (!session) {
          router.replace('/');
          return;
        }

        // Perfil completo = tem 'nome' preenchido (registro só salva 'insta')
        if (sessionCache.current?.userId === session.user.id) {
          const cached = sessionCache.current;
          // 💉 CORREÇÃO AQUI: Usando rotasSemPerfilPermitidas no cache
          if (!cached.temPerfil && !rotasSemPerfilPermitidas.includes(pathname)) {
            router.replace('/perfil/criar');
          } else if (cached.temPerfil && rotasCriarPerfil.includes(pathname)) {
            router.replace('/perfil/editar');
          }
          if (!ignorado) setPronto(true);
          return;
        }

        let temPerfil = false;
        try {
          const { data: perfil } = await supabase
            .from('profiles')
            .select('nome')
            .eq('id', session.user.id)
            .single();
          temPerfil = !!(perfil && perfil.nome);
          sessionCache.current = { userId: session.user.id, temPerfil };
        } catch {
          temPerfil = false;
          sessionCache.current = { userId: session.user.id, temPerfil };
        }

        // 💉 CORREÇÃO AQUI: Usando rotasSemPerfilPermitidas no banco
        if (!temPerfil && !rotasSemPerfilPermitidas.includes(pathname)) {
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

    // Escuta quando perfil é criado pra invalidar o cache
    const handleProfileCreated = () => {
      sessionCache.current = null;
    };
    window.addEventListener('profile-created', handleProfileCreated);

    return () => {
      ignorado = true;
      listener?.subscription.unsubscribe();
      window.removeEventListener('profile-created', handleProfileCreated);
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
          backgroundColor: '#0f051a',
        }}
      >
        <img
          src="/NOME.png"
          alt="INTERMATCH"
          style={{ width: '200px', opacity: '0.6' }}
        />
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.1)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginTop: '32px',
        }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}