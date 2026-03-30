'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Matches() {
  const router = useRouter();
  const [perfis, setPerfis] = useState<any[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPerfis();
  }, []);

  const carregarPerfis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Pega o seu perfil para saber seu gênero e sexualidade
      const { data: meuPerfil } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!meuPerfil) {
        router.push('/perfil');
        return;
      }

      // 2. Descobre em quem você já votou para não mostrar de novo
      const { data: meusVotos } = await supabase
        .from('likes')
        .select('receiver_id')
        .eq('sender_id', user.id);
      
      const idsVotados = meusVotos?.map(v => v.receiver_id) || [];

      // 3. Pega todos os outros perfis
      const { data: outrosPerfis } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      if (outrosPerfis) {
        // 4. Filtra quem você já votou
        let perfisFiltrados = outrosPerfis.filter(p => !idsVotados.includes(p.id));

        // 5. A LÓGICA DE MATCH (Gênero e Sexualidade)
        perfisFiltrados = perfisFiltrados.filter(p => {
          const eu = meuPerfil;
          const outro = p;

          if (eu.genero === 'Homem' && eu.sexualidade === 'Hétero') {
            return outro.genero === 'Mulher' && (outro.sexualidade === 'Hétero' || outro.sexualidade === 'Bissexual');
          }
          if (eu.genero === 'Mulher' && eu.sexualidade === 'Hétero') {
            return outro.genero === 'Homem' && (outro.sexualidade === 'Hétero' || outro.sexualidade === 'Bissexual');
          }
          if (eu.genero === 'Homem' && eu.sexualidade === 'Homossexual') {
            return outro.genero === 'Homem' && (outro.sexualidade === 'Homossexual' || outro.sexualidade === 'Bissexual');
          }
          if (eu.genero === 'Mulher' && eu.sexualidade === 'Homossexual') {
            return outro.genero === 'Mulher' && (outro.sexualidade === 'Homossexual' || outro.sexualidade === 'Bissexual');
          }
          if (eu.genero === 'Homem' && eu.sexualidade === 'Bissexual') {
            return (outro.genero === 'Homem' && (outro.sexualidade === 'Homossexual' || outro.sexualidade === 'Bissexual')) ||
                   (outro.genero === 'Mulher' && (outro.sexualidade === 'Hétero' || outro.sexualidade === 'Bissexual'));
          }
          if (eu.genero === 'Mulher' && eu.sexualidade === 'Bissexual') {
            return (outro.genero === 'Mulher' && (outro.sexualidade === 'Homossexual' || outro.sexualidade === 'Bissexual')) ||
                   (outro.genero === 'Homem' && (outro.sexualidade === 'Hétero' || outro.sexualidade === 'Bissexual'));
          }
          
          return true; // Pessoas Não-binárias ou Pansexuais vêm para cá (podemos refinar depois se quiser)
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

    // Salva o voto no banco de dados
    await supabase.from('likes').insert({
      sender_id: user.id,
      receiver_id: perfilAtual.id,
      liked: liked
    });

    // Passa para a próxima pessoa
    setIndiceAtual(indiceAtual + 1);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-orange-50 text-orange-600 font-bold">Carregando a galera...</div>;

  const perfilExibido = perfis[indiceAtual];

  return (
    <main className="flex min-h-screen flex-col items-center py-10 bg-orange-50 px-4">
      <h1 className="text-2xl font-bold text-orange-600 mb-6">Descubra 🕵️‍♂️</h1>

      {perfilExibido ? (
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-purple-100">
          {/* FOTO */}
          <div 
            className="w-full h-96 bg-cover bg-center"
            style={{ backgroundImage: `url(${perfilExibido.foto_url})` }}
          />
          
          {/* INFO DO PERFIL */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {perfilExibido.nome}, {perfilExibido.idade}
            </h2>
            <p className="text-purple-600 font-medium mt-1">{perfilExibido.faculdade_curso}</p>
            
            {perfilExibido.mostrar_sexualidade && (
              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-2 font-semibold">
                {perfilExibido.sexualidade}
              </span>
            )}

            {/* BOTÕES */}
            <div className="flex justify-around items-center mt-8 mb-2">
              <button 
                onClick={() => votar(false)}
                className="w-16 h-16 bg-white border-2 border-red-500 rounded-full flex items-center justify-center text-red-500 text-3xl shadow-lg hover:bg-red-50 transition-colors transform hover:scale-105"
              >
                ❌
              </button>
              
              <button 
                onClick={() => votar(true)}
                className="w-16 h-16 bg-white border-2 border-green-500 rounded-full flex items-center justify-center text-green-500 text-3xl shadow-lg hover:bg-green-50 transition-colors transform hover:scale-105"
              >
                💚
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center mt-20">
          <div className="text-6xl mb-4">🏜️</div>
          <h2 className="text-xl font-bold text-gray-700">Acabou a fila!</h2>
          <p className="text-gray-500">Você já viu todo mundo da festa.</p>
        </div>
      )}
    </main>
  );
}