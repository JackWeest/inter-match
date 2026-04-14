'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useToast } from '../components/Toast';
import { ShieldAlert, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function RedefinirPage() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      toast('As senhas não coincidem!', 'error');
      return;
    }
    if (novaSenha.length < 6) {
      toast('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }
    if (novaSenha === 'med123') {
      toast('A nova senha não pode ser igual a provisória!', 'error');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: novaSenha
    });

    if (error) {
      toast('Erro ao atualizar senha. Tente novamente.', 'error');
      setLoading(false);
      return;
    }

    sessionStorage.removeItem('lock_to_redefinir');
    toast('Senha alterada com sucesso!', 'success');
    
    // Agora que mudou, vamos saber pra onde mandar
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
      router.push(profile ? '/triagem' : '/perfil/criar');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="bg-[#0f051a] min-h-screen relative flex items-center justify-center p-6 text-white overflow-hidden">
      <div className="fixed inset-0 bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.05] z-0 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-red-500/10 p-5 rounded-[2rem] border border-red-500/20 shadow-[0_10px_30px_rgba(239,68,68,0.2)] mb-5">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-wider mb-2">Redefinição Obrigatória</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center">
            Você entrou com uma senha de recuperação.<br/>Por segurança, crie uma senha nova agora.
          </p>
        </div>

        <form onSubmit={handleRedefinir} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
          
          <div className="relative">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="NOVA SENHA"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              className="w-full px-5 py-4 pr-12 bg-black/40 border border-white/10 rounded-2xl focus:border-red-500 focus:outline-none text-white font-bold text-xs tracking-[0.1em] placeholder:tracking-widest shadow-inner transition-colors"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(prev => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 transition-colors"
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative mb-2">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="CONFIRMAR NOVA SENHA"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="w-full px-5 py-4 pr-12 bg-black/40 border border-white/10 rounded-2xl focus:border-red-500 focus:outline-none text-white font-bold text-xs tracking-[0.1em] placeholder:tracking-widest shadow-inner transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-red-600 text-white font-black italic uppercase tracking-widest py-4 rounded-2xl hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 text-sm"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
