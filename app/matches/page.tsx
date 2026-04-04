'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { AtSign, Heart, ChevronRight, X, User, GraduationCap, RotateCcw, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function MeusMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [flipped, setFlipped] = useState(false);
  const router = useRouter();
  
  const matchesLiberados = true; 

  useEffect(() => {
    let montado = true;
    if (matchesLiberados && montado) {
      buscarMatchesMutuos();
    }
    return () => { montado = false; };
  }, []);

  // Resetar o flip ao fechar o modal
  useEffect(() => {
    if (!selectedMatch) setFlipped(false);
  }, [selectedMatch]);

  const buscarMatchesMutuos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data: meusLikes } = await supabase.from('likes').select('receiver_id').eq('sender_id', user.id).eq('liked', true);
      const { data: likesRecebidos } = await supabase.from('likes').select('sender_id').eq('receiver_id', user.id).eq('liked', true);

      if (meusLikes && likesRecebidos) {
        const idsMeusLikes = meusLikes.map(l => l.receiver_id);
        const idsLikesRecebidos = likesRecebidos.map(l => l.sender_id);
        const idsMatches = idsMeusLikes.filter(id => idsLikesRecebidos.includes(id));

        if (idsMatches.length > 0) {
          const { data: perfisMatches } = await supabase.from('profiles').select('*').in('id', idsMatches);
          setMatches(perfisMatches || []);
        }
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <main className="min-h-[100dvh] bg-transparent pb-40 flex flex-col items-center px-6 relative z-10 overflow-x-hidden">
        
        {/* HEADER */}
        <div className="w-full max-w-sm pt-10 pb-6 flex flex-col items-center text-center">
          <h1 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-lg italic uppercase tracking-tight">
            Seus Matches <Heart size={22} className="text-orange-500" fill="currentColor"/>
          </h1>
          <p className="text-orange-500 text-[9px] font-black mt-1 uppercase tracking-[0.2em] opacity-80">
            Conexões confirmadas
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : matches.length > 0 ? (
          <div className="w-full max-w-sm flex flex-col gap-3">
            {matches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => setSelectedMatch(match)}
                className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md p-3 rounded-[1.5rem] shadow-lg border border-white/5 active:scale-[0.98] transition-all group cursor-pointer"
              >
                <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden border border-white/10 group-hover:border-orange-500/50 transition-colors bg-zinc-900">
                  {match.foto_url ? (
                    <img src={match.foto_url} alt={match.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10"><User size={20} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-base leading-tight uppercase italic truncate">{match.nome}, {match.idade}</h3>
                  <p className="text-white/40 text-[9px] font-black uppercase truncate tracking-wider mt-0.5">
                    {match.atletica || 'Convidado'}
                  </p>
                </div>
                <ChevronRight className="text-white/10 group-hover:text-orange-500 transition-colors" size={20} />
              </div>
            ))}
            <div className="h-10 w-full pointer-events-none" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-dashed border-white/10 text-center">
              <p className="text-white/20 font-black uppercase text-[10px] tracking-[0.2em] leading-relaxed">
                Nenhum match detectado... <br/>
                <span className="text-orange-500/50">volte para a triagem! 🚑</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL DE PREVIEW ── */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedMatch(null)} />
          
          <div 
            className="relative w-full max-w-sm cursor-pointer" 
            style={{ perspective: '1200px' }}
            onClick={() => setFlipped(!flipped)}
          >
            <div
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                position: 'relative',
              }}
            >
              {/* ── FRENTE DO CARD ── */}
              <div
                className="w-full aspect-[4/5] bg-[#1a1a1a] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10 relative flex flex-col"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="absolute inset-0 z-0">
                  {selectedMatch.foto_url ? (
                    <Image src={selectedMatch.foto_url} alt={selectedMatch.nome} fill className="object-cover" priority />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1a1a] text-white/5"><User size={80} /></div>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 pointer-events-none" />

                {/* BOTÃO FLIP ESCURECIDO (ESQUERDA) */}
                <div className="absolute top-5 left-5 z-30 bg-black/80 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-2xl transition-all">
                  <RotateCcw size={10} className="text-orange-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Ver mais</span>
                </div>

                {/* FECHAR (DIREITA) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedMatch(null); }}
                  className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tight drop-shadow-md">
                      {selectedMatch.nome}, {selectedMatch.idade}
                    </h2>
                    <p className="text-orange-500 font-black text-[10px] uppercase tracking-widest drop-shadow-sm">
                      {selectedMatch.atletica || 'Convidado'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-[8px] font-black uppercase text-white/80 border border-white/10">
                        {selectedMatch.genero}
                      </span>
                    </div>
                  </div>

                  {selectedMatch.insta && (
                    <a 
                      href={`https://instagram.com/${selectedMatch.insta.replace('@', '')}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-12 bg-white text-black rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-lg"
                    >
                      <AtSign size={16} /> Chamar no Insta
                    </a>
                  )}
                </div>
              </div>

              {/* ── VERSO DO CARD (TRANSPLANTE DO RADAR) ── */}
              <div
                className="absolute inset-0 w-full aspect-[4/5] bg-[#0f051a] backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {/* Header Verso */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-zinc-900">
                    {selectedMatch.foto_url 
                      ? <img src={selectedMatch.foto_url} alt={selectedMatch.nome} className="w-full h-full object-cover" /> 
                      : <div className="w-full h-full flex items-center justify-center text-white/10"><User size={20} /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-black italic uppercase text-lg leading-none truncate">{selectedMatch.nome}, {selectedMatch.idade}</h3>
                    <p className="text-orange-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Ficha do Participante</p>
                  </div>
                </div>

                {/* BOTÃO VOLTAR (POSICIONADO À DIREITA NO VERSO) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                  className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-colors shadow-2xl"
                >
                  <ArrowLeft size={20} />
                </button>

                {/* Conteúdo Verso */}
                <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar relative z-10">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1.5">Acadêmico</p>
                    <p className="text-white font-bold text-xs uppercase tracking-wide">
                      {selectedMatch.curso} <span className="text-orange-500 mx-0.5">/</span> {selectedMatch.instituicao}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1.5">Atlética</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        ⚔️ {selectedMatch.atletica || 'Convidado'}
                      </span>
                      {selectedMatch.cargo_atletica && (
                        <span className="bg-white/5 border border-white/10 text-white/40 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {selectedMatch.cargo_atletica}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1.5">Participação</p>
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${selectedMatch.tipo_participacao === 'completo' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                      {selectedMatch.tipo_participacao === 'completo' ? '🎉 Evento Completo' : '🎊 Só a Festa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}