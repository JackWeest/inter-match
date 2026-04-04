import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 💉 CIRURGIA ESTÉTICA: HTML e CSS inline premium para o bloqueio
  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InterMatch - Em Sincronização</title>
        <style>
            body {
                background-color: #0f051a; /* Roxo escuro do app */
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                text-align: center;
                overflow: hidden;
            }

            /* O padrão de fundo PB opaco que você usa no app */
            body::before {
                content: "";
                position: absolute;
                inset: 0;
                background-image: url('/padrao_pb.webp');
                background-size: cover;
                background-position: center;
                opacity: 0.02; /* Bem sutil */
                z-index: -1;
            }

            .container {
                max-width: 400px;
                padding: 20px;
                animation: fadein 1s ease-out;
            }

            .icon {
                font-size: 64px;
                margin-bottom: 20px;
                animation: heartBeat 2s infinite;
                display: block;
            }

            h1 {
                font-size: 28px;
                font-weight: 900;
                font-style: italic;
                text-transform: uppercase;
                color: white;
                letter-spacing: -0.05em;
                margin: 0 0 10px 0;
                line-height: 1;
            }

            h1 span {
                color: #f97316; /* Laranja do app */
            }

            p {
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.3em;
                color: rgba(255, 255, 255, 0.4);
                margin: 0;
                line-height: 1.6;
            }

            .date-badge {
                display: inline-block;
                margin-top: 30px;
                background-color: rgba(249, 115, 22, 0.1); /* Laranja sutil */
                border: 1px solid rgba(249, 115, 22, 0.2);
                color: #fb923c;
                font-size: 10px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                padding: 12px 24px;
                border-radius: 99px;
            }

            .footer {
                position: absolute;
                bottom: 30px;
                font-size: 8px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.4em;
                color: rgba(255, 255, 255, 0.15);
            }

            /* Animações */
            @keyframes fadein {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes heartBeat {
                0% { transform: scale(1); }
                14% { transform: scale(1.1); }
                28% { transform: scale(1); }
                42% { transform: scale(1.15); }
                70% { transform: scale(1); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <span class="icon">🚑</span>
            <h1>INTER<span>MATCH</span></h1>
            <p>Sincronizando os batimentos para o plantão oficial</p>
            <div class="date-badge">Lançamento: 15 / 04</div>
        </div>
        <div class="footer">#INTERMEDCE · UFC SOBRAL</div>
    </body>
    </html>`,
    { 
      status: 503, 
      headers: { 'content-type': 'text/html; charset=utf-8' } 
    }
  )
}

// 🛡️ Matcher Nuclear: Pega TODAS as rotas
export const config = {
  matcher: '/:path*',
}