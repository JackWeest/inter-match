'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function MeusMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mude para 'false' se quiser esconder a lista até a hora da festa!
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

      // 1. Pega as pessoas que EU dei Like
      const { data: meusLikes } = await supabase
        .from('likes')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .eq('liked', true);

      // 2. Pega as pessoas que ME deram Like
      const { data: likesRecebidos } = await supabase
        .from('likes')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .eq('liked', true);

      if (meusLikes && likesRecebidos) {
        const idsMeusLikes = meusLikes.map(l => l.receiver_id);
        const idsLikesRecebidos = likesRecebidos.map(l => l.sender_id);

        // 3. A mágica: quem está nas duas listas? (Match mútuo)
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
        <h1 className="text-4xl mb-4">🔒</h1>
        <h2 className="text-2xl font-bold text-purple-700">Matches Bloqueados</h2>
        <p className="text-gray-600 mt-2">Aguarde! Os matches serão liberados às 18h do dia da festa.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-10 bg-orange-50 px-4">
      <h1 className="text-3xl font-bold text-orange-600 mb-8">Seus Matches 🔥</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : matches.length > 0 ? (
        <div className="w-full max-w-md flex flex-col gap-4">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-md border-l-4 border-purple-500">
              <img src={match.foto_url} alt={match.nome} className="w-16 h-16 rounded-full object-cover border-2 border-orange-200" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{match.nome}, {match.id}</h3>
                <p className="text-purple-600 text-sm">{match.faculdade_curso}</p>
                {match.instagram && (
                  <a 
                    href={`https://instagram.com/${match.instagram.replace('@', '')}`} 
                    target="_blank" 
                    className="text-orange-500 text-sm font-bold hover:underline"
                  >
                    Ver Instagram 📸
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-10">
          <p className="text-gray-500 italic">Ainda nenhum match... Continue tentando!</p>
        </div>
      )}
    </main>
  );
}