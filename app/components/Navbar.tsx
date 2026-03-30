'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Heart, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  // Cores da Identidade Visual
  const activeColor = '#ea580c'; // Laranja Match
  const inactiveColor = '#9ca3af'; // Cinza

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
      
      {/* TRIAGEM */}
      <Link href="/matches" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textDecoration: 'none',
        gap: '4px',
        color: pathname === '/matches' ? activeColor : inactiveColor 
      }}>
        <Flame size={28} fill={pathname === '/matches' ? activeColor : 'none'} />
        <span style={{ 
          fontSize: '10px', 
          fontWeight: '900', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em' 
        }}>
          Triagem
        </span>
      </Link>

      {/* CURTIDAS */}
      <Link href="/curtidas" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textDecoration: 'none',
        gap: '4px',
        color: pathname === '/curtidas' ? activeColor : inactiveColor 
      }}>
        <Heart size={28} fill={pathname === '/curtidas' ? activeColor : 'none'} />
        <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Curtidas</span>
      </Link>

      {/* VOCÊ */}
      <Link href="/perfil" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textDecoration: 'none',
        gap: '4px',
        color: pathname === '/perfil' ? activeColor : inactiveColor 
      }}>
        <User size={28} fill={pathname === '/perfil' ? activeColor : 'none'} />
        <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Você</span>
      </Link>

    </nav>
  );
}