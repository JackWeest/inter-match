'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Flame, Heart, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createCache } from '../../lib/cache';

const matchCountCache = createCache<number>('match-count', 30_000);

type LucideIconType = React.ComponentType<{
  size?: string | number;
  fill?: string;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}>;

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: LucideIconType;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center w-[86px] h-[52px] rounded-3xl select-none transition-all duration-300 ease-out active:scale-95"
      style={
        active
          ? {
              background: '#220d45',
              boxShadow: 'inset 0 0 0 1px rgba(120,50,220,0.3)',
            }
          : undefined
      }
    >
      <div className="flex flex-col items-center justify-center gap-[5px]">
        <div className="relative">
          <Icon
            size={22}
            strokeWidth={1.8}
            fill={active ? 'rgba(255,106,0,0.1)' : 'none'}
            className="transition-all duration-300"
            style={{
              color: active ? '#ff6a00' : 'rgba(150,100,255,0.35)',
              filter: active
                ? 'drop-shadow(0 0 4px rgba(255,106,0,0.55))'
                : undefined,
            }}
          />
          {badge !== undefined && badge > 0 ? (
            <span
              className="absolute -top-1 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold px-1"
              style={{
                background: '#ff6a00',
                color: '#fff',
                boxShadow: '0 0 8px rgba(255,106,0,0.6)',
              }}
            >
              {badge > 50 ? '50+' : badge}
            </span>
          ) : null}
        </div>
        <span
          className="text-[9.5px] font-bold uppercase leading-none transition-all duration-300"
          style={{
            letterSpacing: active ? '0.13em' : '0.1em',
            color: active ? '#ff8040' : 'rgba(150,100,255,0.35)',
          }}
        >
          {label}
        </span>
      </div>

      <div
        className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full transition-all duration-300"
        style={
          active
            ? { background: '#ff6a00', boxShadow: '0 0 6px rgba(255,106,0,0.6)', opacity: 1 }
            : { opacity: 0 }
        }
      />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [matchCount, setMatchCount] = useState(0);
  const userRef = useRef<string | null>(null);

  const fetchMatchCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      userRef.current = user.id;

      const { data: meusLikes } = await supabase
        .from('likes').select('receiver_id')
        .eq('sender_id', user.id).eq('liked', true);

      const { data: likesRecebidos } = await supabase
        .from('likes').select('sender_id')
        .eq('receiver_id', user.id).eq('liked', true);

      if (meusLikes && likesRecebidos) {
        const idsMeusLikes = meusLikes.map(l => l.receiver_id);
        const idsLikesRecebidos = likesRecebidos.map(l => l.sender_id);
        const count = idsMeusLikes.filter(id => idsLikesRecebidos.includes(id)).length;
        matchCountCache.set(count);
        setMatchCount(count);
      }
    } catch {
      // silencioso — badge não é crítico
    }
  };

  useEffect(() => {
    const cached = matchCountCache.get();
    if (cached !== null) { setMatchCount(cached); return; }
    fetchMatchCount();
  }, [pathname]);

  // Supabase Realtime: escuta mudanças na tabela likes
  useEffect(() => {
    const rotasSemNavbar = ['/', '/ingressar'];
    if (rotasSemNavbar.includes(pathname)) return;

    const channel = supabase
      .channel('match-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        () => {
          matchCountCache.invalidate();
          fetchMatchCount();
        }
      )
      .subscribe();

    // Também escuta evento global de match criado
    const onMatchCreated = () => {
      matchCountCache.invalidate();
      fetchMatchCount();
    };
    window.addEventListener('match-created', onMatchCreated);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('match-created', onMatchCreated);
    };
  }, [pathname]);

  const rotasSemNavbar = ['/', '/ingressar', '/perfil/editar'];
  if (rotasSemNavbar.includes(pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-center"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className="relative flex items-center justify-between w-80 h-[64px] rounded-[32px] px-2.5"
        style={{
          background: '#17092b',
          boxShadow: '0 0 0 1px rgba(110,55,200,0.3), 0 12px 36px rgba(0,0,0,0.55)',
        }}
      >
        <NavItem
          href="/triagem"
          icon={Flame}
          label="Triagem"
          active={pathname === '/triagem'}
        />
        <NavItem
          href="/matches"
          icon={Heart}
          label="Matches"
          active={pathname === '/matches'}
          badge={matchCount}
        />
        <NavItem
          href="/perfil"
          icon={User}
          label="Você"
          active={pathname.startsWith('/perfil')}
        />
      </div>
    </nav>
  );
}
