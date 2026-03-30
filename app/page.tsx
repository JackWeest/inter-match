'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginDireto() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Tenta logar o usuário
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Erro ao entrar: Verifique seu e-mail e senha ou se já confirmou o e-mail.');
    } else {
      // Se deu certo, manda direto pros matches
      router.push('/matches');
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-orange-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border-b-8 border-purple-600">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-orange-600 italic">MATCH MED 🏥</h1>
          <p className="text-purple-700 font-medium">Acesse sua conta para a festa</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-black">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:outline-none transition-all bg-gray-50"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:outline-none transition-all bg-gray-50"
              placeholder="••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-all shadow-lg active:scale-95"
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-6">
          <p className="text-gray-600 mb-2 font-medium">Ainda não fez uma conta?</p>
          <Link 
            href="/login" 
            className="text-orange-600 font-bold hover:text-orange-700 text-lg decoration-2 underline-offset-4"
          >
            Crie agora ↗
          </Link>
        </div>
      </div>
    </main>
  );
}