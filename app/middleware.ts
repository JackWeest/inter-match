import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 💉 Redireciona TODO MUNDO para uma página de espera ou apenas bloqueia
  return new NextResponse(
    '<h1>🚑 InterMatch em Manutenção</h1><p>Voltamos dia 15/04 para o plantão oficial!</p>',
    { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
}

// Configura para agir em todas as rotas
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}