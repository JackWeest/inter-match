'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

// Criamos uma função interna para o conteúdo da página
function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se vier do perfil com sucesso, mostra o alerta
    if (searchParams.get('success') === 'true') {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
    carregarPerfis();
  }, [searchParams]);

  const carregarPerfis = async () => {
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

        // Lógica de Match (simplificada para o código não ficar gigante)
        perfisFiltrados = perfisFiltrados.filter(p => {
          const eu = meuPerfil;
          const outro = p;
          if (eu.genero === 'Homem' && eu.sexualidade === 'Hétero') return outro.genero === 'Mulher';
          if (eu.genero === 'Mulher' && eu.sexualidade === 'Hétero') return outro.genero === 'Homem';
          // ... outras lógicas podem seguir aqui
          return true; 
        });

        setPerfis(perfisFiltrados);
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    } finally {
      setLoading(false);
    }
  };

  const votar = async (liked: boolean) => {
    const perfilAtual = perfis[indiceAtual];
    if (!perfilAtual) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('likes').insert({
      sender_id: user.id,
      receiver_id: perfilAtual.id,
      liked: liked
    });

    setIndiceAtual(indiceAtual + 1);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50 text-orange-600 font-bold italic">
      Buscando a galera da Med... 🏥
    </div>
  );

  const perfilExibido = perfis[indiceAtual];

  return (
    <main className="flex min-h-screen flex-col items-center py-10 bg-orange-50 px-4">
      
      {showToast && (
        <div className="fixed top-5 z-50 animate-bounce bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl border-2 border-orange-400">
          <span className="font-bold">🔥 Perfil criado com sucesso!</span>
        </div>
      )}

      <h1 className="text-3xl font-black text-orange-600 mb-8 italic uppercase tracking-tighter">Match Med 🏥</h1>

      {perfilExibido ? (
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-b-8 border-purple-600 flex flex-col">
          
          {/* FOTO - Usando tag IMG que é mais segura que BackgroundImage */}
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
        <div className="text-center mt-20 p-10 bg-white rounded-3xl shadow-inner border-2 border-dashed border-orange-200">
          <div className="text-7xl mb-4">🏜️</div>
          <h2 className="text-2xl font-black text-gray-400 uppercase italic">Fim da Linha</h2>
          <p className="text-gray-400">Não tem mais ninguém por enquanto!</p>
        </div>
      )}
    </main>
  );
}

// O Next.js exige que componentes que usam useSearchParams fiquem dentro de um Suspense
export default function Matches() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-black">Carregando...</div>}>
      <MatchesContent />
    </Suspense>
  );
}