'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Heart, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [loading, setLoading] = useState(true);

  const carregarPerfis = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const { data: meuPerfil } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!meuPerfil) { router.push('/perfil'); return; }

      const { data: meusVotos } = await supabase.from('likes').select('receiver_id').eq('sender_id', user.id);
      const idsVotados = meusVotos?.map(v => v.receiver_id) || [];

      const { data: outrosPerfis } = await supabase.from('profiles').select('*').neq('id', user.id);

      if (outrosPerfis) {
        let perfisFiltrados = outrosPerfis.filter(p => !idsVotados.includes(p.id));
        perfisFiltrados = perfisFiltrados.filter(p => {
          const eu = meuPerfil;
          const outro = p;
          const euQueroVerOutro = (outro.genero === 'Homem' && eu.ver_homem) || (outro.genero === 'Mulher' && eu.ver_mulher) || (outro.genero === 'Não Binário' && eu.ver_nb);
          const outroQuerMeVer = (eu.genero === 'Homem' && outro.ver_homem) || (eu.genero === 'Mulher' && outro.ver_mulher) || (eu.genero === 'Não Binário' && outro.ver_nb);
          return euQueroVerOutro && outroQuerMeVer;
        });
        setPerfis(perfisFiltrados);
      }
    } catch (error) { console.error('Erro:', error); } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (searchParams.get('success') === 'true') {
      setShowToast(true);
      timeoutId = setTimeout(() => setShowToast(false), 4000);
    }
    carregarPerfis();
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [searchParams, carregarPerfis]);

  const votar = async (liked: boolean) => {
    const perfilAtual = perfis[indiceAtual];
    if (!perfilAtual) return;
    setIndiceAtual(prev => prev + 1);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('likes').insert({ sender_id: user.id, receiver_id: perfilAtual.id, liked });
    } catch (error) { console.error('Erro ao votar:', error); }
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0f051a] font-black italic text-orange-500 uppercase tracking-widest text-sm">
      SINCRONIZANDO... 🔥
    </div>
  );

  const perfilExibido = perfis[indiceAtual];

  return (
    <>
      {/* 💉 FUNDOS UNIFICADOS OBSIDIANA */}
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      {/* 💉 AJUSTE: pt-4 encosta o card no topo. pb-40 protege da Navbar */}
      <main className="relative flex min-h-[100dvh] flex-col items-center pt-4 pb-40 px-6 overflow-x-hidden">

        {showToast && (
          <div className="fixed top-4 z-[100] animate-in slide-in-from-top duration-500 bg-orange-500 text-white px-6 py-3 rounded-full shadow-2xl border border-white/20 font-black italic uppercase text-[10px] tracking-widest">
            🔥 Perfil pronto pro rolê!
          </div>
        )}

        {perfilExibido ? (
          /* 💉 CARD DARK GLASS - FOCO TOTAL */
          <div className="w-full max-w-sm bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 flex flex-col animate-in fade-in zoom-in-95 duration-500 relative z-10">

            {/* AREA DA FOTO */}
            <div className="w-full aspect-[4/5] bg-zinc-900 relative">
              {perfilExibido.foto_url ? (
                <Image
                  src={perfilExibido.foto_url}
                  alt={perfilExibido.nome}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/5">
                   <User size={100} />
                </div>
              )}
              
              {/* GRADIENTE INFERIOR */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />
              
              {/* INFOS OVERLAY */}
              <div className="absolute bottom-6 left-8 right-8">
                 <h2 className="text-3xl font-black text-white italic drop-shadow-md leading-none uppercase tracking-tight">
                   {perfilExibido.nome}, {perfilExibido.idade}
                 </h2>
                 {perfilExibido.mostrar_curso && (
                    <p className="text-orange-500 font-black uppercase text-[11px] tracking-[0.1em] mt-2 drop-shadow-sm">
                      {perfilExibido.curso || 'CONVIDADO'}
                    </p>
                 )}
              </div>
            </div>

            {/* BOTÕES DE AÇÃO - ESPAÇAMENTO CONTROLADO */}
            <div className="pt-4 pb-8 flex justify-center items-center gap-8">
              {/* DISLIKE */}
              <button
                onClick={() => votar(false)}
                className="w-16 h-16 bg-white/5 backdrop-blur-md border border-red-500/40 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/20 active:scale-90 transition-all"
              >
                <X size={32} strokeWidth={2.5} />
              </button>

              {/* LIKE */}
              <button
                onClick={() => votar(true)}
                className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(234,88,12,0.4)] hover:bg-orange-400 active:scale-90 transition-all border border-orange-400/50"
              >
                <Heart size={40} fill="currentColor" />
              </button>
            </div>
          </div>
        ) : (
          /* TELA VAZIA */
          <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center text-center mt-20">
            <div className="bg-white/5 backdrop-blur-md p-12 rounded-[3rem] border border-white/5 flex flex-col items-center gap-6 w-full">
              <div className="text-6xl animate-bounce">🏜️</div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Fim do Radar</h2>
              <p className="text-white/20 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                Ninguém novo por aqui... <br/> volte mais tarde! 🚑
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase text-white/50 hover:text-white transition-colors"
              >
                Recarregar
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function Matches() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#0f051a]" />}>
      <MatchesContent />
    </Suspense>
  );
}