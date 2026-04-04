import type { Metadata, Viewport } from "next";
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
  title: "Match Med 🏥",
  description: "Triagem da Festa - UFC Sobral",
};

// ✅ Viewport separado do metadata (padrão Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // impede zoom automático no iOS
  userScalable: false,
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
      className={`${geistSans.variable} ${geistMono.variable}`} // ✅ removido h-full
    >
      <body className="min-h-screen antialiased flex flex-col relative bg-transparent">
        <Catraca>
          <Background />
          <main className="flex-1 w-full relative z-10 bg-transparent">
            {children}
          </main>
          <Navbar />
        </Catraca>
      </body>
    </html>
  );
}