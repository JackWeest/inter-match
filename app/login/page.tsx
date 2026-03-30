'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Essa função do Supabase cria a conta do usuário
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } else {
      alert('Deu certo! Verifique seu e-mail para confirmar a conta.');
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-orange-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border-t-4 border-purple-600">
        <h1 className="text-3xl font-bold text-orange-600 mb-2 text-center">
          Entrar na Festa
        </h1>
        <p className="text-gray-500 mb-6 text-center">
          Crie sua conta para liberar os matches
        </p>

        <form onSubmit={handleCadastrar} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-black"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-black"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors mt-2"
          >
            {loading ? 'Carregando...' : 'Cadastrar / Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}