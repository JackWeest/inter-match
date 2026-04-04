'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Flame, ChevronLeft, Eye, EyeOff, AtSign } from 'lucide-react';

export default function Registro() {
  const [email, setEmail] = useState('');
  const [insta, setInsta] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Parede de Segurança: Verificação de senha dupla
    if (password !== confirmPassword) {
      alert('As senhas não coincidem, lil bro! Dá uma checada.');
      return;
    }

    if (password.length < 6) {
      alert('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (!insta) {
      alert('O Instagram é obrigatório para a galera te achar no radar!');
      return;
    }

    setLoading(true);
    
    // Faz a cirurgia de cadastro no banco
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } else if (data.user) {
      // Já aproveita e injeta o Instagram do cara na ficha (upsert)
      await supabase.from('profiles').upsert({
        id: data.user.id,
        insta: insta.replace('@', ''), // Tira o @ se o cara tiver digitado
      });

      // Alta hospitalar direta! Sem confirmar e-mail, vai reto pro perfil.
      router.push('/perfil/criar');
    }
    setLoading(false);
  };

  const inputCls = 'w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl focus:border-orange-500 focus:outline-none text-white font-bold text-xs placeholder:text-white/20 transition-all shadow-inner';

  return (
    <>
      {/* 💉 FUNDOS GLOBAIS OBSIDIAN */}
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <main className="flex min-h-screen flex-col items-center justify-center p-6 relative z-10">
        
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 animate-in zoom-in duration-500">
          
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-colors mb-8"
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          <div className="flex flex-col items-center mb-8">
            <div className="bg-orange-500 p-4 rounded-2xl shadow-[0_10px_30px_rgba(234,88,12,0.3)] mb-4">
              <Flame size={32} color="white" fill="white" />
            </div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg leading-none">
              Criar Conta<span className="text-orange-500">.</span>
            </h1>
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-2 text-center">
              Garanta seu perfil na calourada
            </p>
          </div>

          <form onSubmit={handleCadastrar} className="flex flex-col gap-5">
            
            {/* E-MAIL */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-1">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls}
                placeholder="seu@email.com"
              />
            </div>

            {/* INSTAGRAM OBRIGATÓRIO */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-1">Instagram</label>
              <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-orange-500 transition-all shadow-inner">
                <AtSign size={16} className="text-white/20" />
                <input 
                  type="text" 
                  value={insta}
                  onChange={(e) => setInsta(e.target.value)}
                  required
                  className="bg-transparent flex-1 outline-none text-white font-bold text-xs placeholder:text-white/20"
                  placeholder="seu.insta" 
                />
              </div>
            </div>

            {/* SENHA */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-1">Senha</label>
              <div className="relative">
                <input 
                  type={mostrarSenha ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputCls + " pr-12"}
                  placeholder="Mínimo 6 caracteres"
                />
                <button 
                  type="button" 
                  onClick={() => setMostrarSenha(!mostrarSenha)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-orange-500 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRMAR SENHA */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-1">Confirmar Senha</label>
              <div className="relative">
                <input 
                  type={mostrarSenha ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputCls + " pr-12"}
                  placeholder="Repita sua senha"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-500 text-white font-black italic uppercase tracking-widest py-4 rounded-2xl hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 text-sm mt-4"
            >
              {loading ? 'PROCESSANDO...' : 'CRIAR CONTA'}
            </button>

          </form>
        </div>
      </main>
    </>
  );
}