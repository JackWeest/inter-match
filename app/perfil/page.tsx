'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Edit3, Trash2, AtSign, ExternalLink } from 'lucide-react';

export default function PreviewPerfil() {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    getProfile();
  }, []);

  const handleSair = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    router.push('/');
  };

  if (!profile) return <div className="min-h-screen bg-red-950 flex items-center justify-center text-red-500 font-bold">Carregando perfil...</div>;

  return (
    <main className="min-h-screen bg-[#8b0000] p-6 flex flex-col items-center justify-center">
      {/* CARD DE PREVIEW (Igual sua 5ª imagem) */}
      <div className="relative w-full max-w-sm">
        <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-black/40 shadow-2xl">
          <img src={profile.foto_url} className="w-full h-full object-cover" alt="Sua foto" />
          
          {/* Moldura de Sangue/Estilo (Você pode usar um SVG ou Overlay) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Info Box */}
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
             <h2 className="text-2xl font-black italic text-white leading-none mb-1">
               {profile.nome}, {profile.idade}
             </h2>
             <div className="flex gap-2 mb-2">
                <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase">{profile.genero}</span>
                <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase">{profile.orientacao}</span>
             </div>
             <div className="flex items-center gap-4 text-xs font-bold text-gray-300">
                <span>{profile.curso}</span>
                <span>{profile.instituicao}</span>
             </div>
             <div className="mt-3 flex items-center gap-2 text-white/80 text-xs italic">
                <div className="mt-3 flex items-center gap-2 text-white/80 text-xs italic">
                <AtSign size={14} /> <span>@{profile.insta}</span> <ExternalLink size={12}/>
                </div>
             </div>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex gap-2 mt-6">
          <button onClick={() => router.push('/perfil/editar')} 
            className="flex-1 bg-red-700 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Edit3 size={18}/> EDITAR
          </button>
          
          <button onClick={handleSair}
            className="bg-zinc-800 text-red-500 font-black px-6 py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
            <LogOut size={18}/> SAIR
          </button>

          <button className="bg-zinc-900/50 text-red-900 p-4 rounded-xl shadow-lg">
            <Trash2 size={20}/>
          </button>
        </div>
      </div>
    </main>
  );
}