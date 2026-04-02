import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Catraca from "./components/Catraca";
import Background from "./components/Background"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inter Match 🏥",
  description: "Triagem da Festa - UFC Sobral",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      {/* 💉 INFORME: Body totalmente transparente para não criar "muros" */}
      <body className="min-h-screen antialiased flex flex-col relative overflow-x-hidden bg-transparent">
        
        {/* 1. O "Leão de Chácara" envolve a lógica e os componentes */}
        <Catraca>
          
          {/* 💉 O Fundo agora vive aqui dentro. Como a Catraca retorna apenas um Fragment <>,
              o Background vai se posicionar em relação ao Body. */}
          <Background />
          
          {/* 2. Conteúdo Principal */}
          {/* relative z-10 garante que o conteúdo "boie" por cima do fundo */}
          <main className="flex-1 w-full pb-24 relative z-10 bg-transparent"> 
            {children}
          </main>
          
          {/* 3. A Barra de Navegação Fixa */}
          <Navbar />
          
        </Catraca>
        
      </body>
    </html>
  );
}