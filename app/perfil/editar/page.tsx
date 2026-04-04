'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, Loader2, AtSign } from 'lucide-react';
import imageCompression from 'browser-image-compression';

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
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="#f97316"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group bg-white/[0.02] hover:bg-white/[0.05] px-4 py-3 rounded-xl border border-white/5 transition-all mt-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-orange-400 transition-colors">
        {label}
      </span>
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
      {/* Photo + ring */}
      <div className="relative w-[160px] h-[160px] shrink-0">
        <CompletionRing pct={completion} />
        <div className="absolute inset-[12px] rounded-full overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
          {f.foto_url ? (
            <img src={f.foto_url} alt="foto" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/5">
              <Camera size={32} />
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full leading-none shadow-lg border border-orange-400 uppercase tracking-tighter">
          {completion}% completo
        </div>
      </div>

      {/* Name & age */}
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

      {/* Tags Estilo Obsidian */}
      <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
        {f.genero && (
          <span className="bg-white/5 border border-white/10 text-white/50 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
            {f.genero}
          </span>
        )}
        {f.mostrar_orientacao && f.orientacao && (
          <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400/80 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
            {f.orientacao}
          </span>
        )}
        {f.insta && (
          <span className="bg-black/40 border border-white/5 text-white/40 text-[8px] font-bold px-3 py-1.5 rounded-full lowercase flex items-center gap-1">
            <AtSign size={10} /> {f.insta}
          </span>
        )}
      </div>
    </div>
  );
}

type SectionProps = { title: string; children: React.ReactNode };
function Section({ title, children }: SectionProps) {
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
      <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 group-focus-within:text-orange-500 transition-colors ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl px-4 py-4 focus:border-orange-500/50 focus:bg-white/[0.08] outline-none text-white font-bold text-sm transition-all placeholder:text-white/10 shadow-inner';
const selectCls = 'w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl px-4 py-4 focus:border-orange-500/50 outline-none text-white font-bold text-sm transition-all cursor-pointer appearance-none shadow-inner';

export default function EditarPerfil() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState<FormData>({
    nome: '', idade: '', genero: 'Homem', orientacao: 'Hétero', curso: '', instituicao: '', insta: '', foto_url: '',
    ver_homem: false, ver_mulher: true, ver_nb: false, mostrar_curso: true, mostrar_orientacao: true,
  });

  const set = (key: keyof FormData, val: string | boolean) => setF((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile && isMounted) {
          setF({
            nome: profile.nome || '', idade: profile.idade?.toString() || '', genero: profile.genero || 'Homem',
            orientacao: profile.orientacao || 'Hétero', curso: profile.curso || '', instituicao: profile.instituicao || '',
            insta: profile.insta || '', foto_url: profile.foto_url || '', ver_homem: profile.ver_homem ?? false,
            ver_mulher: profile.ver_mulher ?? true, ver_nb: profile.ver_nb ?? false, mostrar_curso: profile.mostrar_curso ?? true,
            mostrar_orientacao: profile.mostrar_orientacao ?? true,
          });
        }
      } catch (err) {}
    })();
    return () => { isMounted = false; };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // Opções de compressão e conversão para WebP
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/webp',
      };

      const compressedFile = await imageCompression(file, options);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // CIRURGIA: O nome do arquivo agora é FIXO (apenas o ID do usuário)
      const path = `public/${user.id}.webp`;
      
      // CIRURGIA: Adicionamos o { upsert: true } para esmagar a foto antiga
      const { error } = await supabase.storage.from('fotos').upload(path, compressedFile, {
        upsert: true
      });

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(path);
      
      // CIRURGIA: "Cache Buster". Colocamos um ?v=tempo no final do link.
      set('foto_url', `${publicUrl}?v=${Date.now()}`);

    } catch (err: any) {
      alert('Erro no upload: ' + err.message);
    } finally { setUploading(false); }
  };

  const salvar = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, nome: f.nome, idade: parseInt(f.idade) || 0, genero: f.genero, orientacao: f.orientacao,
        curso: f.curso, instituicao: f.instituicao, insta: f.insta, foto_url: f.foto_url, ver_homem: f.ver_homem,
        ver_mulher: f.ver_mulher, ver_nb: f.ver_nb, mostrar_curso: f.mostrar_curso, mostrar_orientacao: f.mostrar_orientacao,
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
        
        {/* Sticky Header Obsidian */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-5 border-b border-white/5"
          style={{ background: 'rgba(15, 5, 26, 0.8)', backdropFilter: 'blur(20px)' }}
        >
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
            <button onClick={() => router.push('/perfil')} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Voltar</span>
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Editar Perfil</span>
            <button onClick={salvar} disabled={loading || saved} className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-400'}`}>
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
            <Section title="Identidade">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="md:col-span-2"><Field label="Nome"><input className={inputCls} value={f.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Seu nome" /></Field></div>
                <div><Field label="Idade"><input type="number" className={inputCls} value={f.idade} onChange={(e) => set('idade', e.target.value)} placeholder="22" /></Field></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Gênero"><select className={selectCls} value={f.genero} onChange={(e) => set('genero', e.target.value)}><option value="Homem">Homem</option><option value="Mulher">Mulher</option><option value="Não Binário">NB</option></select></Field>
                <div className="flex flex-col"><Field label="Orientação"><select className={selectCls} value={f.orientacao} onChange={(e) => set('orientacao', e.target.value)}><option value="Hétero">Hétero</option><option value="Bi">Bi</option><option value="Gay">Gay</option></select></Field>
                <Toggle label="Mostrar no perfil" checked={f.mostrar_orientacao} onChange={(val) => set('mostrar_orientacao', val)} /></div>
              </div>
            </Section>

            <Section title="Acadêmico">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <Field label="Curso"><input className={inputCls} value={f.curso} onChange={(e) => set('curso', e.target.value)} placeholder="Medicina" /></Field>
                <Field label="Faculdade"><input className={inputCls} value={f.instituicao} onChange={(e) => set('instituicao', e.target.value)} placeholder="UFC" /></Field>
              </div>
              <Toggle label="Mostrar curso e facul" checked={f.mostrar_curso} onChange={(val) => set('mostrar_curso', val)} />
            </Section>

            <Section title="Fotografia">
              <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full group rounded-2xl border border-dashed border-white/10 hover:border-orange-500/40 hover:bg-white/[0.02] transition-all p-10 flex flex-col items-center gap-4">
                {f.foto_url ? (
                  <>
                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-orange-500/50"><img src={f.foto_url} className="w-full h-full object-cover" alt="foto" /></div>
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

            <Section title="Radar de Plantão">
              <div className="flex gap-2">
                {[{ key: 'ver_homem', label: 'Homens', sym: '♂' }, { key: 'ver_mulher', label: 'Mulheres', sym: '♀' }, { key: 'ver_nb', label: 'NB', sym: '⚧' }].map(({ key, label, sym }) => {
                  const active = f[key as keyof FormData] as boolean;
                  return (
                    <button key={key} onClick={() => set(key as keyof FormData, !active)} className={`flex-1 py-4 rounded-xl border transition-all ${active ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-white/5 bg-white/5 text-white/20'}`}>
                      <div className="text-xl mb-1">{sym}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest">{label}</div>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Instagram">
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 focus-within:border-orange-500/50 transition-all">
                <AtSign size={16} className="text-white/20" />
                <input className="bg-transparent flex-1 outline-none text-white font-bold text-sm placeholder:text-white/10" value={f.insta} onChange={(e) => set('insta', e.target.value.replace('@', ''))} placeholder="seu.insta" />
              </div>
            </Section>

            <div className="h-32" />
          </div>
        </div>

        {/* Floating Save Button (Mobile) */}
        <div className="md:hidden fixed bottom-8 left-6 right-6 z-40">
          <button onClick={salvar} disabled={loading || saved} className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white shadow-orange-500/20'}`}>
            {saved ? '✓ Perfil Atualizado' : loading ? 'Sincronizando...' : 'Confirmar Mudanças'}
          </button>
        </div>
      </div>
    </>
  );
}