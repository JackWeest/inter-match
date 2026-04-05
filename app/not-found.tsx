'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <div className="fixed inset-0 bg-[#0f051a] -z-20 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100dvh] h-[100vw] md:w-[100vw] md:h-[100dvh] bg-[url('/padrao_pb.webp')] bg-cover bg-center bg-no-repeat opacity-[0.03] rotate-90 md:rotate-0 -z-10 pointer-events-none" />

      <main className="flex min-h-[100dvh] flex-col items-center justify-center p-6 relative z-10">
        <div className="text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-orange-500 p-5 rounded-[2rem] shadow-[0_10px_30px_rgba(234,88,12,0.3)] mx-auto mb-8 inline-flex">
            <Flame size={48} color="white" fill="white" />
          </div>

          <h1 className="text-8xl font-black text-white italic uppercase tracking-tighter mb-2">
            404
          </h1>
          <p className="text-orange-500 font-black text-[11px] uppercase tracking-[0.3em] mb-4">
            Fora de sintonia
          </p>
          <p className="text-white/30 text-xs font-medium leading-relaxed max-w-xs mx-auto mb-10">
            Essa página nã existe... mas o rolê ainda tá rolando!
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 text-white font-black italic uppercase tracking-widest py-4 px-10 rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-400 active:scale-95 transition-all text-sm"
          >
            Voltar pra Home
          </Link>
        </div>
      </main>
    </>
  );
}
