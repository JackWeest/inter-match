'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Heart, Flame, Info, User } from 'lucide-react';

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
      if (!user) {
        router.push('/');
        return;
      }

      const { data: meuPerfil } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!meuPerfil) {
        router.push('/perfil');
        return;
      }

      const { data: meusVotos } = await supabase
        .from('likes')
        .select('receiver_id')
        .eq('sender_id', user.id);

      const idsVotados = meusVotos?.map(v => v.receiver_id) || [];

      const { data: outrosPerfis } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      if (outrosPerfis) {
        let perfisFiltrados = outrosPerfis.filter(p => !idsVotados.includes(p.id));

        perfisFiltrados = perfisFiltrados.filter(p => {
          const eu = meuPerfil;
          const outro = p;

          const euQueroVerOutro =
            (outro.genero === 'Homem' && eu.ver_homem === true) ||
            (outro.genero === 'Mulher' && eu.ver_mulher === true) ||
            (outro.genero === 'Não Binário' && eu.ver_nb === true);

          const outroQuerMeVer =
            (eu.genero === 'Homem' && outro.ver_homem === true) ||
            (eu.genero === 'Mulher' && outro.ver_mulher === true) ||
            (eu.genero === 'Não Binário' && outro.ver_nb === true);

          return euQueroVerOutro && outroQuerMeVer;
        });

        setPerfis(perfisFiltrados);
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    } finally {
      setLoading(false);
    }
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

      await supabase.from('likes').insert({
        sender_id: user.id,
        receiver_id: perfilAtual.id,
        liked: liked,
      });
    } catch (error) {
      console.error('Erro ao registrar voto:', error);
    }
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1a1410] font-black italic text-orange-500 uppercase tracking-widest text-sm">
      Buscando a galera... 🔥
    </div>
  );

  const perfilExibido = perfis[indiceAtual];

  return (
    <>
      {/* 💉 FUNDOS LÁ ATRÁS */}
      <div className="fixed inset-0 bg-[#1a1410] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <main className="relative flex min-h-[100dvh] flex-col items-center py-10 px-6 overflow-x-hidden">

        {showToast && (
          <div className="fixed top-8 z-[100] animate-in slide-in-from-top duration-500 bg-orange-500 text-white px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(234,88,12,0.4)] border border-white/20">
            <span className="font-black uppercase text-[10px] tracking-widest italic">🔥 Perfil pronto pra festa!</span>
          </div>
        )}

        <h1 className="text-3xl font-black text-white mb-8 italic uppercase tracking-tighter drop-shadow-lg flex items-center gap-2">
          Inter Match <Flame size={28} className="text-orange-500" fill="currentColor" />
        </h1>

        {perfilExibido ? (
          /* 💉 CARD DE TRIAGEM GLASSMORPHISM */
          <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex flex-col animate-in fade-in zoom-in-95 duration-500 relative z-10">

            {/* FOTO COM GRADIENTE */}
            <div className="w-full aspect-[3/4] bg-zinc-800 relative">
              {perfilExibido.foto_url ? (
                <Image
                  src={perfilExibido.foto_url}
                  alt={perfilExibido.nome}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-2">
                   <User size={80} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Sem Foto</span>
                </div>
              )}
              {/* Gradiente inferior para leitura do nome */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Nome e Idade flutuando sobre a foto */}
              <div className="absolute bottom-6 left-6 right-6">
                 <h2 className="text-3xl font-black text-white italic drop-shadow-lg leading-tight uppercase">
                   {perfilExibido.nome}, {perfilExibido.idade}
                 </h2>
                 {perfilExibido.mostrar_curso && (
                    <p className="text-orange-400 font-black uppercase text-[10px] tracking-[0.2em] mt-1 drop-shadow-md">
                      {perfilExibido.curso || 'UFC Sobral'}
                    </p>
                 )}
              </div>
            </div>

            {/* BOTÕES DE AÇÃO - Flutuando ou integrados no final */}
            <div className="p-8 flex justify-center items-center gap-6 bg-gradient-to-b from-transparent to-black/20">
              {/* DISLIKE */}
              <button
                onClick={() => votar(false)}
                className="w-16 h-16 bg-white/5 backdrop-blur-md border-2 border-red-500/50 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-500 hover:text-white active:scale-90 transition-all group"
              >
                <X size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
              </button>

              {/* LIKE */}
              <button
                onClick={() => votar(true)}
                className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_rgba(234,88,12,0.4)] hover:bg-orange-400 active:scale-90 transition-all"
              >
                <Heart size={40} fill="currentColor" />
              </button>
            </div>
          </div>
        ) : (
          /* 💉 TELA VAZIA DARK */
          <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center text-center mt-10">
            <div className="bg-white/5 backdrop-blur-md p-12 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center gap-6 w-full">
              <div className="text-6xl animate-pulse">🏜️</div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Fim da Linha</h2>
              <p className="text-white/30 font-bold uppercase text-[10px] tracking-[0.2em] leading-relaxed">
                Não tem mais ninguém no radar... <br/>
                <span className="text-orange-500/60">volte mais tarde! 🚑</span>
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-white/50 hover:text-white transition-colors"
              >
                Recarregar página
              </button>
            </div>
          </div>
        )}
        
        {/* Espaçamento para Navbar */}
        <div className="h-24" />
      </main>
    </>
  );
}

export default function Matches() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-[#1a1410] font-black italic text-orange-500 uppercase tracking-widest text-sm">
        Carregando...
      </div>
    }>
      <MatchesContent />
    </Suspense>
  );
}