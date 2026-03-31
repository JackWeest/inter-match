'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
// 💉 TROCA CIRÚRGICA: Instagram -> AtSign
import { AtSign, Lock, ChevronRight, Heart } from 'lucide-react';

export default function MeusMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const matchesLiberados = true; 

  useEffect(() => {
    if (matchesLiberados) {
      buscarMatchesMutuos();
    }
  }, []);

  const buscarMatchesMutuos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: meusLikes } = await supabase
        .from('likes')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .eq('liked', true);

      const { data: likesRecebidos } = await supabase
        .from('likes')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .eq('liked', true);

      if (meusLikes && likesRecebidos) {
        const idsMeusLikes = meusLikes.map(l => l.receiver_id);
        const idsLikesRecebidos = likesRecebidos.map(l => l.sender_id);
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!matchesLiberados) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-orange-50 p-6 text-center">
        <div className="bg-white p-8 rounded-full mb-6 shadow-xl text-purple-600">
            <Lock size={64} />
        </div>
        <h2 className="text-2xl font-bold text-purple-700">Matches Bloqueados</h2>
        <p className="text-gray-600 mt-2 max-w-xs italic">Aguarde a liberação dos resultados!</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-orange-50 pb-24 flex flex-col items-center px-4">
      <div className="w-full max-w-md pt-10 pb-6">
        <h1 className="text-3xl font-bold text-orange-600 flex items-center gap-2">
          Seus Matches <Heart size={28} className="text-orange-500" fill="currentColor"/>
        </h1>
        <p className="text-purple-700 text-sm font-medium italic mt-1">Conexões confirmadas no plantão</p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-orange-600 font-bold text-xs uppercase">Sincronizando...</p>
        </div>
      ) : matches.length > 0 ? (
        <div className="w-full max-w-md flex flex-col gap-4">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg border-l-4 border-purple-500 active:scale-95 transition-transform">
              <img 
                src={match.foto_url || 'https://via.placeholder.com/150'} 
                alt={match.nome} 
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-200 shadow-sm" 
              />
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{match.nome}, {match.idade}</h3>
                <p className="text-purple-600 text-xs font-semibold">{match.curso} | {match.instituicao}</p>
                
                {match.insta && (
                  <a 
                    href={`https://instagram.com/${match.insta.replace('@', '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-orange-500 text-xs font-bold mt-2 hover:underline"
                  >
                    {/* 💉 AQUI: AtSign no lugar do Instagram */}
                    <AtSign size={14} /> @{match.insta.replace('@', '')}
                  </a>
                )}
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
          <p className="text-gray-500 italic">Nada por aqui ainda...</p>
        </div>
      )}
    </main>
  );
}