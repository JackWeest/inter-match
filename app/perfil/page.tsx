'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Perfil() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  
  // Campos do formulário
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
      // 1. Pega o usuário logado atualmente
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não está logado!');

      let foto_url = '';

      // 2. Faz o upload da foto se ela existir
      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(fileName, foto);

        if (uploadError) throw uploadError;

        // Pega o link público da foto
        const { data: publicUrlData } = supabase.storage
          .from('fotos')
          .getPublicUrl(fileName);
          
        foto_url = publicUrlData.publicUrl;
      } else {
        throw new Error('A foto de perfil é obrigatória para a festa!');
      }

      // 3. Salva os dados no banco
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

      alert('Perfil criado com sucesso! Partiu matches 🔥');
      // Redireciona para a tela principal (que faremos depois)
      // router.push('/matches'); 

    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-10 bg-orange-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border-t-4 border-purple-600">
        <h1 className="text-3xl font-bold text-orange-600 mb-6 text-center">
          Monte seu Perfil
        </h1>

        <form onSubmit={handleSalvarPerfil} className="flex flex-col gap-5 text-black">
          
          {/* FOTO */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Foto de Perfil (Obrigatória) 📸</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
            />
          </div>

          {/* NOME E IDADE */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-purple-700 mb-1">Nome</label>
              <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Nome viu? (apelido também vale)" />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-purple-700 mb-1">Idade</label>
              <input type="number" required value={idade} onChange={(e) => setIdade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Ex: 22" />
            </div>
          </div>

          {/* GÊNERO E SEXUALIDADE */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-purple-700 mb-1">Gênero</label>
              <select required value={genero} onChange={(e) => setGenero(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                <option value="">Selecione...</option>
                <option value="Homem">Homem</option>
                <option value="Mulher">Mulher</option>
                <option value="Não-binário">Não-binário</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-purple-700 mb-1">Sexualidade</label>
              <select required value={sexualidade} onChange={(e) => setSexualidade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                <option value="">Selecione...</option>
                <option value="Hétero">Hétero</option>
                <option value="Bissexual">Bissexual</option>
                <option value="Homossexual">Homossexual</option>
                <option value="Pansexual">Pansexual</option>
              </select>
            </div>
          </div>

          {/* CHECKBOX SEXUALIDADE */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="mostrarSex" checked={mostrarSexualidade} onChange={(e) => setMostrarSexualidade(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
            <label htmlFor="mostrarSex" className="text-sm text-gray-600">Mostrar minha sexualidade no perfil</label>
          </div>

          {/* CURSO / INSTAGRAM */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Faculdade / Atlética / Curso</label>
            <input type="text" required value={curso} onChange={(e) => setCurso(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Ex: Medicina UFC Sobral" />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">Instagram (Opcional)</label>
            <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Coloque seu @" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors mt-4 shadow-md">
            {loading ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </form>
      </div>
    </main>
  );
}