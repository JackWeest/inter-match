'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, ArrowRight, Loader2, AtSign, Check, ChevronDown, Shield, FileText, AlertTriangle } from 'lucide-react';
import imageCompression from 'browser-image-compression';

// ─── DADOS DAS ATLÉTICAS ───────────────────────────────────────────────────────
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
    { nome: 'Voraz',         curso: 'Medicina', instituicao: 'F5 Sobral' },
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
type TipoParticipante = 'atletica' | 'convidado' | null;
type TipoParticipacao = 'festa' | 'completo' | null;

type OnboardingData = {
  tipo: TipoParticipante;
  atletica: string;
  cargo: string;
  participacao: TipoParticipacao;
  // Perfil
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
  aceitouTermos: boolean;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const calcCompletion = (f: OnboardingData) => {
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

function LiveCard({ f, completion }: { f: OnboardingData; completion: number }) {
  const atleticaInfo = TODAS_ATLETICAS.find(a => a.nome === f.atletica);
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
        {f.cargo && (
          <span className="bg-white/5 border border-white/10 text-white/40 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{f.cargo}</span>
        )}
        {f.insta && (
          <span className="bg-black/40 border border-white/5 text-white/40 text-[8px] font-bold px-3 py-1.5 rounded-full lowercase flex items-center gap-1">
            <AtSign size={10} /> {f.insta}
          </span>
        )}
        {f.participacao && (
          <span className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${f.participacao === 'completo' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
            {f.participacao === 'completo' ? '🎉 Evento Completo' : '🎊 Só a Festa'}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── STEP TERMOS DE USO ─────────────────────────────────────────────────────
function StepTermos({ f, set }: { f: OnboardingData; set: (k: keyof OnboardingData, v: any) => void }) {
  return (
    <div className="flex flex-col gap-6 animate-fadein">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Shield size={24} className="text-orange-500" />
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">Termos de Uso<span className="text-orange-500">.</span></h1>
        </div>
        <p className="text-white/30 text-xs mt-3 font-medium leading-relaxed">É obrigatório ler e aceitar as regras antes de criar sua conta.</p>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 text-xs text-white/50 leading-relaxed space-y-4 max-h-[400px] overflow-y-auto">
        <div>
          <p className="text-white font-bold text-[11px] uppercase tracking-wider mb-1">Bem-vindo ao Inter-Match!</p>
          <p>Antes de criar sua conta e começar a usar o aplicativo, é obrigatório que você leia e concorde com as regras abaixo. Ao clicar em {"\""}Aceitar{"\""}, você confirma que compreendeu e concorda com todas as condições descritas.</p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">1. Natureza do Aplicativo</p>
          <p>O Inter-Match é uma iniciativa 100% recreativa e sem fins lucrativos, criada exclusivamente para promover a interação entre os participantes da festa do InterCE, organizada pela Alcateia. O aplicativo não possui vínculo comercial e não garante encontros ou qualquer tipo de resultado no mundo real.</p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">2. Declaração de Maioridade</p>
          <p>Ao se cadastrar, você declara expressamente ter 18 (dezoito) anos de idade completos ou mais. O uso deste aplicativo por menores de idade é estritamente proibido. Caso seja identificada a presença de menores, a conta será imediatamente banida.</p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">3. Direitos de Imagem e Conteúdo</p>
          <p>Ao enviar uma foto para o nosso banco de dados, você concede permissão para que sua imagem seja exibida para outros usuários dentro do aplicativo. Você declara que a imagem enviada é de sua própria autoria ou que possui os direitos de uso sobre ela, e assume total responsabilidade pelo conteúdo da foto enviada.</p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">4. Conduta do Usuário e Proibições</p>
          <p>É terminantemente proibido: criação de perfis falsos ou uso de fotos de outras pessoas sem autorização; envio de imagens contendo nudez explícita, violência ou material impróprio; qualquer tipo de discurso de ódio, assédio, racismo, homofobia ou ofensa a outros usuários. Perfis que violarem essas regras serão imediatamente excluídos sem aviso prévio.</p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">5. Isenção de Responsabilidade</p>
          <p>O aplicativo é fornecido {"\""}no estado em que se encontra{"\""}, sem garantias de funcionamento ininterrupto. O Inter-Match é uma iniciativa estritamente independente — o evento InterCE, a empresa SOMOS, e os patrocinadores Medway e Nymu não possuem qualquer vínculo legal, administrativo, financeiro ou de desenvolvimento com este aplicativo.</p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">6. Proteção de Dados (Privacidade)</p>
          <p>Os dados coletados (nome, foto, informações de perfil) serão utilizados única e exclusivamente para o funcionamento do aplicativo durante o período relacionado ao evento do InterCE.</p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">7. Disposições Gerais e Foro</p>
          <p>Estes termos são regidos pelas leis brasileiras. Para dirimir quaisquer controvérsias decorrentes do uso do aplicativo, fica eleito o foro da Comarca de Sobral - CE.</p>
        </div>
      </div>

      <label className="flex items-start gap-4 cursor-pointer group bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/20 rounded-xl px-5 py-4 transition-all mt-2">
        <div className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${f.aceitouTermos ? 'border-orange-500 bg-orange-500' : 'border-white/20'}`}>
          {f.aceitouTermos && <Check size={14} className="text-white" />}
        </div>
        <div>
          <span className={`text-xs ${f.aceitouTermos ? 'text-white/30' : 'text-white/20'}`}>
            Marcar caixa para aceitar os termos acima.
          </span>
          <p className="text-white/30 text-[10px] mt-0.5">É obrigatório aceitar para continuar.</p>
        </div>
        <input type="checkbox" className="sr-only" checked={f.aceitouTermos} onChange={(e) => set('aceitouTermos', e.target.checked)} />
      </label>
    </div>
  );
}

// ─── SECTION ─────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
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

const inputCls = 'w-full bg-black/60 hover:bg-black/70 border border-white/10 rounded-xl px-4 py-4 focus:border-orange-500/50 focus:bg-black/70 outline-none text-white font-bold text-sm transition-all placeholder:text-white/25 shadow-inner ';
const selectCls = 'w-full bg-black/60 hover:bg-black/70 border border-white/10 rounded-xl px-4 py-4 focus:border-orange-500/50 outline-none text-white font-bold text-sm transition-all cursor-pointer appearance-none shadow-inner ';

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i < step ? 'bg-orange-500' : i === step - 1 ? 'bg-orange-500 w-6' : 'bg-white/10 w-3'}`}
          style={{ width: i === step - 1 ? 24 : 12 }} />
      ))}
    </div>
  );
}

// ─── STEP 1: TIPO DE PARTICIPANTE ─────────────────────────────────────────────
function Step1({ f, set }: { f: OnboardingData; set: (k: keyof OnboardingData, v: any) => void }) {
  return (
    <div className="flex flex-col gap-6 animate-fadein">
      <div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">Quem é você<span className="text-orange-500">?</span></h1>
        <p className="text-white/30 text-xs mt-3 font-medium leading-relaxed">Conta pra gente como você está participando do evento.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-2">
        <button
          onClick={() => set('tipo', 'atletica')}
          className={`group relative overflow-hidden rounded-2xl border p-6 text-left  shadow-lg active:scale-[0.98] transition-all duration-300 bg-black/60 ${f.tipo === 'atletica' ? 'border-orange-500/60 ring-1 ring-inset ring-orange-500/20' : 'border-white/10 hover:border-white/25 hover:bg-black/70'}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl mb-2">⚔️</div>
              <p className="text-white font-black text-base uppercase tracking-wide">Membro de Atlética</p>
              <p className="text-white/50 text-xs mt-1.5 leading-relaxed font-medium">Faço parte de uma atlética de medicina e estou representando minha equipe.</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 mt-1 transition-all ${f.tipo === 'atletica' ? 'border-orange-500 bg-orange-500' : 'border-white/30'}`}>
              {f.tipo === 'atletica' && <Check size={12} className="text-white" />}
            </div>
          </div>
        </button>

        <button
          onClick={() => set('tipo', 'convidado')}
          className={`group relative overflow-hidden rounded-2xl border p-6 text-left  shadow-lg active:scale-[0.98] transition-all duration-300 bg-black/60 ${f.tipo === 'convidado' ? 'border-orange-500/60 ring-1 ring-inset ring-orange-500/20' : 'border-white/10 hover:border-white/25 hover:bg-black/70'}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl mb-2">🎟️</div>
              <p className="text-white font-black text-base uppercase tracking-wide">Convidado</p>
              <p className="text-white/50 text-xs mt-1.5 leading-relaxed font-medium">Estou participando como visitante ou convidado do evento.</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 mt-1 transition-all ${f.tipo === 'convidado' ? 'border-orange-500 bg-orange-500' : 'border-white/30'}`}>
              {f.tipo === 'convidado' && <Check size={12} className="text-white" />}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: ATLÉTICA + CARGO (só se for membro) ──────────────────────────────
function Step2Atletica({ f, set }: { f: OnboardingData; set: (k: keyof OnboardingData, v: any) => void }) {
  const handleAtletica = (nome: string) => {
    const info = TODAS_ATLETICAS.find(a => a.nome === nome);
    set('atletica', nome);
    if (info) {
      set('curso', info.curso);
      set('instituicao', info.instituicao);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadein">
      <div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">Sua Atlética<span className="text-orange-500">.</span></h1>
        <p className="text-white/30 text-xs mt-3 font-medium leading-relaxed">Selecione sua equipe e seu cargo dentro dela.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Atlética">
          <div className="relative">
            <select className={selectCls} value={f.atletica} onChange={(e) => handleAtletica(e.target.value)}>
              <option value="">Selecione sua atlética</option>
              {Object.entries(ATLETICAS).map(([divisao, lista]) => (
                <optgroup key={divisao} label={`── ${divisao} ──`}>
                  {lista.map(a => (
                    <option key={a.nome} value={a.nome}>{a.nome}</option>
                  ))}
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
              <span className="text-orange-400 font-black">{f.atletica}</span>
              {' · '}{f.curso} · {f.instituicao}
            </p>
          </div>
        )}

        <Field label="Cargo na Atlética">
          <div className="relative">
            <select className={selectCls} value={f.cargo} onChange={(e) => set('cargo', e.target.value)}>
              <option value="">Selecione seu cargo</option>
              {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        </Field>
      </div>
    </div>
  );
}

// ─── STEP 2B: PARTICIPAÇÃO NO EVENTO ─────────────────────────────────────────
function StepParticipacao({ f, set }: { f: OnboardingData; set: (k: keyof OnboardingData, v: any) => void }) {
  return (
    <div className="flex flex-col gap-6 animate-fadein">
      <div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">Participação<span className="text-orange-500">.</span></h1>
        <p className="text-white/30 text-xs mt-3 font-medium leading-relaxed">Como você vai curtir o evento?</p>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-2">
        <button
          onClick={() => set('participacao', 'festa')}
          className={`rounded-2xl border p-6 text-left  shadow-lg active:scale-[0.98] transition-all duration-300 bg-black/60 ${f.participacao === 'festa' ? 'border-yellow-500/60 ring-1 ring-inset ring-yellow-500/20' : 'border-white/10 hover:border-white/25 hover:bg-black/70'}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl mb-2">🎊</div>
              <p className="text-white font-black text-base uppercase tracking-wide">Só a Festa</p>
              <p className="text-white/50 text-xs mt-1.5 leading-relaxed font-medium">Vou apenas para a festa aberta do 1° dia.</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 mt-1 transition-all ${f.participacao === 'festa' ? 'border-yellow-500 bg-yellow-500' : 'border-white/30'}`}>
              {f.participacao === 'festa' && <Check size={12} className="text-white" />}
            </div>
          </div>
        </button>

        <button
          onClick={() => set('participacao', 'completo')}
          className={`rounded-2xl border p-6 text-left  shadow-lg active:scale-[0.98] transition-all duration-300 bg-black/60 ${f.participacao === 'completo' ? 'border-green-500/60 ring-1 ring-inset ring-green-500/20' : 'border-white/10 hover:border-white/25 hover:bg-black/70'}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-white font-black text-base uppercase tracking-wide">Evento Completo</p>
              <p className="text-white/50 text-xs mt-1.5 leading-relaxed font-medium">Vou participar de todos os dias e competições do evento.</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 mt-1 transition-all ${f.participacao === 'completo' ? 'border-green-500 bg-green-500' : 'border-white/30'}`}>
              {f.participacao === 'completo' && <Check size={12} className="text-white" />}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── STEP PERFIL ──────────────────────────────────────────────────────────────
function StepPerfil({ f, set, onUpload, uploading, fileInputRef }: {
  f: OnboardingData;
  set: (k: keyof OnboardingData, v: any) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex flex-col gap-2 animate-fadein">
      <div className="mb-4">
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">Seu Perfil<span className="text-orange-500">.</span></h1>
        <p className="text-white/30 text-xs mt-3 font-medium leading-relaxed">Quase lá! Agora conte mais sobre você.</p>
      </div>

      <Section title="Identidade">
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="col-span-2"><Field label="Nome"><input className={inputCls} value={f.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Seu nome" /></Field></div>
          <Field label="Idade"><input type="number" className={inputCls} value={f.idade} onChange={(e) => set('idade', e.target.value)} placeholder="Sua idade" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Gênero">
            <div className="relative">
              <select className={selectCls} value={f.genero} onChange={(e) => set('genero', e.target.value)}>
                <option value="Homem">Homem</option><option value="Mulher">Mulher</option><option value="Não Binário">NB</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
          </Field>
          <div>
            <Field label="Orientação">
              <div className="relative">
                <select className={selectCls} value={f.orientacao} onChange={(e) => set('orientacao', e.target.value)}>
                  <option value="Hétero">Hétero</option><option value="Bi">Bi</option><option value="Gay">Gay</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
              </div>
            </Field>
            <Toggle label="Mostrar no perfil" checked={f.mostrar_orientacao} onChange={(val) => set('mostrar_orientacao', val)} />
          </div>
        </div>
      </Section>

      {/* Acadêmico só aparece para convidados (atlética já é preenchido auto) */}
      {f.tipo === 'convidado' && (
        <Section title="Acadêmico">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <Field label="Curso"><input className={inputCls} value={f.curso} onChange={(e) => set('curso', e.target.value)} placeholder="Medicina" /></Field>
            <Field label="Faculdade"><input className={inputCls} value={f.instituicao} onChange={(e) => set('instituicao', e.target.value)} placeholder="UFC" /></Field>
          </div>
          <Toggle label="Mostrar curso e facul" checked={f.mostrar_curso} onChange={(val) => set('mostrar_curso', val)} />
        </Section>
      )}

      {f.tipo === 'atletica' && (
        <Section title="Acadêmico">
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <p className="text-white/50 text-xs font-bold">
              <span className="text-orange-400 font-black">{f.atletica}</span> · {f.curso} · {f.instituicao}
            </p>
          </div>
          <Toggle label="Mostrar curso e facul" checked={f.mostrar_curso} onChange={(val) => set('mostrar_curso', val)} />
        </Section>
      )}

      <Section title="Foto">
        <input type="file" ref={fileInputRef} onChange={onUpload} accept="image/*" className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full group rounded-2xl border border-dashed border-white/10 hover:border-orange-500/40 hover:bg-white/[0.02] transition-all p-8 flex flex-col items-center gap-4">
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
            const active = f[key as keyof OnboardingData] as boolean;
            return (
              <button key={key} onClick={() => set(key as keyof OnboardingData, !active)} className={`flex-1 py-4 rounded-xl border transition-all ${active ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-white/5 bg-white/5 text-white/20'}`}>
                <div className="text-xl mb-1">{sym}</div>
                <div className="text-[8px] font-black uppercase tracking-widest">{label}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Instagram *">
        <div className="flex items-center gap-3 bg-black/60  border border-white/10 rounded-xl px-4 py-4 focus-within:border-orange-500/50 transition-all">
          <AtSign size={16} className="text-white/20" />
          <input className="bg-transparent flex-1 outline-none text-white font-bold text-sm placeholder:text-white/10" value={f.insta} onChange={(e) => set('insta', e.target.value.replace('@', ''))} placeholder="obrigatório" required />
        </div>
      </Section>

      <div className="h-8" />
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function CriarPerfil() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);

  const [f, setF] = useState<OnboardingData>({
    tipo: null, atletica: '', cargo: '', participacao: null,
    nome: '', idade: '', genero: 'Homem', orientacao: 'Hétero',
    curso: '', instituicao: '', insta: '', foto_url: '',
    ver_homem: false, ver_mulher: true, ver_nb: false,
    mostrar_curso: true, mostrar_orientacao: true,
    aceitouTermos: false,
  });

  const set = (key: keyof OnboardingData, val: any) => setF(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('insta').eq('id', user.id).single();
        if (profile?.insta && isMounted) {
          set('insta', profile.insta);
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const totalSteps = f.tipo === 'atletica' ? 5 : f.tipo === 'convidado' ? 4 : 5;

  const canAdvance = () => {
    if (step === 1) return !!f.tipo;
    if (step === 2 && f.tipo === 'atletica') return !!f.atletica && !!f.cargo;
    if (step === 2 && f.tipo === 'convidado') return !!f.participacao;
    if (step === 3 && f.tipo === 'atletica') return !!f.participacao;
    if (step === 3 && f.tipo === 'convidado') return !!f.nome && !!f.insta;
    if (step === 4 && f.tipo === 'atletica') return !!f.nome && !!f.insta;
    // step 4 convidado (termos) and step 5 atletica (termos) — always advance to see the terms
    if (step === 4 && f.tipo === 'convidado') return true;
    // step 5 atletica (perfil) -> last step handled by isLastStep/save, not advance
    return false;
  };

  const advance = () => {
    if (canAdvance()) setStep(s => s + 1);
  };

  const back = () => {
    if (step > 1) setStep(s => s - 1);
    else router.push('/');
  };

  const getStepContent = () => {
    if (step === 1) return <Step1 f={f} set={set} />;
    if (step === 2 && f.tipo === 'atletica') return <Step2Atletica f={f} set={set} />;
    if (step === 2 && f.tipo === 'convidado') return <StepParticipacao f={f} set={set} />;
    if (step === 3 && f.tipo === 'atletica') return <StepParticipacao f={f} set={set} />;
    if (step === 3 && f.tipo === 'convidado') return <StepPerfil f={f} set={set} onUpload={handleUpload} uploading={uploading} fileInputRef={fileInputRef} />;
    if (step === 4 && f.tipo === 'atletica') return <StepPerfil f={f} set={set} onUpload={handleUpload} uploading={uploading} fileInputRef={fileInputRef} />;
    if ((step === 5 && f.tipo === 'atletica') || (step === 4 && f.tipo === 'convidado'))
      return <StepTermos f={f} set={set} />;
    return null;
  };

  const isLastStep = (f.tipo === 'atletica' && step === 5) || (f.tipo === 'convidado' && step === 4);

  // ─── UPLOAD COM COMPRESSÃO CLIENT-SIDE ──────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: 'image/jpeg',
      });

      const formData = new FormData();
      formData.append('file', compressed, file.name.replace(/\.[^.]+$/, '.jpg'));
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

      const urlOriginal = data.secure_url;
      const urlOtimizada = urlOriginal.replace('/upload/', '/upload/q_auto,f_auto/');

      set('foto_url', urlOtimizada);

    } catch (err: any) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const salvar = async () => {
    if (!f.aceitouTermos) {
      alert('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }
    const idade = parseInt(f.idade);
    if (!f.idade || isNaN(idade) || idade < 18) {
      setShowAgeModal(true);
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nome: f.nome,
        idade: idade,
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
        tipo_participante: f.tipo,
        atletica: f.atletica || null,
        cargo_atletica: f.cargo || null,
        tipo_participacao: f.participacao,
      });
      if (!error) {
        setSaved(true);
        // Limpar cache da Catraca pra ela saber que o perfil está completo
        // @ts-ignore - Catraca usa módulo global, acessível via import
        try { window.dispatchEvent(new CustomEvent('profile-created')); } catch {}
        setTimeout(() => router.push('/triagem'), 800);
      }
    }
    setLoading(false);
  };

  const completion = calcCompletion(f);
  const showPreview = isLastStep;

  const isReadyToSave = !!f.nome && !!f.insta;

  return (
    <>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadein { animation: fadein 0.4s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>

      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <div className="h-[100dvh] w-full overflow-y-auto relative scroll-smooth selection:bg-orange-500/30">

        {/* Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-5 border-b border-white/5"
          style={{ background: 'rgba(15, 5, 26, 0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
            <button onClick={back} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <StepBar step={step} total={f.tipo === 'atletica' ? 5 : 4} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic w-[40px] text-right">
              {step}/{f.tipo === 'atletica' ? 5 : f.tipo === 'convidado' ? 4 : '?'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row min-h-[calc(100dvh-73px)]">

          {/* Preview (só no último step) */}
          {showPreview && (
            <aside className="md:sticky md:top-[73px] md:h-[calc(100vh-73px)] w-full md:w-[380px] flex flex-col items-center justify-center py-12 px-6 border-b border-white/5 md:border-b-0 md:border-r border-white/5 bg-white/[0.01]">
              <LiveCard f={f} completion={completion} />
            </aside>
          )}

          {/* Form */}
          <div className={`flex-1 w-full px-6 md:px-16 py-12 ${showPreview ? 'max-w-2xl' : 'max-w-lg'} mx-auto flex flex-col justify-between`}>
            <div key={step}>
              {getStepContent()}
            </div>

            {/* Botão de avançar/confirmar */}
            <div className="mt-10 pb-10">
              {isLastStep ? (
                <button onClick={salvar} disabled={loading || saved || !isReadyToSave}
                  className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl ${saved ? 'bg-green-500 text-white' : !isReadyToSave ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed' : 'bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-400'}`}>
                  {saved ? '✓ Perfil Criado!' : loading ? 'Salvando...' : 'Criar Perfil →'}
                </button>
              ) : (
                <button onClick={advance} disabled={!canAdvance()}
                  className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${canAdvance() ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-2xl shadow-orange-500/20' : 'bg-white/5 border border-white/10 text-white/25 cursor-not-allowed'}`}
                  style={{ backdropFilter: 'blur(12px)' }}>
                  Continuar <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL IDADE */}
      {showAgeModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90">
          <div className="absolute inset-0" onClick={() => setShowAgeModal(false)} />
          <div className="relative w-full max-w-sm bg-[#0f051a] backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.15)] p-8 flex flex-col items-center text-center border border-red-500/20 animate-in zoom-in-95 duration-200">
            <div className="bg-red-500/20 text-red-500 p-4 rounded-full mb-5 ring-4 ring-red-500/10">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-black italic text-white mb-2 leading-tight uppercase">Atenção!</h3>
            <p className="text-white/40 text-[11px] uppercase tracking-widest font-bold mb-8 leading-relaxed">
              O Inter-Match é exclusivo para maiores de 18 anos. Você precisa ter 18 anos ou mais para criar uma conta.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={() => setShowAgeModal(false)} className="w-full h-14 bg-white/0 font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all border border-red-500/20 text-red-500">
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}