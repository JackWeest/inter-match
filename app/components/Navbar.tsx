'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Heart, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  // 🏥 ESCONDER NAVBAR: 
  // Não mostramos a barra na Home, no Login ou no Cadastro (/ingressar)
  const rotasSemNavbar = ['/', '/login', '/ingressar'];
  
  if (rotasSemNavbar.includes(pathname)) {
    return null;
  }

  const activeColor = '#ea580c'; // Laranja Match Med
  const inactiveColor = '#9ca3af'; // Cinza inativo

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      height: '75px',
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 9999,
      boxShadow: '0 -4px 15px rgba(0,0,0,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      
      {/* TRIAGEM (Onde ficam os cards/fogo) */}
      <Link href="/triagem" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textDecoration: 'none',
        gap: '4px',
        color: pathname === '/triagem' ? activeColor : inactiveColor 
      }}>
        <Flame size={28} fill={pathname === '/triagem' ? activeColor : 'none'} />
        <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Triagem</span>
      </Link>

      {/* CURTIDAS (Onde ficam os Matches Mútuos / coração) */}
      <Link href="/matches" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textDecoration: 'none',
        gap: '4px',
        color: pathname === '/matches' ? activeColor : inactiveColor 
      }}>
        <Heart size={28} fill={pathname === '/matches' ? activeColor : 'none'} />
        <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Curtidas</span>
      </Link>

      {/* VOCÊ (Seu perfil / preview) */}
      <Link href="/perfil" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textDecoration: 'none',
        gap: '4px',
        color: pathname === '/perfil' || pathname === '/perfil/editar' ? activeColor : inactiveColor 
      }}>
        <User size={28} fill={pathname.startsWith('/perfil') ? activeColor : 'none'} />
        <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Você</span>
      </Link>

    </nav>
  );
}