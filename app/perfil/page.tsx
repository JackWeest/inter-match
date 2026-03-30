'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Perfil() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState('');
  const [sexualidade, setSexualidade] = useState('');
  const [mostrarSexualidade, setMostrarSexualidade] = useState(true);
  const [curso, setCurso] = useState('');
  const [instagram, setInstagram] = useState('');

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não está logado!');

      let foto_url = '';

      if (foto) {
        // 1. Gera um nome de arquivo limpo e único
        const fileExt = foto.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        // 2. Upload para o bucket
        const { error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(fileName, foto);

        if (uploadError) throw uploadError;

        // 3. CONSTRUÇÃO DIRETA DO LINK (Troque SEU_ID_DO_SUPABASE pelo seu ID real)
        // Exemplo: https://abcde12345.supabase.co
        const SUPABASE_PROJECT_ID = 'pelofnnecqpuxjwxbxhm'; 
        foto_url = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/fotos/${fileName}`;

      } else {
        throw new Error('A foto de perfil é obrigatória para a festa!');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nome,
          idade: parseInt(idade),
          genero,
          sexualidade,
          mostrar_sexualidade: mostrarSexualidade,
          faculdade_curso: curso,
          instagram,
          foto_url,
        });

      if (profileError) throw profileError;

      router.push('/matches?success=true');

    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-10 bg-orange-50 px-4 text-black">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border-t-4 border-purple-600">
        <h1 className="text-3xl font-bold text-orange-600 mb-2 text-center italic uppercase">Match Med 🏥</h1>
        <p className="text-center text-gray-500 mb-6 font-medium text-sm">Monte seu perfil para a festa</p>

        <form onSubmit={handleSalvarPerfil} className="flex flex-col gap-5">
          
          <div>
            <label className="block text-sm font-bold text-purple-700 mb-1">Sua melhor foto (Obrigatória) 📸</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-purple-700 mb-1">Nome</label>
              <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: Janiel Jr" />
            </div>
            <div className="w-24">
              <label className="block text-sm font-bold text-purple-700 mb-1">Idade</label>
              <input type="number" required value={idade} onChange={(e) => setIdade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="22" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-purple-700 mb-1">Gênero</label>
              <select required value={genero} onChange={(e) => setGenero(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                <option value="">Selecione...</option>
                <option value="Homem">Homem</option>
                <option value="Mulher">Mulher</option>
                <option value="Não-binário">Não-binário</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-purple-700 mb-1">Sexualidade</label>
              <select required value={sexualidade} onChange={(e) => setSexualidade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                <option value="">Selecione...</option>
                <option value="Hétero">Hétero</option>
                <option value="Bissexual">Bissexual</option>
                <option value="Homossexual">Homossexual</option>
                <option value="Pansexual">Pansexual</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg border border-purple-100">
            <input type="checkbox" id="mostrarSex" checked={mostrarSexualidade} onChange={(e) => setMostrarSexualidade(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
            <label htmlFor="mostrarSex" className="text-sm text-purple-800 font-medium">Exibir minha sexualidade no perfil</label>
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-700 mb-1">Faculdade / Curso / Atlética</label>
            <input type="text" required value={curso} onChange={(e) => setCurso(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: Medicina UFC Sobral" />
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-700 mb-1">Instagram (@)</label>
            <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: @janieljr" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 text-white font-black py-4 rounded-xl hover:bg-purple-700 transition-all mt-4 shadow-lg active:scale-95 uppercase">
            {loading ? 'Salvando...' : 'Salvar Perfil e Começar 🔥'}
          </button>
        </form>
      </div>
    </main>
  );
}