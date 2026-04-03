'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, Loader2, AtSign } from 'lucide-react';

type FormData = {
  nome: string;
  idade: string;
  genero: string;
  orientacao: string;
  curso: string;
  instituicao: string;
  insta: string;
  foto_url: string;
  ver_homem: boolean;
  ver_mulher: boolean;
  ver_nb: boolean;
  mostrar_curso: boolean;
  mostrar_orientacao: boolean;
};

const calcCompletion = (f: FormData) => {
  const fields = [f.nome, f.idade, f.foto_url, f.insta];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

function CompletionRing({ pct }: { pct: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg
      viewBox="0 0 120 120"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="#f97316"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/10 transition-all shadow-inner mt-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-orange-400 transition-colors">
        {label}
      </span>
      <div className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-black/50 border border-white/20'}`}>
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
    </label>
  );
}

function LiveCard({ f, completion }: { f: FormData; completion: number }) {
  return (
    <div className="w-full flex flex-col items-center gap-5">
      {/* Photo + ring */}
      <div className="relative w-[150px] h-[150px] shrink-0">
        <CompletionRing pct={completion} />
        <div className="absolute inset-[10px] rounded-full overflow-hidden bg-zinc-800 border-2 border-white/10 shadow-2xl">
          {f.foto_url ? (
            <img src={f.foto_url} alt="foto" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <Camera size={32} />
            </div>
          )}
        </div>
        <div className="absolute bottom-1 right-2 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full leading-none shadow-lg border border-orange-400">
          {completion}%
        </div>
      </div>

      {/* Name & age */}
      <div className="text-center px-4">
        <h2 className="text-white font-black text-2xl italic leading-none tracking-tight truncate max-w-[250px]">
          {f.nome || <span className="text-white/20 not-italic font-normal text-lg">Seu nome</span>}
          {f.nome && f.idade && <span className="text-orange-400">, {f.idade}</span>}
        </h2>
        {f.mostrar_curso && (f.curso || f.instituicao) && (
          <p className="text-white/40 text-xs font-medium mt-1.5 uppercase tracking-widest">
            {[f.curso, f.instituicao].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 justify-center max-w-[250px]">
        {f.genero && (
          <span className="bg-purple-600/80 border border-purple-500/50 text-purple-50 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
            {f.genero}
          </span>
        )}
        {f.mostrar_orientacao && f.orientacao && (
          <span className="bg-orange-500/80 border border-orange-400/50 text-orange-50 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
            {f.orientacao}
          </span>
        )}
        {f.insta && (
          <span className="bg-white/10 border border-white/5 text-white/70 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
            @{f.insta}
          </span>
        )}
      </div>

      {/* Quem quer ver */}
      <div className="flex gap-2 mt-2">
        {[
          { key: 'ver_homem', label: '♂' },
          { key: 'ver_mulher', label: '♀' },
          { key: 'ver_nb', label: '⚧' },
        ].map(({ key, label }) =>
          f[key as keyof FormData] ? (
            <span
              key={key}
              className="w-8 h-8 rounded-full bg-white/10 border border-white/5 text-white/70 text-sm flex items-center justify-center shadow-inner"
            >
              {label}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}

type SectionProps = { title: string; children: React.ReactNode };
function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-10">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500 mb-4 ml-1">{title}</p>
      {children}
    </div>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};
function Field({ label, children }: FieldProps) {
  return (
    <div className="group">
      <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 group-focus-within:text-orange-400 transition-colors ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-400 focus:bg-white/10 outline-none text-white font-bold text-sm transition-all placeholder:text-white/20 shadow-inner';
const selectCls =
  'w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus:border-orange-400 focus:bg-white/10 outline-none text-white font-bold text-sm transition-all cursor-pointer appearance-none shadow-inner';

export default function EditarPerfil() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState<FormData>({
    nome: '',
    idade: '',
    genero: 'Homem',
    orientacao: 'Hétero',
    curso: '',
    instituicao: '',
    insta: '',
    foto_url: '',
    ver_homem: false,
    ver_mulher: true,
    ver_nb: false,
    mostrar_curso: true,
    mostrar_orientacao: true,
  });

  const set = (key: keyof FormData, val: string | boolean) =>
    setF((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && isMounted) {
          setF({
            nome: profile.nome || '',
            idade: profile.idade?.toString() || '',
            genero: profile.genero || 'Homem',
            orientacao: profile.orientacao || 'Hétero',
            curso: profile.curso || '',
            instituicao: profile.instituicao || '',
            insta: profile.insta || '',
            foto_url: profile.foto_url || '',
            ver_homem: profile.ver_homem ?? false,
            ver_mulher: profile.ver_mulher ?? true,
            ver_nb: profile.ver_nb ?? false,
            mostrar_curso: profile.mostrar_curso ?? true,
            mostrar_orientacao: profile.mostrar_orientacao ?? true,
          });
        }
      } catch (err: any) {
        if (err.message && err.message.includes('stole it')) {
          return;
        }
        console.error("Erro ao carregar perfil:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ext = file.name.split('.').pop();
      const path = `public/${user.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('fotos').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(path);
      set('foto_url', publicUrl);
    } catch (err: any) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const salvar = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nome: f.nome,
        idade: parseInt(f.idade) || 0,
        genero: f.genero,
        orientacao: f.orientacao,
        curso: f.curso,
        instituicao: f.instituicao,
        insta: f.insta,
        foto_url: f.foto_url,
        ver_homem: f.ver_homem,
        ver_mulher: f.ver_mulher,
        ver_nb: f.ver_nb,
        mostrar_curso: f.mostrar_curso,
        mostrar_orientacao: f.mostrar_orientacao,
      });
      if (!error) {
        setSaved(true);
        setTimeout(() => router.push('/perfil'), 800);
      } else {
        alert('Erro ao salvar: ' + error.message);
      }
    }
    setLoading(false);
  };

  const completion = calcCompletion(f);

  return (
    <>
      {/* 💉 FUNDOS LÁ ATRÁS */}
      <div className="fixed inset-0 bg-[#1a1410] -z-20 pointer-events-none" />
      {/* 💉 CIRURGIA 1: Opacidade reduzida para 3% (opacity-[0.03]) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      {/* 💉 CONTAINER PRINCIPAL SCROLLÁVEL */}
      <div className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden relative scroll-smooth">
        
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/5 shadow-sm"
          style={{ background: 'rgba(26,20,16,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push('/perfil')}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-black uppercase tracking-widest hidden md:inline">Voltar ao Perfil</span>
            </button>
            
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-500 italic">
              Editar Perfil
            </span>
            
            <button
              onClick={salvar}
              disabled={loading || saved}
              className={`text-[10px] md:text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all shadow-lg ${
                saved
                  ? 'bg-green-500 text-white shadow-green-500/20'
                  : 'bg-orange-500 text-white hover:bg-orange-400 hover:shadow-orange-500/20 active:scale-95'
              } disabled:opacity-60`}
            >
              {saved ? '✓ Salvo' : loading ? 'Sincronizando...' : 'Salvar Dados'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-65px)]">

          {/* ───── LEFT: Live preview ───── */}
          <div
            className="md:sticky md:top-[65px] md:h-[calc(100vh-65px)] w-full md:w-[380px] lg:w-[420px] md:shrink-0 flex flex-col items-center justify-center py-12 px-6 border-b border-white/5 md:border-b-0 md:border-r bg-white/[0.01] overflow-y-auto hide-scrollbar"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <LiveCard f={f} completion={completion} />
          </div>

          {/* ───── RIGHT: Scrollable form ───── */}
          <div className="flex-1 w-full px-6 md:px-12 lg:px-16 py-10 max-w-3xl mx-auto">

            {/* IDENTIDADE */}
            <Section title="Dados Pessoais">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <Field label="Nome">
                    <input
                      className={inputCls}
                      value={f.nome}
                      onChange={(e) => set('nome', e.target.value)}
                      placeholder="Como te chamam no plantão"
                    />
                  </Field>
                </div>
                <div>
                  <Field label="Idade">
                    <input
                      type="number"
                      className={inputCls}
                      value={f.idade}
                      onChange={(e) => set('idade', e.target.value)}
                      placeholder="22"
                    />
                  </Field>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Field label="Gênero">
                  <select
                    className={selectCls}
                    value={f.genero}
                    onChange={(e) => set('genero', e.target.value)}
                  >
                    <option value="Homem">Homem</option>
                    <option value="Mulher">Mulher</option>
                    <option value="Não Binário">Não Binário</option>
                  </select>
                </Field>
                <div className="flex flex-col">
                  <Field label="Orientação">
                    <select
                      className={selectCls}
                      value={f.orientacao}
                      onChange={(e) => set('orientacao', e.target.value)}
                    >
                      <option value="Hétero">Hétero</option>
                      <option value="Bi">Bi</option>
                      <option value="Gay">Gay</option>
                      <option value="Pan">Pan</option>
                    </select>
                  </Field>
                  <Toggle 
                    label="Exibir no perfil" 
                    checked={f.mostrar_orientacao} 
                    onChange={(val) => set('mostrar_orientacao', val)} 
                  />
                </div>
              </div>
            </Section>

            <div className="border-t border-white/5 mb-10" />

            {/* FORMAÇÃO */}
            <Section title="Vida Acadêmica">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <Field label="Curso">
                  <input
                    className={inputCls}
                    value={f.curso}
                    onChange={(e) => set('curso', e.target.value)}
                    placeholder="Ex: Medicina"
                  />
                </Field>
                <Field label="Instituição">
                  <input
                    className={inputCls}
                    value={f.instituicao}
                    onChange={(e) => set('instituicao', e.target.value)}
                    placeholder="Ex: UFC Sobral"
                  />
                </Field>
              </div>
              <Toggle 
                label="Exibir curso e faculdade no perfil" 
                checked={f.mostrar_curso} 
                onChange={(val) => set('mostrar_curso', val)} 
              />
            </Section>

            <div className="border-t border-white/5 mb-10" />

            {/* FOTO */}
            <Section title="Sua Imagem">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-white/10 hover:border-orange-500/50 hover:bg-white/5 transition-all p-8 flex flex-col items-center gap-4 shadow-sm"
              >
                {f.foto_url ? (
                  <>
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/10 group-hover:ring-orange-500/50 transition-all">
                      <img src={f.foto_url} className="w-full h-full object-cover" alt="foto" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-orange-400 transition-colors bg-black/40 px-3 py-1.5 rounded-full">
                      Alterar fotografia
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {uploading ? (
                        <Loader2 size={24} className="text-orange-500 animate-spin" />
                      ) : (
                        <Camera size={24} className="text-white/30 group-hover:text-orange-400 transition-colors" />
                      )}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white/30 group-hover:text-orange-400 transition-colors">
                      {uploading ? 'Enviando ao servidor...' : 'Selecionar da galeria'}
                    </span>
                  </>
                )}
              </button>
            </Section>

            <div className="border-t border-white/5 mb-10" />

            {/* DESCOBERTA */}
            <Section title="Triagem de Plantão">
              <div className="flex flex-col md:flex-row gap-3">
                {[
                  { key: 'ver_homem', label: 'Homens', sym: '♂' },
                  { key: 'ver_mulher', label: 'Mulheres', sym: '♀' },
                  { key: 'ver_nb', label: 'Não-Binários', sym: '⚧' },
                ].map(({ key, label, sym }) => {
                  const active = f[key as keyof FormData] as boolean;
                  return (
                    <button
                      key={key}
                      onClick={() => set(key as keyof FormData, !active)}
                      className={`flex-1 py-4 px-2 rounded-xl border-2 text-xs font-black uppercase tracking-wide transition-all ${
                        active
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                          : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1.5">{sym}</div>
                      <div className="text-[10px]">{label}</div>
                    </button>
                  );
                })}
              </div>
            </Section>

            <div className="border-t border-white/5 mb-10" />

            {/* CONTATO */}
            <Section title="Contato">
              <Field label="Instagram (Sem o @)">
                <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:bg-white/10 transition-all shadow-inner">
                  <AtSign size={16} className="text-white/30 shrink-0" />
                  <input
                    className="bg-transparent flex-1 outline-none text-white font-bold text-sm placeholder:text-white/20"
                    value={f.insta}
                    onChange={(e) => set('insta', e.target.value.replace('@', ''))}
                    placeholder="seuarroba"
                  />
                </div>
              </Field>
            </Section>

            {/* 💉 CIRURGIA 2: Espaçamento gigante no final (h-32) para a rolagem passar direto pelo botão flutuante e pela navbar */}
            <div className="h-32 md:h-20" />

            {/* 💉 CIRURGIA 3: Botão subiu um pouquinho (bottom-8) pra ficar longe da navbar nativa de iOS/Android */}
            <div className="md:hidden fixed bottom-8 left-6 right-6 z-40">
              <button
                onClick={salvar}
                disabled={loading || saved}
                className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-2xl ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white hover:bg-orange-400'
                } disabled:opacity-60`}
              >
                {saved ? '✓ Salvo!' : loading ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}