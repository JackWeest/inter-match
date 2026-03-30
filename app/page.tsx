import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="text-5xl font-bold text-orange-500 mb-4">
        Match da Festa 🔥
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Descubra quem tá afim de você na festa. Faça seu cadastro e prepare-se para os matches!
      </p>
      
      {/* Aqui está a mágica: o Link do Next.js */}
      <Link href="/login" className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg">
        Criar Conta / Entrar
      </Link>
    </main>
  );
}