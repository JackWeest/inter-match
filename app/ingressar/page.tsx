'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Flame, ChevronLeft, Eye, EyeOff, AtSign, FileText } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Registro() {
  const [email, setEmail] = useState('');
  const [insta, setInsta] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const { toast } = useToast();

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Parede de Segurança: Verificação de senha dupla
    if (password !== confirmPassword) {
      toast('Senhas não coincidem, dá uma checada.', 'error');
      return;
    }

    if (password.length < 6) {
      toast('Senha precisa ter pelo menos 6 caracteres.', 'error');
      return;
    }

    if (!insta) {
      toast('Instagram é obrigatório pra galera te achar!', 'error');
      return;
    }

    if (!aceitouTermos) {
      toast('Aceite os termos de uso para continuar.', 'error');
      return;
    }

    setLoading(true);
    
    // Faz a cirurgia de cadastro no banco
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } else if (data.user) {
      // Já aproveita e injeta o Instagram do cara na ficha (upsert)
      await supabase.from('profiles').upsert({
        id: data.user.id,
        insta: insta.replace('@', ''), // Tira o @ se o cara tiver digitado
      });

      // Alta hospitalar direta! Sem confirmar e-mail, vai reto pro perfil.
      router.push('/perfil/criar');
    }
    setLoading(false);
  };

  const inputCls = 'w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl focus:border-orange-500 focus:outline-none text-white font-bold text-xs placeholder:text-white/20 transition-all shadow-inner';

  return (
    <>
      {/* 💉 FUNDOS GLOBAIS OBSIDIAN */}
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <main className="flex min-h-screen flex-col items-center justify-center p-6 relative z-10">
        
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 animate-in zoom-in duration-500">
          
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-orange-500 transition-colors mb-8"
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          <div className="flex flex-col items-center mb-8">
            <div className="bg-orange-500 p-4 rounded-2xl shadow-[0_10px_30px_rgba(234,88,12,0.3)] mb-4">
              <Flame size={32} color="white" fill="white" />
            </div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg leading-none">
              Criar Conta<span className="text-orange-500">.</span>
            </h1>
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-2 text-center">
              Garanta seu perfil na calourada
            </p>
          </div>

          <form onSubmit={handleCadastrar} className="flex flex-col gap-5">
            
            {/* E-MAIL */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-1">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls}
                placeholder="seu@email.com"
              />
            </div>

            {/* INSTAGRAM OBRIGATÓRIO */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-1">Instagram</label>
              <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-orange-500 transition-all shadow-inner">
                <AtSign size={16} className="text-white/20" />
                <input 
                  type="text" 
                  value={insta}
                  onChange={(e) => setInsta(e.target.value)}
                  required
                  className="bg-transparent flex-1 outline-none text-white font-bold text-xs placeholder:text-white/20"
                  placeholder="seu.insta" 
                />
              </div>
            </div>

            {/* SENHA */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-1">Senha</label>
              <div className="relative">
                <input 
                  type={mostrarSenha ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputCls + " pr-12"}
                  placeholder="Mínimo 6 caracteres"
                />
                <button 
                  type="button" 
                  onClick={() => setMostrarSenha(!mostrarSenha)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-orange-500 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRMAR SENHA */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 ml-1">Confirmar Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputCls + " pr-12"}
                  placeholder="Repita sua senha"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-orange-500 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* TERMOS DE USO */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                id="termos"
                className="mt-1 w-4 h-4 rounded border-white/20 bg-black/20 accent-orange-500 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="termos" className="text-white/40 text-[10px] font-bold leading-relaxed cursor-pointer select-none">
                Li e aceito os{' '}
                <button
                  type="button"
                  onClick={() => setMostrarTermos(true)}
                  className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors"
                >
                  Termos de Uso
                </button>{' '}
                e a{' '}
                <button
                  type="button"
                  onClick={() => setMostrarTermos(true)}
                  className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors"
                >
                  Política de Privacidade
                </button>{' '}
                do InterMatch
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-black italic uppercase tracking-widest py-4 rounded-2xl hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 text-sm mt-4"
            >
              {loading ? 'PROCESSANDO...' : 'CRIAR CONTA'}
            </button>

          </form>
        </div>
      </main>

      {/* MODAL TERMOS DE USO */}
      {mostrarTermos && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90" onClick={() => setMostrarTermos(false)}>
          <div className="relative w-full max-w-lg bg-[#0f051a] backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 px-8 py-5 border-b border-white/5 flex items-center justify-between" style={{ background: 'rgba(15, 5, 26, 0.95)', backdropFilter: 'blur(20px)' }}>
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-orange-500" />
                <h2 className="text-[11px] font-black text-white uppercase italic tracking-widest">Termos de Uso e Privacidade</h2>
              </div>
              <button onClick={() => setMostrarTermos(false)} className="text-white/30 hover:text-white transition-colors text-xl leading-none">&times;</button>
            </div>

            <div className="overflow-y-auto px-8 py-6 text-[11px] text-white/50 leading-relaxed space-y-5 flex-1">
              <p className="text-white/70 text-xs font-medium">Bem-vindo ao Inter-Match! Antes de criar sua conta e começar a usar o aplicativo, é obrigatório que você leia e concorde com as regras abaixo.</p>

              <div>
                <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">1. Natureza do Aplicativo</p>
                <p>O Inter-Match é uma iniciativa 100% recreativa e sem fins lucrativos, criada exclusivamente para promover a interação entre os participantes da festa do InterCE, organizada pela Alcateia. O aplicativo não possui vínculo comercial e não garante encontros ou qualquer tipo de resultado no mundo real.</p>
              </div>

              <div>
                <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">2. Declaração de Maioridade</p>
                <p>Ao se cadastrar, você declara expressamente ter 18 (dezoito) anos de idade completos ou mais. O uso deste aplicativo por menores de idade é estritamente proibido.</p>
              </div>

              <div>
                <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">3. Direitos de Imagem e Conteúdo</p>
                <p>Ao enviar uma foto para o banco de dados, você concede permissão para que sua imagem seja exibida dentro do app, declara ser autor ou possuir os direitos de uso, e assume total responsabilidade pelo conteúdo enviado.</p>
              </div>

              <div>
                <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">4. Conduta do Usuário</p>
                <p>É terminantemente proibido: criação de perfis falsos, envio de nudez explícita ou violência, e qualquer tipo de discurso de ódio, assédio, racismo, homofobia ou ofensa. Perfis infratores serão excluídos sem aviso prévio.</p>
              </div>

              <div>
                <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">5. Isenção de Responsabilidade e Independência</p>
                <p>O app é fornecido &quot;no estado em que se encontra&quot;, sem garantias. O Inter-Match é independente — o evento InterCE, a empresa SOMOS, e os patrocinadores Medway e Nymu não possuem qualquer vínculo com este aplicativo e estão isentos de responsabilidade.</p>
              </div>

              <div>
                <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">6. Proteção de Dados</p>
                <p>Os dados coletados serão utilizados única e exclusivamente para o funcionamento do aplicativo durante o período relacionado ao evento do InterCE.</p>
              </div>

              <div>
                <p className="text-orange-400 font-black text-[10px] uppercase tracking-wider mb-1">7. Foro</p>
                <p>Estes termos são regidos pelas leis brasileiras. Para dirimir quaisquer controvérsias, fica eleito o foro da Comarca de Sobral - CE.</p>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-white/5">
              <button
                onClick={() => { setAceitouTermos(true); setMostrarTermos(false); }}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-2xl bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/20 active:scale-95"
              >
                Li e Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}