'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Heart, User, AtSign, RotateCcw, AlertTriangle, Undo2 } from 'lucide-react';
import CachedImage from '../components/CachedImage';
import { preloadBatch } from '../../lib/photo-cache';

export const dynamic = 'force-dynamic';

function TriagemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileToReport, setProfileToReport] = useState<any>(null);

  const carregarPerfis = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/'); return; }
      const user = session.user;

      const { data: meuPerfil } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!meuPerfil) { router.push('/perfil'); return; }

      // FANTASMA DA ÓPERA: Infrator só vai enxergar o vazio para sempre, se frustrar e parar de usar o app
      if (meuPerfil.is_banned === true) {
        const fakePerfis: any = [];
        fakePerfis._meu_is_banned = true;
        setPerfis(fakePerfis);
        setLoading(false);
        return;
      }

      const { data: meusVotos } = await supabase.from('likes').select('receiver_id').eq('sender_id', user.id);
      const idsVotados = meusVotos?.map(v => v.receiver_id) || [];

      let query = supabase
        .from('profiles')
        .select('id, nome, idade, genero, orientacao, atletica, cargo_atletica, curso, instituicao, insta, foto_url, tipo_participacao, mostrar_orientacao, mostrar_curso')
        .neq('id', user.id)
        .neq('is_banned', true);

      // Filtro de gênero cruzado (o outro precisa querer ver meu gênero)
      if (meuPerfil.genero === 'Homem') query = query.eq('ver_homem', true);
      else if (meuPerfil.genero === 'Mulher') query = query.eq('ver_mulher', true);
      else if (meuPerfil.genero === 'Não Binário') query = query.eq('ver_nb', true);

      // Filtro de gênero (eu preciso querer ver o gênero do outro)
      let genderFilter = [];
      if (meuPerfil.ver_homem) genderFilter.push('genero.eq.Homem');
      if (meuPerfil.ver_mulher) genderFilter.push('genero.eq.Mulher');
      if (meuPerfil.ver_nb) genderFilter.push('genero.eq.Não Binário');

      if (genderFilter.length > 0) {
        query = query.or(genderFilter.join(','));
      } else {
        setPerfis([]);
        setLoading(false);
        return;
      }

      if (idsVotados.length > 0) {
        // Envia todos os IDs já votados para exclusão (evita perfis repetidos)
        query = query.not('id', 'in', `(${idsVotados.join(',')})`);
      }

      // Baixamos apenas um "batch" para economizar memória e banda na Vercel / Supabase
      query = query.limit(30);

      const { data: outrosPerfis } = await query;

      if (outrosPerfis) {
        setPerfis(outrosPerfis);
        // 🔥 Carrega apenas a primeira "fornada" de fotos
        preloadBatch(outrosPerfis.slice(0, 5).map((p: any) => p.foto_url).filter(Boolean));
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

  // 💉 Motor de Preload Contínuo (Janela Deslizante)
  // Conforme o usuário vota, vai baixando as próximas 3 fotos silenciosamente
  useEffect(() => {
    if (perfis.length > 0 && indiceAtual < perfis.length) {
      // Pega um "recorte" seguro logo à frente de onde o usuário está
      const proximasFotos = perfis
        .slice(indiceAtual, indiceAtual + 3)
        .map(p => p.foto_url)
        .filter(Boolean);
        
      preloadBatch(proximasFotos);
    }
  }, [indiceAtual, perfis]);

  const votando = useRef(false);

  const votar = async (liked: boolean) => {
    if (votando.current) return;
    votando.current = true;
    
    const perfilAtual = perfis[indiceAtual];
    if (!perfilAtual) {
      votando.current = false;
      return;
    }
    setFlipped(false);
    setIndiceAtual(prev => prev + 1);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const user = session.user;
      await supabase.from('likes').upsert({ sender_id: user.id, receiver_id: perfilAtual.id, liked });
    } catch (error) { 
      console.error('Erro ao votar:', error); 
    } finally {
      votando.current = false;
    }
  };

  const confirmarDenuncia = async () => {
    if (!profileToReport) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase.from('reports').insert({
          reporter_id: session.user.id,
          reported_id: profileToReport.id
        });
        
        if (error) console.error('Erro ao salvar denúncia:', error);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    }
    setProfileToReport(null);
    votar(false); // Pula o perfil
  };

  const desfazerVoto = async () => {
    if (indiceAtual === 0) return;
    const previousIndex = indiceAtual - 1;
    const perfilAnterior = perfis[previousIndex];
    if (!perfilAnterior) return;

    // Volta imediatamente na UI
    setIndiceAtual(previousIndex);
    setFlipped(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Apaga o like/dislike dado para esse destinatário
      await supabase
        .from('likes')
        .delete()
        .match({ sender_id: session.user.id, receiver_id: perfilAnterior.id });
    } catch (error) {
      console.error('Erro ao desfazer voto:', error);
    }
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0f051a] font-black italic text-orange-500 uppercase tracking-widest text-sm">
      SINCRONIZANDO... 🔥
    </div>
  );

  const p = perfis[indiceAtual] || null;
  const isAlcateia = p?.atletica?.trim().toUpperCase().replace('É', 'E') === 'ALCATEIA';

  return (
    <>
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <main className="flex-1 w-full flex flex-col justify-center items-center px-6 pt-4 pb-28 overflow-hidden">

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
                  className={`w-full bg-[#1a1a1a] backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden border flex flex-col relative transition-all ${isAlcateia ? 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.3)] ring-1 ring-orange-500/20' : 'border-white/10'}`}
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
                >
                  {isAlcateia && (
                    <div className="absolute top-4 left-4 z-50 pointer-events-none">
                      <img src="/alcateia.png" alt="Selo Alcateia" className="w-16 h-16 object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]" />
                    </div>
                  )}

                  {!isAlcateia && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setProfileToReport(p); }} 
                      className="absolute top-4 left-4 z-50 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-red-500/80 hover:border-red-500 hover:text-white active:scale-90 transition-all pointer-events-auto"
                    >
                      <AlertTriangle size={18} />
                    </button>
                  )}
                  
                  <div className="w-full aspect-[4/5] bg-zinc-900 relative">
                    {p.foto_url ? (
                      /* CIRURGIA APLICADA: Substituído img por CachedImage na FRENTE */
                      <CachedImage src={p.foto_url} alt={p.nome} className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/5 absolute inset-0">
                        <User size={100} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />

                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                      <RotateCcw size={13} className="text-orange-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Ver mais</span>
                    </div>

                    <div className="absolute bottom-2 left-6 right-6 flex flex-col gap-1.5 z-10">
                      <h2 className="text-3xl font-black italic leading-none uppercase tracking-tight flex items-center gap-2">
                        <span className={isAlcateia ? "bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent [-webkit-text-stroke:0.5px_rgba(255,255,255,0.7)]" : "text-white"}>
                          {p.nome}, {p.idade}
                        </span>
                      </h2>
                      {p.mostrar_curso && (p.curso || p.instituicao) && (
                        <p className="text-orange-400 font-black uppercase text-[11px] tracking-[0.15em] leading-none">
                          {[p.curso, p.instituicao].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {p.genero && (
                          <span className="bg-black/50 backdrop-blur-md border border-white/10 text-white/70 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {p.genero}
                          </span>
                        )}
                        {p.atletica && (
                          <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white/80 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                            ⚔️ {p.atletica}
                          </span>
                        )}
                        {p.insta && (
                          <span className="bg-black/50 backdrop-blur-md border border-white/10 text-white/50 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <AtSign size={8} className="text-orange-500" />{p.insta.replace('@', '')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 pb-7 px-8 flex justify-center items-center gap-4 w-full relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => votar(false)} className="w-[4.5rem] h-[4.5rem] bg-white/5 shrink-0 backdrop-blur-md border border-red-500/40 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/20 active:scale-90 transition-all">
                      <X size={36} strokeWidth={2.5} />
                    </button>
                    
                    <button 
                      onClick={desfazerVoto} 
                      disabled={indiceAtual === 0}
                      className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center transition-all ${
                        indiceAtual > 0 
                          ? 'bg-white/5 backdrop-blur-md border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/20 active:scale-90' 
                          : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      <Undo2 size={24} strokeWidth={2.5} />
                    </button>

                    <button 
                      onClick={(e) => { 
                        if (!p.insta) return;
                        e.stopPropagation(); 
                        window.open(`https://instagram.com/${p.insta.replace('@', '')}`, '_blank'); 
                      }} 
                      disabled={!p.insta}
                      className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center transition-all ${
                        p.insta 
                          ? 'bg-white/5 backdrop-blur-md border border-pink-500/40 text-pink-500 hover:bg-pink-500/20 active:scale-90' 
                          : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                    </button>
                    
                    <button onClick={() => votar(true)} className="w-[4.5rem] h-[4.5rem] shrink-0 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(234,88,12,0.4)] hover:bg-orange-400 active:scale-90 transition-all border border-orange-400/50">
                      <Heart size={36} fill="currentColor" />
                    </button>
                  </div>
                </div>

                {/* ── VERSO ── */}
                <div
                  className={`absolute inset-0 w-full bg-[#130826] backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border flex flex-col overflow-hidden transition-all ${isAlcateia ? 'border-orange-500/50 ring-1 ring-orange-500/20' : 'border-white/10'}`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {isAlcateia && (
                    <div className="absolute bottom-[8.5rem] right-8 z-[60] pointer-events-none opacity-80">
                      <img src="/alcateia.png" alt="Selo Alcateia" className="w-16 h-16 object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 px-7 pt-7 pb-5 border-b border-white/5 relative z-10">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-zinc-900">
                      {p.foto_url
                        ? <CachedImage src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" /> /* CIRURGIA APLICADA NO VERSO */
                        : <div className="w-full h-full flex items-center justify-center text-white/10"><User size={24} /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h3 className={`font-black italic uppercase text-xl leading-none truncate ${isAlcateia ? "bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent [-webkit-text-stroke:0.5px_rgba(255,255,255,0.7)]" : "text-white"}`}>
                        {p.nome}, {p.idade}
                      </h3>
                      {p.mostrar_curso && (p.curso || p.instituicao) && (
                        <p className="text-orange-400 text-[11px] font-black uppercase tracking-widest mt-1 truncate">
                          {[p.curso, p.instituicao].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isAlcateia && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setProfileToReport(p); }}
                          className="bg-white/5 border border-white/10 rounded-full p-2.5 flex items-center justify-center hover:bg-red-500/20 text-white/40 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
                        >
                          <AlertTriangle size={13} />
                        </button>
                      )}
                      <div className="bg-white/5 border border-white/10 rounded-full p-2.5 flex items-center justify-center">
                        <RotateCcw size={13} className="text-orange-400" />
                      </div>
                    </div>
                  </div>

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
                          )} {/* 👈 O ERRO ESTAVA AQUI! O ')}' FOI RECUPERADO */}
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

                  <div className="pt-4 pb-8 px-8 flex justify-center items-center gap-5 w-full relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => votar(false)} className="w-[4.5rem] h-[4.5rem] bg-white/5 shrink-0 backdrop-blur-md border border-red-500/40 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/20 active:scale-90 transition-all">
                      <X size={36} strokeWidth={2.5} />
                    </button>

                    <button 
                      onClick={desfazerVoto} 
                      disabled={indiceAtual === 0}
                      className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center transition-all ${
                        indiceAtual > 0 
                          ? 'bg-white/5 backdrop-blur-md border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/20 active:scale-90' 
                          : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      <Undo2 size={28} strokeWidth={2.5} />
                    </button>

                    <button 
                      onClick={(e) => { 
                        if (!p.insta) return;
                        e.stopPropagation(); 
                        window.open(`https://instagram.com/${p.insta.replace('@', '')}`, '_blank'); 
                      }} 
                      disabled={!p.insta}
                      className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center transition-all ${
                        p.insta 
                          ? 'bg-white/5 backdrop-blur-md border border-pink-500/40 text-pink-500 hover:bg-pink-500/20 active:scale-90' 
                          : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                    </button>

                    <button onClick={() => votar(true)} className="w-20 h-20 bg-orange-500 shrink-0 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(234,88,12,0.4)] hover:bg-orange-400 active:scale-90 transition-all border border-orange-400/50">
                      <Heart size={40} fill="currentColor" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center text-center mt-20">
            <div className="bg-white/5 backdrop-blur-md p-12 rounded-[3rem] border border-white/5 flex flex-col items-center gap-6 w-full">
              <div className="text-6xl animate-bounce">🏜️</div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Fim do Radar</h2>
              <p className="text-white/20 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                Ninguém novo por aqui... <br /> volte mais tarde! 🚑
              </p>
              <button onClick={() => { setLoading(true); setIndiceAtual(0); carregarPerfis(); }} className="mt-4 px-6 py-2 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase text-white/50 hover:text-white transition-colors">
                Recarregar
              </button>
            </div>
          </div>
        )}

        {/* ── MODAL DE DENÚNCIA ── */}
        {profileToReport && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90">
            <div className="absolute inset-0" onClick={() => setProfileToReport(null)} />
            <div className="relative w-full max-w-sm bg-[#0f051a] backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.15)] p-8 flex flex-col items-center text-center border border-red-500/20 animate-in zoom-in-95 duration-200">
              <div className="bg-red-500/20 text-red-500 p-4 rounded-full mb-5 ring-4 ring-red-500/10">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black italic text-white mb-2 leading-tight uppercase">Atenção!</h3>
              <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mb-8 leading-relaxed">
                Você tem certeza que deseja denunciar <span className="text-white">"{profileToReport.nome}"</span>? <br/><br/>
                Perfis denunciados serão revisados por nossa equipe e poderão ser excluídos para sempre se quebrarem as regras.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={confirmarDenuncia} className="w-full h-14 bg-red-500/20 font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center hover:bg-red-500/30 active:scale-95 transition-all border border-red-500/30 text-red-500 shadow-xl shadow-red-500/10">
                  ⚠️ Sim, quero denunciar
                </button>
                <button onClick={() => setProfileToReport(null)} className="w-full h-14 bg-white/5 font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all border border-white/10 text-white/50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
}

export default function Triagem() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#0f051a]" />}>
      <TriagemContent />
    </Suspense>
  );
}