'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { AtSign, Lock, ChevronRight, Heart } from 'lucide-react';

export default function MeusMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // 💉 INFORME: Deixamos liberado para o teste
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
      // 💉 AJUSTE: getSession evita o erro de "Lock Stolen" com a Catraca
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) return;

      // 1. Quem eu dei like
      const { data: meusLikes } = await supabase
        .from('likes')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .eq('liked', true);

      // 2. Quem me deu like
      const { data: likesRecebidos } = await supabase
        .from('likes')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .eq('liked', true);

      if (meusLikes && likesRecebidos) {
        const idsMeusLikes = meusLikes.map(l => l.receiver_id);
        const idsLikesRecebidos = likesRecebidos.map(l => l.sender_id);
        
        // 3. Intersecção (Match Mútuo)
        const idsMatches = idsMeusLikes.filter(id => idsLikesRecebidos.includes(id));

        if (idsMatches.length > 0) {
          const { data: perfisMatches } = await supabase
            .from('profiles')
            .select('*')
            .in('id', idsMatches);
          
          setMatches(perfisMatches || []);
        }
      }
    } catch (error) {
      console.error("Erro na busca de matches:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!matchesLiberados) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-transparent p-6 text-center">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-full mb-6 shadow-xl text-purple-600">
            <Lock size={64} />
        </div>
        <h2 className="text-2xl font-bold text-purple-700">Matches Bloqueados</h2>
        <p className="text-gray-600 mt-2 max-w-xs italic">Aguarde a liberação dos resultados!</p>
      </main>
    );
  }

  return (
    // 💉 AJUSTE: bg-transparent para mostrar o seu pattern!
    <main className="min-h-screen bg-transparent pb-24 flex flex-col items-center px-4">
      <div className="w-full max-w-md pt-10 pb-6">
        <h1 className="text-3xl font-bold text-orange-600 flex items-center gap-2 drop-shadow-sm">
          Seus Matches <Heart size={28} className="text-orange-500" fill="currentColor"/>
        </h1>
        <p className="text-purple-700 text-sm font-black italic mt-1 uppercase tracking-tighter">
          Conexões confirmadas no plantão
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-orange-600 font-bold text-xs uppercase">Sincronizando...</p>
        </div>
      ) : matches.length > 0 ? (
        <div className="w-full max-w-md flex flex-col gap-4">
          {matches.map((match) => (
            <div 
              key={match.id} 
              className="flex items-center gap-4 bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-lg border-l-8 border-purple-500 active:scale-95 transition-all"
            >
              <img 
                src={match.foto_url || 'https://via.placeholder.com/150'} 
                alt={match.nome} 
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-200 shadow-sm" 
              />
              
              <div className="flex-1">
                <h3 className="font-black text-gray-800 text-lg leading-tight uppercase italic">{match.nome}, {match.idade}</h3>
                <p className="text-purple-600 text-[10px] font-black uppercase tracking-widest leading-none">
                  {match.faculdade_curso || match.curso}
                </p>
                
                {match.insta && (
                  <a 
                    href={`https://instagram.com/${match.insta.replace('@', '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-orange-600 text-xs font-black mt-2 hover:underline"
                  >
                    <AtSign size={14} /> @{match.insta.replace('@', '')}
                  </a>
                )}
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-white/50 backdrop-blur-sm p-10 rounded-3xl border-2 border-dashed border-orange-200">
            <p className="text-gray-500 italic font-bold">Nenhum match ainda... <br/>Continue na triagem! 🚑</p>
          </div>
        </div>
      )}
    </main>
  );
}