'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Heart, User, AtSign, RotateCcw } from 'lucide-react';
import CachedImage from '../components/CachedImage';
import { preloadBatch } from '../../lib/photo-cache';

export const dynamic = 'force-dynamic';

type Perfil = {
  id: string;
  nome: string;
  idade: number;
  genero: string;
  orientacao: string;
  curso: string;
  instituicao: string;
  insta: string;
  foto_url: string;
  atletica: string;
  cargo_atletica: string;
  tipo_participacao: string;
  mostrar_curso: boolean;
  mostrar_orientacao: boolean;
};

const BATCH_SIZE = 20;

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [votando, setVotando] = useState(false);
  const [offset, setOffset] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const votosPendentesRef = useRef<Set<string>>(new Set());

  const carregarPerfis = useCallback(async (offsetValor?: number, append?: boolean) => {
    try {
      const ofst = offsetValor ?? offset;
      if (!append) {
        setLoading(true);
      } else {
        setCarregandoMais(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/'); return; }
      const user = session.user;

      const { data: perfisCompatíveis, error } = await supabase
        .rpc('get_perfis_compativeis', {
          p_user_id: user.id,
          p_limit: BATCH_SIZE,
          p_offset: ofst,
        });

      if (error) {
        console.error('Erro RPC:', error);
      } else if (perfisCompatíveis) {
        const proximos = perfisCompatíveis as Perfil[];
        if (append) {
          setPerfis(prev => [...prev, ...proximos]);
        } else {
          setPerfis(proximos);
          setIndiceAtual(0);
        }
        if (append) {
          setOffset(ofst + BATCH_SIZE);
        }
      }
    } catch (error) { console.error('Erro:', error); } finally {
      setLoading(false);
      setCarregandoMais(false);
    }
  }, [offset, router]);

  const carregarMaisPerfis = () => {
    carregarPerfis(offset + BATCH_SIZE, true);
  };

  // Pré-carrega as próximas 5 fotos em background
  useEffect(() => {
    const start = indiceAtual + 1;
    const end = Math.min(start + 5, perfis.length);
    const urlFotos = perfis.slice(start, end).map(pf => pf.foto_url);
    if (urlFotos.length > 0) preloadBatch(urlFotos);
  }, [indiceAtual, perfis]);

  // Quando perfis chegam do zero (não append), pré-carrega o lote inicial
  useEffect(() => {
    if (perfis.length > 0 && indiceAtual === 0) {
      preloadBatch(perfis.map(pf => pf.foto_url));
    }
  }, [perfis]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (searchParams.get('success') === 'true') {
      setShowToast(true);
      timeoutId = setTimeout(() => setShowToast(false), 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    carregarPerfis(0, false);
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [searchParams]);

  const votar = async (liked: boolean) => {
    const perfilAtual = perfis[indiceAtual];
    if (!perfilAtual || votando) return;
    setVotando(true);
    setFlipped(false);
    setIndiceAtual(prev => prev + 1);

    if (votosPendentesRef.current.has(perfilAtual.id)) {
      setVotando(false);
      return;
    }
    votosPendentesRef.current.add(perfilAtual.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setVotando(false); return; }
      const user = session.user;
      const { error } = await supabase.from('likes').insert({ sender_id: user.id, receiver_id: perfilAtual.id, liked });
      if (error) votosPendentesRef.current.delete(perfilAtual.id);

      // Se deu like, verifica se virou match mútuo
      if (liked) {
        const { data: matchVerificacao } = await supabase
          .rpc('get_matches_mutuos', { p_user_id: user.id });
        if (matchVerificacao && (matchVerificacao as any[]).some((m: any) => m.id === perfilAtual.id)) {
          window.dispatchEvent(new CustomEvent('match-created'));
          window.dispatchEvent(new CustomEvent('new-match'));
        }
      }
    } catch (error) { console.error('Erro ao votar:', error); votosPendentesRef.current.delete(perfilAtual.id); }

    if (indiceAtual >= perfis.length - 1) {
      carregarMaisPerfis();
    }
    setVotando(false);
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0f051a] font-black italic text-orange-500 uppercase tracking-widest text-sm">
      SINCRONIZANDO... 🔥
    </div>
  );

  const p = perfis[indiceAtual];

  return (
    <>
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <main className="relative flex min-h-[100dvh] flex-col items-center pt-4 pb-40 px-6 overflow-x-hidden">

        {showToast && (
          <div className="fixed top-4 z-[100] animate-in slide-in-from-top duration-500 bg-orange-500 text-white px-6 py-3 rounded-full shadow-2xl border border-white/20 font-black italic uppercase text-[10px] tracking-widest">
            🔥 Perfil pronto pro rolê!
          </div>
        )}

        {p ? (
          <div className="w-full max-w-sm flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500 relative z-10">

            <div
              className="w-full cursor-pointer"
              style={{ perspective: '1200px' }}
              onClick={() => setFlipped(f => !f)}
            >
              <div
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  position: 'relative',
                }}
              >

                {/* ── FRENTE ── */}
                <div
                  className="w-full bg-[#1a1a1a] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 flex flex-col"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="w-full aspect-[4/5] bg-zinc-900 relative">
                    {p.foto_url ? (
                      <CachedImage src={p.foto_url} alt={p.nome} className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/5 absolute inset-0">
                        <User size={100} />
                      </div>
                    )}
                    {/* Degradê que morre no fundo do card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />

                    <div className="absolute top-4 right-4 bg-black/50  border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                      <RotateCcw size={13} className="text-orange-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Ver mais</span>
                    </div>

                    {/* Informações movidas mais para baixo (bottom-2) */}
                    <div className="absolute bottom-2 left-6 right-6 flex flex-col gap-1.5">
                      <h2 className="text-3xl font-black text-white italic drop-shadow-md leading-none uppercase tracking-tight">
                        {p.nome}, {p.idade}
                      </h2>
                      {p.mostrar_curso && (p.curso || p.instituicao) && (
                        <p className="text-orange-400 font-black uppercase text-[11px] tracking-[0.15em] leading-none">
                          {[p.curso, p.instituicao].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {p.genero && (
                          <span className="bg-black/50  border border-white/10 text-white/70 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {p.genero}
                          </span>
                        )}
                        {p.atletica && (
                          <span className="bg-white/10  border border-white/10 text-white/80 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                            ⚔️ {p.atletica}
                          </span>
                        )}
                        {p.insta && (
                          <span className="bg-black/50  border border-white/10 text-white/50 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <AtSign size={8} className="text-orange-500" />{p.insta.replace('@', '')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Barra inferior incorporada com botões levemente reduzidos */}
                  <div className="pt-3 pb-7 flex justify-center items-center gap-6" onClick={e => e.stopPropagation()}>
                    <button onClick={() => votar(false)} className="w-14 h-14 bg-white/5  border border-red-500/40 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/20 active:scale-90 transition-all">
                      <X size={28} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => votar(true)} className="w-18 h-18 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(234,88,12,0.4)] hover:bg-orange-400 active:scale-90 transition-all border border-orange-400/50">
                      <Heart size={36} fill="currentColor" />
                    </button>
                  </div>
                </div>

                {/* ── VERSO (MANTIDO EXATAMENTE IGUAL) ── */}
                <div
                  className="absolute inset-0 w-full bg-[#130826] bg-opacity-100 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {/* Topo */}
                  <div className="flex items-center gap-4 px-7 pt-7 pb-5 border-b border-white/5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-zinc-900">
                        {p.foto_url
                        ? <CachedImage src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-white/10"><User size={24} /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-black italic uppercase text-xl leading-none truncate">{p.nome}, {p.idade}</h3>
                      {p.mostrar_curso && (p.curso || p.instituicao) && (
                        <p className="text-orange-400 text-[11px] font-black uppercase tracking-widest mt-1 truncate">
                          {[p.curso, p.instituicao].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-full p-2 shrink-0">
                      <RotateCcw size={13} className="text-orange-400" />
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="flex-1 px-7 py-6 flex flex-col gap-5 overflow-y-auto">

                    {(p.genero || (p.mostrar_orientacao && p.orientacao)) && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-3">Identidade</p>
                        <div className="flex flex-wrap gap-2">
                          {p.genero && (
                            <span className="bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest">
                              {p.genero}
                            </span>
                          )}
                          {p.mostrar_orientacao && p.orientacao && (
                            <span className="bg-orange-500/15 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest">
                              {p.orientacao}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {p.atletica && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-3">Atlética</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest">
                            ⚔️ {p.atletica}
                          </span>
                          {p.cargo_atletica && (
                            <span className="bg-white/5 border border-white/10 text-white/40 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest">
                              {p.cargo_atletica}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {p.tipo_participacao && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-3">Participação</p>
                        <span className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border ${p.tipo_participacao === 'completo' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                          {p.tipo_participacao === 'completo' ? '🎉 Evento Completo' : '🎊 Só a Festa'}
                        </span>
                      </div>
                    )}

                    {p.insta && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-3">Instagram</p>
                        <span className="bg-black/40 border border-white/10 text-white/60 px-4 py-2 rounded-full text-[11px] font-bold flex items-center gap-2 w-fit">
                          <AtSign size={12} className="text-orange-500" />@{p.insta.replace('@', '')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botões verso */}
                  <div className="pt-4 pb-8 flex justify-center items-center gap-8" onClick={e => e.stopPropagation()}>
                    <button onClick={() => votar(false)} className="w-16 h-16 bg-white/5  border border-red-500/40 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/20 active:scale-90 transition-all">
                      <X size={32} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => votar(true)} className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(234,88,12,0.4)] hover:bg-orange-400 active:scale-90 transition-all border border-orange-400/50">
                      <Heart size={40} fill="currentColor" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center text-center mt-20">
            <div className="bg-white/5  p-12 rounded-[3rem] border border-white/5 flex flex-col items-center gap-6 w-full">
              <div className="text-6xl animate-bounce">🏜️</div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Fim do Radar</h2>
              <p className="text-white/20 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                Ninguém novo por aqui... <br /> volte mais tarde! 🚑
              </p>
              <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase text-white/50 hover:text-white transition-colors">
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