'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Flame, ChevronLeft } from 'lucide-react';

export default function Registro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Parede de Segurança: Verificação de senha dupla
    if (password !== confirmPassword) {
      alert('As senhas não coincidem, lil bro! Dá uma checada.');
      return;
    }

    if (password.length < 6) {
      alert('A senha precisa de pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } else {
      setSuccess(true); // Ativa a tela de "Checa seu e-mail"
    }
    setLoading(false);
  };

  // Se o cadastro deu certo, mostramos uma mensagem limpa
  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-orange-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm border-t-4 border-green-500">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quase lá!</h2>
          <p className="text-gray-600 mb-6">
            Enviamos um link de confirmação. **Checa seu e-mail** para liberar seu acesso à festa.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="text-orange-600 font-bold hover:underline"
          >
            Voltar para a Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-orange-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border-t-4 border-orange-600">
        
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-gray-400 text-sm hover:text-orange-600 mb-6 transition-colors"
        >
          <ChevronLeft size={18} /> Voltar
        </button>

        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <Flame size={32} className="text-orange-600" fill="currentColor" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Criar Conta
        </h1>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Garanta sua pulseira digital para a Triagem
        </p>

        <form onSubmit={handleCadastrar} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-black"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-black"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Confirmar Senha</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-black"
              placeholder="Repita sua senha"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 text-white font-black py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 mt-4"
          >
            {loading ? 'PROCESSANDO...' : 'CRIAR CONTA'}
          </button>
        </form>
      </div>
    </main>
  );
}