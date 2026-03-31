'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Camera, AtSign, Check } from 'lucide-react';

export default function EditarPerfil() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estado do formulário limpo: apenas preferências de gênero
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    genero: 'Homem', 
    orientacao: 'Hétero',
    curso: 'Med',
    instituicao: 'UFC',
    frase: '',
    insta: '',
    foto_url: '',
    ver_homem: false,
    ver_mulher: true,
    ver_nb: false,
  });

  useEffect(() => {
    const carregarDados = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) setFormData({ ...profile, idade: profile.idade?.toString() || '' });
      }
    };
    carregarDados();
  }, []);

  const salvarPerfil = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 🏥 CIRURGIA: Removi a linha 'atualizado_em' para evitar o erro de coluna inexistente
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nome: formData.nome,
        idade: parseInt(formData.idade) || 0,
        genero: formData.genero,
        orientacao: formData.orientacao,
        curso: formData.curso,
        instituicao: formData.instituicao,
        frase: formData.frase,
        insta: formData.insta,
        foto_url: formData.foto_url,
        ver_homem: formData.ver_homem,
        ver_mulher: formData.ver_mulher,
        ver_nb: formData.ver_nb,
      });

      if (!error) {
        router.push('/perfil');
      } else {
        alert("Erro ao salvar: " + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#8b0000] p-6 pb-24 flex flex-col items-center text-white font-sans overflow-y-auto" 
          style={{ backgroundImage: 'url("/pattern-bg.png")', backgroundBlendMode: 'overlay', backgroundSize: 'cover' }}>
      
      <div className="w-full max-w-sm mt-8">
        <h1 className="text-2xl font-black text-red-600 mb-6 tracking-widest uppercase text-center">EDITAR PERFIL</h1>

        {/* INDICADOR DE ETAPAS */}
        <div className="flex items-center justify-between mb-10 text-[10px] font-bold uppercase tracking-tighter w-full px-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s ? 'bg-red-600 border-red-600' : 'border-gray-500 text-gray-500'}`}>
                {step > s ? <Check size={14} className="text-white"/> : <span className={step === s ? "text-white" : ""}>{s}</span>}
              </div>
              <span className={step === s ? 'text-red-500' : 'text-gray-400'}>
                {s === 1 ? 'Você' : s === 2 ? 'Imagem' : s === 3 ? 'Matches' : 'Revisão'}
              </span>
            </div>
          ))}
        </div>

        {/* PASSO 1: DADOS BÁSICOS */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                <label className="text-[10px] text-gray-400 uppercase font-bold">👤 Nome Completo</label>
                <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="bg-transparent w-full outline-none font-bold text-white placeholder:text-white/20" placeholder="Seu nome" />
             </div>

             <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">♂ Gênero</label>
                  <select value={formData.genero} onChange={e => setFormData({...formData, genero: e.target.value})} className="bg-transparent w-full outline-none font-bold text-white cursor-pointer">
                    <option className="bg-red-950" value="Homem">Homem</option>
                    <option className="bg-red-950" value="Mulher">Mulher</option>
                    <option className="bg-red-950" value="Não Binário">Não Binário</option>
                  </select>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">🧭 Orientação</label>
                  <select value={formData.orientacao} onChange={e => setFormData({...formData, orientacao: e.target.value})} className="bg-transparent w-full outline-none font-bold text-white cursor-pointer">
                    <option className="bg-red-950" value="Hétero">Hétero</option>
                    <option className="bg-red-950" value="Bi">Bi</option>
                    <option className="bg-red-950" value="Gay">Gay</option>
                    <option className="bg-red-950" value="Pan">Pan</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">🎓 Curso</label>
                  <input value={formData.curso} onChange={e => setFormData({...formData, curso: e.target.value})} className="bg-transparent w-full outline-none font-bold text-white" placeholder="Ex: Med" />
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">🏫 Instituição</label>
                  <input value={formData.instituicao} onChange={e => setFormData({...formData, instituicao: e.target.value})} className="bg-transparent w-full outline-none font-bold text-white" placeholder="Ex: UFC" />
                </div>
             </div>

             <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-3">
                <div className="flex flex-col flex-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">📸 Instagram</label>
                  <input value={formData.insta} onChange={e => setFormData({...formData, insta: e.target.value})} className="bg-transparent w-full outline-none font-bold text-white" placeholder="ex: janieljr" />
                </div>
                <AtSign size={18} className="text-red-500" />
             </div>

             <button onClick={() => setStep(2)} className="w-full bg-red-700 py-4 rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-6">PRÓXIMO</button>
          </div>
        )}

        {/* PASSO 2: IMAGEM */}
        {step === 2 && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="relative w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden border-4 border-red-600 shadow-2xl bg-black/60">
              {formData.foto_url ? (
                <img src={formData.foto_url} className="w-full h-full object-cover" alt="Perfil" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Camera size={48} className="text-white/20"/></div>
              )}
            </div>
            <div className="w-full space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Link da sua foto</label>
                <input type="text" placeholder="Cole o link da foto aqui" value={formData.foto_url} onChange={e => setFormData({...formData, foto_url: e.target.value})} className="w-full p-4 bg-black/40 border border-white/10 rounded-xl outline-none text-sm text-white" />
            </div>
            
            <div className="flex w-full gap-2 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-black/40 py-4 rounded-xl font-bold uppercase text-xs border border-white/10">VOLTAR</button>
              <button onClick={() => setStep(3)} className="flex-[2] bg-red-700 py-4 rounded-xl font-black uppercase shadow-lg text-xs">PRÓXIMO</button>
            </div>
          </div>
        )}

        {/* PASSO 3: QUEM VOCÊ QUER VER */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
            <h2 className="text-xl font-bold uppercase italic tracking-tight text-red-500">QUEM VOCÊ QUER VER?</h2>
            <p className="text-xs text-gray-400 mb-6">Selecione os gêneros que aparecerão na sua triagem.</p>
            
            <div className="grid grid-cols-3 gap-3">
                <button 
                    onClick={() => setFormData({...formData, ver_homem: !formData.ver_homem})} 
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                        formData.ver_homem 
                        ? 'border-red-500 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] text-white scale-105' 
                        : 'border-white/10 bg-black/40 text-gray-500'
                    }`}
                >
                    <span className="text-3xl font-black">♂</span>
                    <span className="text-[10px] font-black uppercase">Homem</span>
                </button>

                <button 
                    onClick={() => setFormData({...formData, ver_mulher: !formData.ver_mulher})} 
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                        formData.ver_mulher 
                        ? 'border-red-500 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] text-white scale-105' 
                        : 'border-white/10 bg-black/40 text-gray-500'
                    }`}
                >
                    <span className="text-3xl font-black">♀</span>
                    <span className="text-[10px] font-black uppercase">Mulher</span>
                </button>

                <button 
                    onClick={() => setFormData({...formData, ver_nb: !formData.ver_nb})} 
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                        formData.ver_nb 
                        ? 'border-red-500 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] text-white scale-105' 
                        : 'border-white/10 bg-black/40 text-gray-500'
                    }`}
                >
                    <span className="text-3xl font-black">⚧</span>
                    <span className="text-[10px] font-black uppercase">NB</span>
                </button>
            </div>

            <div className="flex w-full gap-2 mt-12">
              <button onClick={() => setStep(2)} className="flex-1 bg-black/40 py-4 rounded-xl font-bold uppercase text-xs border border-white/10">VOLTAR</button>
              <button onClick={() => setStep(4)} className="flex-[2] bg-red-700 py-4 rounded-xl font-black uppercase text-xs shadow-lg">PRÓXIMO</button>
            </div>
          </div>
        )}

        {/* PASSO 4: REVISÃO */}
        {step === 4 && (
          <div className="space-y-6 animate-in zoom-in duration-500 text-center flex flex-col items-center">
            <div className="relative w-40 h-40 rounded-full border-4 border-red-600 overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.5)] bg-black">
              {formData.foto_url && <img src={formData.foto_url} className="w-full h-full object-cover" alt="Review" />}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase">{formData.nome || 'Seu Nome'}</h3>
              <p className="text-red-500 font-bold uppercase tracking-widest text-sm">{formData.curso} | {formData.instituicao}</p>
            </div>
            
            <div className="flex w-full gap-2 mt-8">
              <button onClick={() => setStep(3)} className="flex-1 bg-black/40 py-4 rounded-xl font-bold uppercase text-xs border border-white/10">VOLTAR</button>
              <button 
                onClick={salvarPerfil} 
                disabled={loading} 
                className="flex-[2] bg-red-600 py-4 rounded-xl font-black uppercase text-xs shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 transition-all"
              >
                {loading ? 'SALVANDO...' : 'ATUALIZAR PERFIL'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}