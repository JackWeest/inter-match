'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { AtSign, Lock, ChevronRight, Heart, X, MapPin, GraduationCap } from 'lucide-react';

export default function MeusMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null); // 💉 ESTADO DO PREVIEW
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
      {/* FUNDOS (Mesma identidade das outras telas) */}
      <div className="fixed inset-0 bg-[#1a1410] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <main className="min-h-[100dvh] bg-transparent pb-32 flex flex-col items-center px-6 relative z-10 overflow-x-hidden">
        
        {/* HEADER */}
        <div className="w-full max-w-md pt-12 pb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-lg italic uppercase tracking-tight">
            Seus Matches <Heart size={28} className="text-orange-500" fill="currentColor"/>
          </h1>
          <p className="text-orange-500 text-[10px] font-black mt-2 uppercase tracking-[0.2em]">
            Vê se não perde tempo...
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : matches.length > 0 ? (
          <div className="w-full max-w-md flex flex-col gap-4">
            {matches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => setSelectedMatch(match)} // 💉 ABRE O PREVIEW
                className="flex items-center gap-4 bg-white/5 hover:bg-white/10 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white/10 active:scale-95 transition-all group cursor-pointer"
              >
                <div className="relative w-16 h-16 shrink-0">
                  <img src={match.foto_url} className="w-full h-full rounded-full object-cover border-2 border-white/10 group-hover:border-orange-500/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-lg leading-tight uppercase italic truncate">{match.nome}, {match.idade}</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase truncate mt-1">
                    {match.mostrar_curso ? (match.curso || 'Estudante') : 'Visitante'}
                  </p>
                </div>
                <ChevronRight className="text-white/20 group-hover:text-orange-500 transition-colors" size={24} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/20 font-black uppercase text-[10px] tracking-widest border-2 border-dashed border-white/5 rounded-[2.5rem] p-10 mt-10">
            Nenhum match detectado... 🚑
          </div>
        )}
      </main>

      {/* 💉 MODAL DE PREVIEW (O seu diferencial gringo) */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          {/* Clicar no fundo fecha */}
          <div className="absolute inset-0" onClick={() => setSelectedMatch(null)} />
          
          <div className="relative w-full max-w-sm bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* Imagem de Fundo do Card */}
            <div className="relative aspect-[3/4] w-full">
              <img src={selectedMatch.foto_url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
              
              {/* Botão Fechar */}
              <button 
                onClick={() => setSelectedMatch(null)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Infos do Perfil */}
            <div className="p-8 pt-0 -mt-20 relative">
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">
                {selectedMatch.nome}, {selectedMatch.idade}
              </h2>
              
              <div className="flex flex-col gap-3 mt-4">
                {selectedMatch.mostrar_curso && (
                  <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-widest">
                    <GraduationCap size={16} />
                    {selectedMatch.curso} @ {selectedMatch.instituicao}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase text-white/70 border border-white/5">
                    {selectedMatch.genero}
                  </span>
                  {selectedMatch.mostrar_orientacao && (
                    <span className="px-3 py-1 bg-orange-500/20 rounded-full text-[9px] font-black uppercase text-orange-400 border border-orange-500/20">
                      {selectedMatch.orientacao}
                    </span>
                  )}
                </div>

                {selectedMatch.insta && (
                  <a 
                    href={`https://instagram.com/${selectedMatch.insta.replace('@', '')}`}
                    target="_blank"
                    className="w-full mt-4 h-14 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-lg"
                  >
                    <AtSign size={18} /> Chamar no Insta
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