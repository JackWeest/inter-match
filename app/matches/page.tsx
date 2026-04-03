'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { AtSign, Heart, ChevronRight, X, User, GraduationCap } from 'lucide-react';

export default function MeusMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const router = useRouter();
  
  const matchesLiberados = true; 

  useEffect(() => {
    let montado = true;
    if (matchesLiberados && montado) {
      buscarMatchesMutuos();
    }
    return () => { montado = false; };
  }, []);

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
      {/* 💉 FUNDO UNIFICADO OBSIDIANA */}
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      {/* 💉 AJUSTE: pb-40 garante que a Navbar não cubra o último item */}
      <main className="min-h-[100dvh] bg-transparent pb-40 flex flex-col items-center px-6 relative z-10 overflow-x-hidden">
        
        {/* HEADER REDUZIDO */}
        <div className="w-full max-w-sm pt-10 pb-6 flex flex-col items-center text-center">
          <h1 className="text-2xl font-black text-white flex items-center gap-2 drop-shadow-lg italic uppercase tracking-tight">
            Seus Matches <Heart size={22} className="text-orange-500" fill="currentColor"/>
          </h1>
          <p className="text-orange-500 text-[9px] font-black mt-1 uppercase tracking-[0.2em] opacity-80">
            Conexões confirmadas
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
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
                {/* FOTO REDUZIDA */}
                <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden border border-white/10 group-hover:border-orange-500/50 transition-colors bg-zinc-900">
                  {match.foto_url ? (
                    <img src={match.foto_url} alt={match.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <User size={20} />
                    </div>
                  )}
                </div>

                {/* TEXTO AJUSTADO */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-base leading-tight uppercase italic truncate">
                    {match.nome}, {match.age || match.idade}
                  </h3>
                  <p className="text-white/40 text-[9px] font-black uppercase truncate tracking-wider mt-0.5">
                    {match.mostrar_curso ? (match.curso || 'Visitante') : 'Convidado'}
                  </p>
                </div>
                
                <ChevronRight className="text-white/10 group-hover:text-orange-500 transition-colors" size={20} />
              </div>
            ))}
            
            {/* 💉 ESPAÇADOR DE SEGURANÇA NO FINAL DA LISTA */}
            <div className="h-10 w-full pointer-events-none" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-dashed border-white/10">
              <p className="text-white/20 font-black uppercase text-[10px] tracking-[0.2em] leading-relaxed">
                Nenhum match detectado... <br/>
                <span className="text-orange-500/50">volte para a triagem! 🚑</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE PREVIEW (MANTIDO PREMIUM) */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedMatch(null)} />
          
          <div className="relative w-full max-w-xs bg-[#1a1410] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="relative aspect-[3/4] w-full bg-zinc-800">
              {selectedMatch.foto_url ? (
                <img src={selectedMatch.foto_url} alt={selectedMatch.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-2">
                  <User size={64} />
                  <span className="text-[10px] font-black">SEM FOTO</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410] via-transparent to-transparent" />
              
              <button 
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 pt-0 -mt-16 relative">
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">
                {selectedMatch.nome}, {selectedMatch.age || selectedMatch.idade}
              </h2>
              
              <div className="flex flex-col gap-2.5 mt-4">
                {selectedMatch.mostrar_curso && (
                  <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase tracking-widest">
                    <GraduationCap size={14} />
                    {selectedMatch.curso}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase text-white/50 border border-white/5">
                    {selectedMatch.genero}
                  </span>
                </div>

                {selectedMatch.insta && (
                  <a 
                    href={`https://instagram.com/${selectedMatch.insta.replace('@', '')}`}
                    target="_blank"
                    className="w-full mt-2 h-12 bg-white text-black rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-lg"
                  >
                    <AtSign size={16} /> Chamar no Insta
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}