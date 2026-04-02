'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

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
          
          // Lógica de compatibilidade aprimorada
          if (eu.sexualidade === 'Hétero') {
            return eu.genero === 'Homem' ? outro.genero === 'Mulher' : outro.genero === 'Homem';
          }
          if (eu.sexualidade === 'Gay' || eu.sexualidade === 'Lésbica' || eu.sexualidade === 'Homossexual') {
            return outro.genero === eu.genero;
          }
          // Bi, Pan ou outros retornam todos (ajuste conforme os dados da sua base)
          return true; 
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

    // Cleanup function para evitar memory leak do timer
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchParams, carregarPerfis]);

  const votar = async (liked: boolean) => {
    const perfilAtual = perfis[indiceAtual];
    if (!perfilAtual) return;

    // UI Otimista: avança o card na hora pra não causar lag visual pro usuário
    setIndiceAtual(prev => prev + 1);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('likes').insert({
        sender_id: user.id,
        receiver_id: perfilAtual.id,
        liked: liked
      });
    } catch (error) {
      console.error('Erro ao registrar voto no Supabase:', error);
    }
  };

  // 💉 AJUSTE 1: Loading transparente
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-transparent font-bold italic text-orange-600">
      Buscando a galera da Med... 🏥
    </div>
  );

  const perfilExibido = perfis[indiceAtual];

  return (
    // 💉 AJUSTE 2: Main transparente para mostrar o SVG do Layout
    <main className="flex min-h-screen flex-col items-center py-10 bg-transparent px-4">
      
      {showToast && (
        <div className="fixed top-5 z-50 animate-bounce bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl border-2 border-orange-400">
          <span className="font-bold">🔥 Perfil criado com sucesso!</span>
        </div>
      )}

      <h1 className="text-3xl font-black text-orange-600 mb-8 italic uppercase tracking-tighter drop-shadow-sm">Match Med 🏥</h1>

      {perfilExibido ? (
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-b-8 border-purple-600 flex flex-col">
          
          <div className="w-full h-[400px] bg-gray-200 relative">
            {perfilExibido.foto_url ? (
              <img 
                src={perfilExibido.foto_url} 
                alt={perfilExibido.nome}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/400x400?text=Erro+na+Foto";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">👤</div>
            )}
          </div>

          <div className="p-6 text-black">
            <h2 className="text-3xl font-black text-gray-800">
              {perfilExibido.nome}, {perfilExibido.idade}
            </h2>
            <p className="text-purple-600 font-bold uppercase text-xs tracking-wider">
              {perfilExibido.faculdade_curso}
            </p>
            
            {perfilExibido.mostrar_sexualidade && (
              <span className="inline-block bg-orange-100 text-orange-800 text-[10px] px-3 py-1 rounded-full mt-3 font-black uppercase">
                {perfilExibido.sexualidade}
              </span>
            )}

            <div className="flex justify-around items-center mt-8">
              <button 
                onClick={() => votar(false)}
                className="w-16 h-16 bg-white border-4 border-red-500 rounded-full flex items-center justify-center text-red-500 text-3xl shadow-xl hover:bg-red-50 active:scale-90 transition-all"
              >
                ✕
              </button>
              
              <button 
                onClick={() => votar(true)}
                className="w-16 h-16 bg-white border-4 border-green-500 rounded-full flex items-center justify-center text-green-500 text-3xl shadow-xl hover:bg-green-50 active:scale-90 transition-all"
              >
                💚
              </button>
            </div>
          </div>
        </div>
      ) : (
        // 💉 AJUSTE 3: Card final levemente translúcido (backdrop-blur)
        <div className="text-center mt-20 p-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border-2 border-dashed border-orange-200">
          <div className="text-7xl mb-4">🏜️</div>
          <h2 className="text-2xl font-black text-gray-500 uppercase italic">Fim da Linha</h2>
          <p className="text-gray-500 font-medium">Não tem mais ninguém por enquanto!</p>
        </div>
      )}
    </main>
  );
}

export default function Matches() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-transparent text-black">Carregando...</div>}>
      <MatchesContent />
    </Suspense>
  );
}