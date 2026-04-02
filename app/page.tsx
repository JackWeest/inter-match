'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Erro no acesso: ' + error.message);
    } else if (data.user) {
      localStorage.setItem('supabase.auth.token', 'logado');
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).single();
      router.push(profile ? '/triagem' : '/completar-perfil');
    }
    setLoading(false);
  };

  const LoginContent = () => (
    <>
      {/* LOGO */}
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-purple-700 p-4 rounded-full shadow-2xl mb-4 transition-transform duration-500 hover:scale-110">
          <Flame size={48} color="white" fill="white" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight drop-shadow-md">
          INTER <span className="text-purple-700">MATCH</span>
        </h1>
      </div>

      <div className="w-full max-w-xs transition-all duration-300">
        {!showLogin ? (
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowLogin(true)}
              className="w-full bg-purple-700 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-purple-800 active:scale-95 transition-all text-lg"
            >
              Entrar
            </button>
            <Link
              href="/ingressar"
              className="w-full bg-white/80 backdrop-blur-sm text-orange-600 border-2 border-orange-600 font-bold py-4 rounded-2xl hover:bg-white transition-all text-lg text-center shadow-lg"
            >
              Criar conta
            </Link>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-purple-100 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="flex items-center text-gray-500 text-sm hover:text-purple-700 transition-colors"
            >
              <ChevronLeft size={18} /> Voltar
            </button>
            <h2 className="text-xl font-bold text-gray-800 text-left">Bem-vindo de volta!</h2>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-black"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 text-white font-bold py-4 rounded-xl hover:bg-purple-800 transition-all shadow-lg active:scale-95"
            >
              {loading ? 'Entrando...' : 'Acessar'}
            </button>
          </form>
        )}
      </div>

      <footer className="mt-12 text-gray-700 text-sm italic font-bold drop-shadow-sm">
        UFC Sobral • Alcateia • @janieljr
      </footer>
    </>
  );

  return (
    <>
      {/* 📱 MOBILE: centralizado como antes */}
      <main className="flex md:hidden min-h-screen flex-col items-center justify-center bg-transparent p-6 text-center">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center">
          <LoginContent />
        </div>
      </main>

      {/* 💻 DESKTOP: barra lateral direita */}
      <div className="hidden md:flex min-h-screen">
        {/* Área vazia à esquerda (mostra o background) */}
        <div className="flex-1" />

        {/* Barra lateral direita */}
        <aside className="w-96 min-h-screen bg-white/80 backdrop-blur-md border-l border-purple-100 shadow-2xl flex flex-col items-center justify-center p-10">
          <LoginContent />
        </aside>
      </div>
    </>
  );
}