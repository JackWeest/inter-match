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

  // Função de Login (O "Entrar")
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
      // Salva o token manual para a Catraca (até integrarmos o Supabase 100%)
      localStorage.setItem('supabase.auth.token', 'logado');
      
      // Checa se tem perfil e redireciona (Lógica da aula anterior)
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).single();
      router.push(profile ? '/triagem' : '/completar-perfil');
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-orange-50 p-6 text-center">
      
      {/* LOGO (Sempre visível) */}
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-orange-500 p-4 rounded-full shadow-lg mb-4 transition-transform duration-500 hover:scale-110">
          <Flame size={48} color="white" fill="white" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          MATCH <span className="text-orange-600">MED</span>
        </h1>
      </div>

      <div className="w-full max-w-xs transition-all duration-300">
        
        {!showLogin ? (
          /* --- ESTADO 1: BOTÕES INICIAIS --- */
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowLogin(true)}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-md hover:bg-orange-600 transition-all text-lg"
            >
              Entrar
            </button>
            
            <Link 
              href="/ingressar" 
              className="w-full bg-white text-orange-600 border-2 border-orange-500 font-bold py-4 rounded-2xl hover:bg-orange-50 transition-all text-lg text-center"
            >
              Criar conta
            </Link>
          </div>
        ) : (
          /* --- ESTADO 2: BOX DE LOGIN TRANSFORMAVEL --- */
          <form onSubmit={handleLogin} className="bg-white p-6 rounded-3xl shadow-xl border border-orange-100 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <button 
              type="button"
              onClick={() => setShowLogin(false)}
              className="flex items-center text-gray-400 text-sm hover:text-orange-600 transition-colors"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-black"
            />
            
            <input 
              type="password" 
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-black"
            />

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
            >
              {loading ? 'Entrando...' : 'Acessar'}
            </button>
          </form>
        )
        }
      </div>

      <footer className="mt-12 text-gray-400 text-sm italic">
        UFC Sobral • T39
      </footer>
    </main>
  );
}