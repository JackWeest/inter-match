'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Edit3, Trash2, AtSign, AlertTriangle } from 'lucide-react';
import CachedImage from '../components/CachedImage';

export default function PreviewPerfil() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const getProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          if (isMounted) router.push('/');
          return;
        }
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (isMounted) setProfile(data);
      } catch (err: any) {
        if (!err.message?.includes('stole it')) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    getProfile();
    return () => { isMounted = false; };
  }, [router]);

  const handleSair = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // CIRURGIA APLICADA: Em vez de apagar só o 'profiles', invoca o RPC para apagar a conta raiz
        const { error } = await supabase.rpc('delete_my_account');
        
        if (error) throw error;

        await supabase.auth.signOut();
        setShowDeleteModal(false);
        router.push('/');
      }
    } catch (erro) {
      console.error(erro);
      alert("Erro ao excluir conta.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center font-black italic text-orange-500 uppercase tracking-widest text-sm" style={{ background: '#0f051a' }}>
      Sincronizando Perfil...
    </div>
  );

  if (!profile) return null;

  // Altura da navbar + safe area
  const navbarHeight = 'calc(64px + max(1.5rem, env(safe-area-inset-bottom)))';

  return (
    <>
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      {/* MOBILE: ocupa exato o espaço disponível acima da navbar, sem scroll */}
      {/* DESKTOP: centralizado normalmente */}
      <main
        className="relative w-full px-6 md:min-h-[100dvh] md:flex md:items-center md:justify-center md:py-10"
        style={{
          // Mobile: altura exata da tela menos a navbar
          height: `calc(100dvh - ${navbarHeight})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Wrapper mobile: coluna que se adapta à altura disponível */}
        <div
          className="flex flex-col items-center w-full max-w-[300px] animate-in fade-in zoom-in-95 duration-500 md:hidden"
          style={{ height: '100%', gap: '3%', paddingTop: '4%', paddingBottom: '4%' }}
        >
          {/* CARD — ocupa o espaço restante após os botões */}
          <div
            className="relative w-full rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-900 group"
            style={{ flex: '1 1 0', minHeight: 0 }}
          >
            {profile.foto_url ? (
              <CachedImage src={profile.foto_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Sua foto" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-3 bg-zinc-900">
                <div className="text-6xl">👤</div>
                <span className="text-[10px] font-black uppercase tracking-widest">Sem Imagem</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f051a] via-[#0f051a]/40 to-transparent opacity-90 pointer-events-none" />
            <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-1">
              <h2 className="text-2xl font-black italic text-white leading-none truncate drop-shadow-lg uppercase">
                {profile.nome || 'Anônimo'}, {profile.idade || '?'}
              </h2>
              {profile.mostrar_curso && (profile.curso || profile.instituicao) && (
                <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] truncate leading-tight">
                  {[profile.curso, profile.instituicao].filter(Boolean).join(' · ')}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.genero && (
                  <span className="bg-white/5  border border-white/10 text-white/70 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {profile.genero}
                  </span>
                )}
                {profile.mostrar_orientacao && profile.orientacao && (
                  <span className="bg-orange-500/20  border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {profile.orientacao}
                  </span>
                )}
              </div>
              {profile.insta && (
                <div className="flex items-center gap-1.5 mt-3 text-white/60 font-bold text-xs bg-black/40 w-fit px-3 py-1.5 rounded-full border border-white/5 ">
                  <AtSign size={11} className="text-orange-500" />
                  <span className="tracking-wide">@{profile.insta.replace('@', '')}</span>
                </div>
              )}
            </div>
          </div>

          {/* BOTÕES — altura fixa, não encolhem */}
          <div className="w-full flex flex-col gap-2 shrink-0">
            <button
              onClick={() => router.push('/perfil/editar')}
              className="w-full h-12 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all text-[11px] uppercase tracking-[0.15em] bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 border border-orange-400/50"
            >
              <Edit3 size={16} strokeWidth={2.5} /> Editar Perfil
            </button>
            <div className="flex gap-2 w-full">
              <button
                onClick={handleSair}
                className="flex-1 h-12 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-[11px] uppercase tracking-[0.15em] bg-[#1a0f30]/40  text-white/50 hover:text-white hover:bg-[#1a0f30]/60 border border-white/5"
              >
                <LogOut size={15} strokeWidth={2.5} /> Sair
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 h-12 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-[11px] uppercase tracking-[0.15em] bg-red-500/10  text-red-500 hover:bg-red-500/20 border border-red-500/20"
              >
                <Trash2 size={15} strokeWidth={2.5} /> Excluir
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP: layout lado a lado, tamanho fixo */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-center md:gap-16 md:max-w-4xl w-full animate-in fade-in zoom-in-95 duration-500">
          <div className="relative w-[340px] aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-900 shrink-0 group">
            {profile.foto_url ? (
              <CachedImage src={profile.foto_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Sua foto" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-3 bg-zinc-900">
                <div className="text-6xl">👤</div>
                <span className="text-[10px] font-black uppercase tracking-widest">Sem Imagem</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f051a] via-[#0f051a]/40 to-transparent opacity-90 pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1">
              <h2 className="text-3xl font-black italic text-white leading-none truncate drop-shadow-lg uppercase">
                {profile.nome || 'Anônimo'}, {profile.idade || '?'}
              </h2>
              {profile.mostrar_curso && (profile.curso || profile.instituicao) && (
                <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 truncate leading-tight">
                  {[profile.curso, profile.instituicao].filter(Boolean).join(' · ')}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.genero && (
                  <span className="bg-white/5  border border-white/10 text-white/70 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                    {profile.genero}
                  </span>
                )}
                {profile.mostrar_orientacao && profile.orientacao && (
                  <span className="bg-orange-500/20  border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                    {profile.orientacao}
                  </span>
                )}
              </div>
              {profile.insta && (
                <div className="flex items-center gap-1.5 mt-4 text-white/60 font-bold text-xs bg-black/40 w-fit px-4 py-2 rounded-full border border-white/5 ">
                  <AtSign size={12} className="text-orange-500" />
                  <span className="tracking-wide">@{profile.insta.replace('@', '')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-[320px] flex flex-col gap-3 shrink-0">
            <button
              onClick={() => router.push('/perfil/editar')}
              className="w-full h-14 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all text-[11px] uppercase tracking-[0.15em] bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400 border border-orange-400/50"
            >
              <Edit3 size={18} strokeWidth={2.5} /> Editar Perfil
            </button>
            <div className="w-full h-px bg-white/5" />
            <div className="flex gap-3 w-full">
              <button
                onClick={handleSair}
                className="flex-1 h-14 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-[11px] uppercase tracking-[0.15em] bg-[#1a0f30]/40  text-white/50 hover:text-white hover:bg-[#1a0f30]/60 border border-white/5 shadow-inner"
              >
                <LogOut size={16} strokeWidth={2.5} /> Sair
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 h-14 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all text-[11px] uppercase tracking-[0.15em] bg-red-500/10  text-red-500 hover:bg-red-500/20 border border-red-500/20"
              >
                <Trash2 size={16} strokeWidth={2.5} /> Excluir
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 ">
          <div className="absolute inset-0" onClick={() => !deleting && setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-[#0f051a] backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.15)] p-8 flex flex-col items-center text-center border border-red-500/20 animate-in zoom-in-95 duration-200">
            <div className="bg-red-500/20 text-red-500 p-4 rounded-full mb-5 ring-4 ring-red-500/10">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-black italic text-white mb-2 leading-tight uppercase">Alerta Vermelho!</h3>
            <p className="text-white/40 text-[11px] uppercase tracking-widest font-bold mb-8 leading-relaxed">
              Seu perfil será deletado e todos os matches perdidos. Tem certeza?
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={handleConfirmDelete} disabled={deleting} className="w-full h-14 bg-red-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-red-500 disabled:opacity-50 flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-red-600/20">
                {deleting ? 'Destruindo...' : 'Sim, Apagar Tudo'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting} className="w-full h-14 bg-white/5  text-white/30 hover:text-white font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all border border-white/10">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}