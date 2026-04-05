export default function Home() {
  return (
    <>
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center relative z-10" style={{ background: '#0f051a' }}>
        <div className="w-[120px] h-[120px] rounded-full bg-orange-500/10 flex items-center justify-center mb-8 animate-pulse">
          <svg className="w-14 h-14 text-orange-500/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.383 3.383a1.17 1.17 0 0 1-1.782-1.247l1.027-6.087L.756 6.637a1.17 1.17 0 0 1 .65-1.999l6.087-1.027L10.287.375a1.17 1.17 0 0 1 2.03 0l2.794 3.236 6.087 1.027a1.17 1.17 0 0 1 .65 1.999l-4.53 4.533 1.027 6.087a1.17 1.17 0 0 1-1.782 1.247L11.42 15.17Z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
          Inter <span className="text-orange-500">Match</span>
        </h1>

        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
          Em Manutenção
        </p>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 max-w-sm shadow-2xl">
          <p className="text-white/50 text-xs leading-relaxed mb-6">
            Estamos preparando algo incrível pra galera.
          </p>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-orange-500/30" />
            <p className="text-orange-400 font-black text-2xl italic leading-none">
              15 de Abril
            </p>
            <div className="h-px w-12 bg-orange-500/30" />
          </div>

          <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">
            Lançamento
          </p>
        </div>
      </main>
    </>
  );
}
