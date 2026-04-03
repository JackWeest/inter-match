'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Heart, User } from 'lucide-react';

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
}: {
  href: string;
  icon: LucideIconType;
  label: string;
  active: boolean;
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

  const rotasSemNavbar = ['/', '/login', '/ingressar', '/perfil/editar'];
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