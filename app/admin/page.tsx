'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Trash2, AlertTriangle, ShieldCheck, RefreshCw, XCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import CachedImage from '../components/CachedImage'; // Usar o novo componente com fallback

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [denunciados, setDenunciados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checarSessao = async () => {
      // Auto-Login inteligente se já estiver logado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Consulta no banco se a pessoa é admin
        const { data: adminCheck } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (adminCheck?.is_admin) {
          setAutenticado(true);
          carregarDenuncias(true); // O 'true' pula o setLoading local de denúncias
          return;
        }
      }
      
      setLoading(false);
    };
    
    checarSessao();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) return;
    
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      toast('Credenciais inválidas', 'error');
      setLoading(false);
      return;
    }

    // Trava forte consultando o banco
    const { data: adminCheck } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();

    if (!adminCheck?.is_admin) {
      await supabase.auth.signOut(); // Desloga do aparelho imediatamente
      toast('Acesso negado: Conta sem privilégios', 'error');
      setLoading(false);
      return;
    }

    setAutenticado(true);
    carregarDenuncias();
  };

  const carregarDenuncias = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    setDbError(false);
    try {
      // 1. Busca todas as denúncias
      const { data: reports, error: reportsError } = await supabase.from('reports').select('*');
      
      if (reportsError) {
        if (reportsError.code === '42P01') {
          // Tabela não existe
          setDbError(true);
        } else {
          toast('Erro ao buscar denúncias', 'error');
        }
        setLoading(false);
        return;
      }

      if (!reports || reports.length === 0) {
        setDenunciados([]);
        setLoading(false);
        return;
      }

      // Conta quantas denúncias cada um tem
      const contagem: Record<string, number> = {};
      reports.forEach(r => {
        contagem[r.reported_id] = (contagem[r.reported_id] || 0) + 1;
      });

      const reportedIds = Object.keys(contagem);

      // 2. Busca os perfis que foram denunciados
      const { data: perfis, error: perfisError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', reportedIds);

      if (perfisError) {
        toast('Erro ao buscar perfis', 'error');
        setLoading(false);
        return;
      }

      // 3. Monta a lista rankeada
      const lista = (perfis || []).map(p => ({
        ...p,
        total_denuncias: contagem[p.id]
      })).sort((a, b) => b.total_denuncias - a.total_denuncias);

      setDenunciados(lista);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const listShadowBan = async (id: string, nome: string) => {
    if (!confirm(`TEM CERTEZA? Ativar o modo de invisibilidade. Ela poderá dar Like/X para sempre num limbo digital, mas não verá mais ninguém.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Chama a função secreta (RPC) no banco para pular a trava de segurança (RLS) invisível
      const { error: banError } = await supabase.rpc('aplicar_shadow_ban', { usuario_id: id });
      
      if (banError) throw banError;

      // Apaga as denúncias referentes a ele para limpar seu painel de adm
      await supabase.from('reports').delete().eq('reported_id', id);

      toast('Fantasma criado! Perfil neutralizado e limpo do radar.', 'success');
      carregarDenuncias();
    } catch (err) {
      console.error(err);
      toast('Erro ao neutralizar o alvo.', 'error');
      setLoading(false);
    }
  };

  const perdoarPerfil = async (id: string, nome: string) => {
    if (!confirm(`Deseja descartar todas as denúncias de "${nome}" e mantê-lo no app?`)) {
      return;
    }

    try {
      setLoading(true);
      // Apaga apenas as denúncias
      const { error } = await supabase.from('reports').delete().eq('reported_id', id);
      if (error) throw error;

      toast('Denúncias perdoadas com sucesso!', 'success');
      carregarDenuncias();
    } catch (err) {
      console.error(err);
      toast('Erro ao limpar denúncias', 'error');
      setLoading(false);
    }
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#090310] flex flex-col items-center justify-center p-6 bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>
        {loading ? (
          <div className="relative z-10 flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin text-red-500 mb-4" size={32} />
            <p className="font-black uppercase text-[10px] tracking-widest text-red-500">Verificando Credenciais...</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="relative z-10 w-full max-w-sm bg-black/50 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-6 ring-4 ring-red-500/5">
              <Lock className="text-red-500" size={28} />
            </div>
            <h1 className="text-2xl font-black italic text-white uppercase tracking-widest mb-1">Acesso Restrito</h1>
            <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-8">Painel do Administrador</p>
            
            <input
              type="email"
              placeholder="E-MAIL MESTRE"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:border-red-500 focus:outline-none text-white font-bold text-center tracking-widest mb-3"
              disabled={loading}
            />

            <input
              type="password"
              placeholder="SENHA OFICIAL"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:border-red-500 focus:outline-none text-white font-bold text-center tracking-[0.2em] mb-6"
              disabled={loading}
            />

            <button disabled={loading} type="submit" className="flex items-center justify-center gap-2 w-full bg-red-600 text-white font-black italic uppercase tracking-widest py-4 rounded-2xl hover:bg-red-500 transition-all text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Acessar Sistema'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090310] relative text-white pt-8 pb-32 px-4 selection:bg-red-500/30">
      <div className="absolute inset-0 bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.02] z-0 pointer-events-none fixed" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 p-3 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <ShieldCheck size={28} className="text-white font-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                Central de Denúncias
              </h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Inter-Match • Operações de Risco</p>
            </div>
          </div>
          <button 
            onClick={() => carregarDenuncias()}
            disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/70 px-5 py-3 rounded-full text-[10px] uppercase font-black tracking-widest border border-white/10"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Recarregar Dados
          </button>
        </div>

        {dbError ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center flex flex-col items-center">
            <AlertTriangle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-black uppercase text-white mb-2">Tabela não encontrada</h2>
            <p className="text-white/60 text-sm max-w-lg mb-6">
              Para que as denúncias funcionem, você precisa rodar aquele script SQL no painel de administração da Supabase construindo a tabela 'reports'.
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center p-20 opacity-50">
            <RefreshCw className="animate-spin text-red-500 mb-4" size={32} />
            <p className="font-black uppercase text-[10px] tracking-widest text-red-500">Analisando Banco de Dados...</p>
          </div>
        ) : denunciados.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-[3rem] border border-white/5 opacity-70">
            <div className="text-5xl mb-6">🕊️</div>
            <h2 className="text-xl font-black italic text-white uppercase tracking-wider">A Paz Reina</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2 text-center max-w-sm">
              Nenhuma denúncia registrada até o momento no evento.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {denunciados.map((p) => (
              <div key={p.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-4 flex flex-col sm:flex-row items-center gap-6 hover:bg-white/10 transition-colors">
                
                <div className="w-24 h-24 sm:w-20 sm:h-20 shrink-0 bg-zinc-900 rounded-2xl overflow-hidden relative border border-white/10">
                  {p.foto_url ? (
                     <CachedImage src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black">X</div>
                  )}
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-bl-xl shadow-md border-l border-b border-red-400">
                    {p.total_denuncias}
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h3 className="text-lg font-black italic uppercase text-white truncate">{p.nome}, {p.idade}</h3>
                  <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest truncate mt-0.5">
                    {p.curso || 'CURSO NÃO INFORMADO'}
                  </p>
                  <p className="text-white/40 text-[9px] font-bold mt-2 uppercase">
                    ID: <span className="font-mono">{p.id.split('-')[0]}...</span>
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => perdoarPerfil(p.id, p.nome)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-5 py-4 sm:py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 transition-all active:scale-95"
                  >
                    <XCircle size={14} /> Perdoar
                  </button>
                  <button 
                    onClick={() => listShadowBan(p.id, p.nome)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-5 py-4 sm:py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-500/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                  >
                    <Trash2 size={14} /> Shadow Ban
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}