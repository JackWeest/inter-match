'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, Loader2, AtSign, ChevronDown } from 'lucide-react';
// 💉 CIRURGIA: Removido o import do compressor de imagem

// ─── DADOS DAS ATLÉTICAS (igual ao onboarding) ────────────────────────────────
const ATLETICAS = {
  '1ª Divisão': [
    { nome: 'Alcateia',     curso: 'Medicina', instituicao: 'UFC Sobral' },
    { nome: 'Audácia',      curso: 'Medicina', instituicao: 'Unichristus' },
    { nome: 'Espartana',    curso: 'Medicina', instituicao: 'IDOMED Juazeiro' },
    { nome: 'Fulminante',   curso: 'Medicina', instituicao: 'UECE' },
    { nome: 'Ira',          curso: 'Medicina', instituicao: 'UNINTA Sobral' },
    { nome: 'Kariris',      curso: 'Medicina', instituicao: 'UFCA Barbalha' },
    { nome: 'Selvagem',     curso: 'Medicina', instituicao: 'UFC Fortaleza' },
    { nome: 'Tenebrosa',    curso: 'Medicina', instituicao: 'UNIFOR' },
  ],
  '2ª Divisão': [
    { nome: 'Invocada',     curso: 'Medicina', instituicao: 'IDOMED Quixadá' },
    { nome: 'Caçadora',     curso: 'Medicina', instituicao: 'UECE Crateús' },
    { nome: 'Perversa',     curso: 'Medicina', instituicao: 'UNINTA Itapipoca' },
    { nome: 'Aniquiladora', curso: 'Medicina', instituicao: 'IDOMED Iguatu' },
  ],
  'Convidadas': [
    { nome: 'Voraz',         curso: 'Medicina', instituicao: 'F5  Sobral' },
    { nome: 'Tirana',        curso: 'Medicina', instituicao: 'UECE Quixeramobim' },
    { nome: 'Exterminadora', curso: 'Medicina', instituicao: 'URCA Cariri' },
  ],
} as const;

const TODAS_ATLETICAS = Object.values(ATLETICAS).flat();

const CARGOS = [
  'Presidente',
  'Diretor',
  'Organizador',
  'Técnico',
  'Esportista / Jogador',
  'Egresso',
  'Acadêmico',
];

// ─── TIPOS ────────────────────────────────────────────────────────────────────
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
  // Novas colunas
  tipo_participante: 'atletica' | 'convidado' | string;
  atletica: string;
  cargo_atletica: string;
  tipo_participacao: 'festa' | 'completo' | string;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const calcCompletion = (f: FormData) => {
  const fields = [f.nome, f.idade, f.foto_url, f.insta];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────
function CompletionRing({ pct }: { pct: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group bg-white/[0.02] hover:bg-white/[0.05] px-4 py-3 rounded-xl border border-white/5 transition-all mt-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-orange-400 transition-colors">{label}</span>
      <div className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-black/50 border border-white/10'}`}>
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function LiveCard({ f, completion }: { f: FormData; completion: number }) {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="relative w-[160px] h-[160px] shrink-0">
        <CompletionRing pct={completion} />
        <div className="absolute inset-[12px] rounded-full overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
          {f.foto_url ? (
            <img src={f.foto_url} alt="foto" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/5"><Camera size={32} /></div>
          )}
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full leading-none shadow-lg border border-orange-400 uppercase tracking-tighter">
          {completion}% completo
        </div>
      </div>

      <div className="text-center px-4">
        <h2 className="text-white font-black text-2xl italic leading-none tracking-tight uppercase">
          {f.nome || <span className="text-white/10 not-italic font-normal">Seu Nome</span>}
          {f.nome && f.idade && <span className="text-orange-500">, {f.idade}</span>}
        </h2>
        {f.mostrar_curso && (f.curso || f.instituicao) && (
          <p className="text-white/30 text-[9px] font-black mt-2 uppercase tracking-[0.2em] leading-tight">
            {[f.curso, f.instituicao].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
        {f.genero && (
          <span className="bg-white/5 border border-white/10 text-white/50 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{f.genero}</span>
        )}
        {f.mostrar_orientacao && f.orientacao && (
          <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400/80 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{f.orientacao}</span>
        )}
        {f.atletica && (
          <span className="bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">⚔ {f.atletica}</span>
        )}
        {f.cargo_atletica && (
          <span className="bg-white/5 border border-white/10 text-white/40 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{f.cargo_atletica}</span>
        )}
        {f.insta && (
          <span className="bg-black/40 border border-white/5 text-white/40 text-[8px] font-bold px-3 py-1.5 rounded-full lowercase flex items-center gap-1">
            <AtSign size={10} /> {f.insta}
          </span>
        )}
        {f.tipo_participacao && (
          <span className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${f.tipo_participacao === 'completo' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
            {f.tipo_participacao === 'completo' ? '🎉 Evento Completo' : '🎊 Só a Festa'}
          </span>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6 ml-1">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group">
      <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 group-focus-within:text-orange-500 transition-colors ml-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-black/60 hover:bg-black/70 border border-white/10 rounded-xl px-4 py-4 focus:border-orange-500/50 focus:bg-black/70 outline-none text-white font-bold text-sm transition-all placeholder:text-white/25 shadow-inner backdrop-blur-md';
const selectCls = 'w-full bg-black/60 hover:bg-black/70 border border-white/10 rounded-xl px-4 py-4 focus:border-orange-500/50 outline-none text-white font-bold text-sm transition-all cursor-pointer appearance-none shadow-inner backdrop-blur-md';

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function EditarPerfil() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState<FormData>({
    nome: '', idade: '', genero: 'Homem', orientacao: 'Hétero',
    curso: '', instituicao: '', insta: '', foto_url: '',
    ver_homem: false, ver_mulher: true, ver_nb: false,
    mostrar_curso: true, mostrar_orientacao: true,
    tipo_participante: '', atletica: '', cargo_atletica: '', tipo_participacao: '',
  });

  const set = (key: keyof FormData, val: string | boolean) => setF(prev => ({ ...prev, [key]: val }));

  const isAtletica = f.tipo_participante === 'atletica';

  // Quando muda a atlética, preenche curso e instituição automaticamente
  const handleAtletica = (nome: string) => {
    const info = TODAS_ATLETICAS.find(a => a.nome === nome);
    set('atletica', nome);
    if (info) {
      set('curso', info.curso);
      set('instituicao', info.instituicao);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
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
            tipo_participante: profile.tipo_participante || '',
            atletica: profile.atletica || '',
            cargo_atletica: profile.cargo_atletica || '',
            tipo_participacao: profile.tipo_participacao || '',
          });
        }
      } catch (err) {}
    })();
    return () => { isMounted = false; };
  }, []);

  // 💉 CIRURGIA MESTRE: Nova função de Upload direto pro Cloudinary (sem compressão forçada)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      // O passe livre configurado no Cloudinary
      formData.append('upload_preset', 'intermatch_fotos'); 

      const cloudName = 'dcsiucytm'; 
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha de conexão com o servidor de imagens.');
      }

      const data = await response.json();
      
      // O Cloudinary nos devolve a URL segura (https) da foto já hospedada
      set('foto_url', data.secure_url);

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
        foto_url: f.foto_url, // Salva o link do Cloudinary puro no Supabase
        ver_homem: f.ver_homem,
        ver_mulher: f.ver_mulher,
        ver_nb: f.ver_nb,
        mostrar_curso: f.mostrar_curso,
        mostrar_orientacao: f.mostrar_orientacao,
        tipo_participante: f.tipo_participante || null,
        atletica: f.atletica || null,
        cargo_atletica: f.cargo_atletica || null,
        tipo_participacao: f.tipo_participacao || null,
      });
      if (!error) {
        setSaved(true);
        setTimeout(() => router.push('/perfil'), 800);
      }
    }
    setLoading(false);
  };

  const completion = calcCompletion(f);

  return (
    <>
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <div className="h-[100dvh] w-full overflow-y-auto relative scroll-smooth selection:bg-orange-500/30">

        {/* Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-5 border-b border-white/5"
          style={{ background: 'rgba(15, 5, 26, 0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
            <button onClick={() => router.push('/perfil')} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Voltar</span>
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Editar Perfil</span>
            <button onClick={salvar} disabled={loading || saved}
              className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-400'}`}>
              {saved ? '✓ Salvo' : loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row">

          {/* Live preview */}
          <aside className="md:sticky md:top-[73px] md:h-[calc(100vh-73px)] w-full md:w-[380px] flex flex-col items-center justify-center py-12 px-6 border-b border-white/5 md:border-b-0 md:border-r border-white/5 bg-white/[0.01]">
            <LiveCard f={f} completion={completion} />
          </aside>

          {/* Form */}
          <div className="flex-1 w-full px-6 md:px-16 py-12 max-w-2xl mx-auto">

            {/* ── Participação ── */}
            <Section title="Participação">
              <div className="flex flex-col gap-3">

                {/* Tipo de participante */}
                <Field label="Você é">
                  <div className="flex gap-2">
                    {[
                      { key: 'atletica', label: '⚔️ Atlética' },
                      { key: 'convidado', label: '🎟️ Convidado' },
                    ].map(({ key, label }) => {
                      const active = f.tipo_participante === key;
                      return (
                        <button key={key} onClick={() => set('tipo_participante', key)}
                          className={`flex-1 py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wide transition-all backdrop-blur-md ${active ? 'border-orange-500/60 bg-black/60 text-orange-400' : 'border-white/10 bg-black/60 text-white/40 hover:border-white/25 hover:text-white/70'}`}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Atlética + cargo (só se for membro) */}
                {isAtletica && (
                  <>
                    <Field label="Atlética">
                      <div className="relative">
                        <select className={selectCls} value={f.atletica} onChange={(e) => handleAtletica(e.target.value)}>
                          <option value="">Selecione sua atlética</option>
                          {Object.entries(ATLETICAS).map(([divisao, lista]) => (
                            <optgroup key={divisao} label={`── ${divisao} ──`}>
                              {lista.map(a => <option key={a.nome} value={a.nome}>{a.nome}</option>)}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                      </div>
                    </Field>

                    {f.atletica && (
                      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        <p className="text-white/50 text-xs font-bold">
                          <span className="text-orange-400 font-black">{f.atletica}</span> · {f.curso} · {f.instituicao}
                        </p>
                      </div>
                    )}

                    <Field label="Cargo na Atlética">
                      <div className="relative">
                        <select className={selectCls} value={f.cargo_atletica} onChange={(e) => set('cargo_atletica', e.target.value)}>
                          <option value="">Selecione seu cargo</option>
                          {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                      </div>
                    </Field>
                  </>
                )}

                {/* Tipo de participação (para todos) */}
                {f.tipo_participante && (
                  <Field label="Participação no Evento">
                    <div className="flex gap-2">
                      {[
                        { key: 'festa', label: '🎊 Só a Festa', color: 'yellow' },
                        { key: 'completo', label: '🎉 Evento Completo', color: 'green' },
                      ].map(({ key, label, color }) => {
                        const active = f.tipo_participacao === key;
                        const activeCls = color === 'yellow'
                          ? 'border-yellow-500/60 text-yellow-400'
                          : 'border-green-500/60 text-green-400';
                        return (
                          <button key={key} onClick={() => set('tipo_participacao', key)}
                            className={`flex-1 py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wide transition-all backdrop-blur-md bg-black/60 ${active ? activeCls : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'}`}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                )}
              </div>
            </Section>

            {/* ── Identidade ── */}
            <Section title="Identidade">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="md:col-span-2">
                  <Field label="Nome"><input className={inputCls} value={f.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Seu nome" /></Field>
                </div>
                <Field label="Idade"><input type="number" className={inputCls} value={f.idade} onChange={(e) => set('idade', e.target.value)} placeholder="22" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Gênero">
                  <div className="relative">
                    <select className={selectCls} value={f.genero} onChange={(e) => set('genero', e.target.value)}>
                      <option value="Homem">Homem</option>
                      <option value="Mulher">Mulher</option>
                      <option value="Não Binário">NB</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                  </div>
                </Field>
                <div>
                  <Field label="Orientação">
                    <div className="relative">
                      <select className={selectCls} value={f.orientacao} onChange={(e) => set('orientacao', e.target.value)}>
                        <option value="Hétero">Hétero</option>
                        <option value="Bi">Bi</option>
                        <option value="Gay">Gay</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                    </div>
                  </Field>
                  <Toggle label="Mostrar no perfil" checked={f.mostrar_orientacao} onChange={(val) => set('mostrar_orientacao', val)} />
                </div>
              </div>
            </Section>

            {/* ── Acadêmico ── só editável para convidados; atlética é preenchido auto ── */}
            <Section title="Acadêmico">
              {isAtletica ? (
                <>
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    <p className="text-white/40 text-xs font-bold leading-relaxed">
                      Preenchido automaticamente pela atlética{f.atletica ? <> — <span className="text-orange-400 font-black">{f.atletica}</span></> : ''}.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3 opacity-50 pointer-events-none">
                    <Field label="Curso"><input className={inputCls} value={f.curso} readOnly /></Field>
                    <Field label="Faculdade"><input className={inputCls} value={f.instituicao} readOnly /></Field>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <Field label="Curso"><input className={inputCls} value={f.curso} onChange={(e) => set('curso', e.target.value)} placeholder="Medicina" /></Field>
                  <Field label="Faculdade"><input className={inputCls} value={f.instituicao} onChange={(e) => set('instituicao', e.target.value)} placeholder="UFC" /></Field>
                </div>
              )}
              <Toggle label="Mostrar curso e facul" checked={f.mostrar_curso} onChange={(val) => set('mostrar_curso', val)} />
            </Section>

            {/* ── Fotografia ── */}
            <Section title="Fotografia">
              <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="w-full group rounded-2xl border border-dashed border-white/10 hover:border-orange-500/40 hover:bg-white/[0.02] transition-all p-10 flex flex-col items-center gap-4">
                {f.foto_url ? (
                  <>
                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-orange-500/50">
                      <img src={f.foto_url} className="w-full h-full object-cover" alt="foto" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-orange-500">Trocar Imagem</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all">
                      {uploading ? <Loader2 size={20} className="text-orange-500 animate-spin" /> : <Camera size={20} className="text-white/20" />}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Upload de Foto</span>
                  </>
                )}
              </button>
            </Section>

            {/* ── Radar de Plantão ── */}
            <Section title="Radar de Plantão">
              <div className="flex gap-2">
                {[
                  { key: 'ver_homem', label: 'Homens', sym: '♂' },
                  { key: 'ver_mulher', label: 'Mulheres', sym: '♀' },
                  { key: 'ver_nb', label: 'NB', sym: '⚧' },
                ].map(({ key, label, sym }) => {
                  const active = f[key as keyof FormData] as boolean;
                  return (
                    <button key={key} onClick={() => set(key as keyof FormData, !active)}
                      className={`flex-1 py-4 rounded-xl border transition-all ${active ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-white/5 bg-white/5 text-white/20'}`}>
                      <div className="text-xl mb-1">{sym}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest">{label}</div>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* ── Instagram ── */}
            <Section title="Instagram">
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-4 focus-within:border-orange-500/50 transition-all">
                <AtSign size={16} className="text-white/20" />
                <input className="bg-transparent flex-1 outline-none text-white font-bold text-sm placeholder:text-white/25"
                  value={f.insta} onChange={(e) => set('insta', e.target.value.replace('@', ''))} placeholder="seu.insta" />
              </div>
            </Section>

            <div className="h-32" />
          </div>
        </div>

        {/* Floating Save Button (Mobile) */}
        <div className="md:hidden fixed bottom-8 left-6 right-6 z-40">
          <button onClick={salvar} disabled={loading || saved}
            className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white shadow-orange-500/20'}`}>
            {saved ? '✓ Perfil Atualizado' : loading ? 'Sincronizando...' : 'Confirmar Mudanças'}
          </button>
        </div>
      </div>
    </>
  );
}