import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Catraca from "./components/Catraca";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Match Med 🏥",
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
      <body className="min-h-screen bg-orange-50 antialiased flex flex-col relative overflow-x-hidden">
        
        {/* 1. O "Leão de Chácara" envolve tudo */}
        <Catraca>
          
          {/* 2. Conteúdo Principal */}
          {/* pb-24 garante que o conteúdo final não fique "esmagado" pela Navbar */}
          <main className="flex-1 w-full pb-24"> 
            {children}
          </main>
          
          {/* 3. A Barra de Navegação Fixa */}
          {/* Como ela tem a lógica interna de sumir no Login/Home, pode ficar aqui tranquila */}
          <Navbar />
          
        </Catraca>
        
      </body>
    </html>
  );
}