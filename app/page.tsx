'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from './components/Toast';

interface LoginContentProps {
  showLogin: boolean;
  setShowLogin: (v: boolean) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  handleLogin: (e: React.FormEvent) => void;
}

// Componente isolado com o conteúdo de Login
function LoginContent({
  showLogin,
  setShowLogin,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  handleLogin,
}: LoginContentProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <>
      {/* LOGO SUPERIOR (ÍCONE) */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="bg-orange-500 p-5 rounded-[2rem] shadow-[0_10px_30px_rgba(234,88,12,0.3)] mb-5 transition-transform duration-500 hover:rotate-12">
          <Flame size={48} color="white" fill="white" />
        </div>
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
          INTER <span className="text-orange-500">MATCH</span>
        </h1>
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
          Sintonize com novas conexões
        </p>
      </div>

      <div className="w-full max-w-xs transition-all duration-300">
        {!showLogin ? (
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col gap-4 animate-in fade-in zoom-in duration-500">
            <button
              onClick={() => setShowLogin(true)}
              className="w-full bg-orange-500 text-white font-black italic uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-400 active:scale-95 transition-all text-sm"
            >
              Fazer Login
            </button>
            <Link
              href="/ingressar"
              className="w-full bg-white/5 backdrop-blur-md text-white/70 border border-white/10 font-black italic uppercase tracking-widest py-4 rounded-2xl hover:bg-white/10 hover:text-white transition-all text-sm text-center shadow-lg"
            >
              Criar Conta
            </Link>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-300">
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="flex items-center gap-1 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-colors"
            >
              <ChevronLeft size={16} /> Voltar
            </button>

            <div className="text-left mb-2">
              <h2 className="text-xl font-black italic text-white uppercase leading-tight">Bem-vindo!</h2>
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-1">Insira suas credenciais</p>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="E-MAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl focus:border-orange-500 focus:outline-none text-white font-bold text-xs placeholder:text-white/20 transition-all shadow-inner"
              />

              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="SENHA"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 pr-12 bg-black/20 border border-white/10 rounded-2xl focus:border-orange-500 focus:outline-none text-white font-bold text-xs placeholder:text-white/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(prev => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-orange-500 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-black italic uppercase tracking-widest py-4 rounded-2xl hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Acessando...' : 'Entrar'}
            </button>

            <a
              href={`https://wa.me/5588992047393?text=${encodeURIComponent(`Oi, esqueci a senha do meu InterMatch. Meu e-mail é: ${email || '___'}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors mt-2"
            >
              Esqueci a senha
            </a>
          </form>
        )}
      </div>

      <footer className="mt-16 flex flex-col items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
        <img
          src="/NOME.png"
          alt="VI INTERCE"
          className="w-32 h-auto object-contain drop-shadow-md"
        />
      </footer>
    </>
  );
}

// Página Principal
export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast('E-mail ou senha inválidos', 'error');
    } else if (data.user) {
      // 🚨 SEQUESTRO DE CONTA ZERADA
      if (password === 'med123') {
        sessionStorage.setItem('lock_to_redefinir', 'true');
        router.push('/redefinir');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).single();
      // 💉 CIRURGIA FEITA AQUI:
      router.push(profile ? '/triagem' : '/perfil/criar');
    }
    setLoading(false);
  };

  const props = { showLogin, setShowLogin, email, setEmail, password, setPassword, loading, handleLogin };

  return (
    <div className="bg-[#0f051a] min-h-screen relative text-white">
      {/* 💉 FUNDO GLOBAL OTIMIZADO */}
      <div className="fixed inset-0 bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] z-0 pointer-events-none" style={{ transform: 'translateZ(0)' }} />

      {/* 📱 MOBILE (Conteúdo centralizado normal) */}
      <main className="flex md:hidden min-h-screen flex-col items-center justify-center p-6 text-center relative z-10">
        <LoginContent {...props} />
      </main>

      {/* 💻 DESKTOP (Com a Logo Centralizada no Background) */}
      <div className="hidden md:flex min-h-screen relative z-10">

        {/* 💉 LADO ESQUERDO: Ocupa o espaço do fundo e centraliza o LOGO.png */}
        <div className="flex-1 w-full bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-orange-500/30">
          <img
            src="/LOGO.png"
            alt="Logo Match Med"
            className="max-w-md lg:max-w-lg h-auto object-contain drop-shadow-[0_0_50px_rgba(234,88,12,0.2)]"
          />
        </div>

        {/* BARRA LATERAL COM O LOGIN (Liquid Glass) */}
        <aside className="w-[450px] min-h-screen bg-white/[0.02] backdrop-blur-2xl border-l border-white/5 shadow-2xl flex flex-col items-center justify-center p-12 relative">
          <LoginContent {...props} />
        </aside>
      </div>
    </div>
  );
}