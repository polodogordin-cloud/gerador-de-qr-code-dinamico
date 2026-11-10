# Plaquinhas QR — Gerador de QR Code Dinâmico

Crie QR Codes dinâmicos para plaquinhas (avaliação Google, WhatsApp, Instagram…) e **troque o destino do link a qualquer momento, sem reimprimir**.

## Como funciona

1. Você cria uma plaquinha no painel e recebe um QR Code apontando para `sua-url/r/codigo`.
2. A impressão aponta **sempre para esse link curto fixo**.
3. O link redireciona para o destino atual salvo no banco — troque quando quiser no painel e o QR impresso passa a abrir o novo endereço imediatamente.
4. Cada scan é contabilizado (contador + data do último scan).

## Recursos do painel

- Criar placa (gera QR em segundos) e baixar **PNG** / **SVG** para a gráfica
- **Trocar destino** a qualquer momento
- **Plaquinha de Wi-Fi dinâmica**: o QR abre uma página pública com SSID, senha (revelar/copiar) e passo a passo; troque rede/senha no painel e a placa impressa continua valendo
- **Ativar / desativar** (o QR para de abrir quando desativado)
- **Travar** placa contra edições acidentais (edição e exclusão bloqueadas)
- **Arquivar** placas que saíram de circulação
- Contador de **scans** e data do último scan
- **Imprimir** o QR direto do navegador
- Buscar, filtrar (ativas / inativas / arquivadas) e excluir definitivamente
- URL base editável (mude de domínio sem perder o painel)

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Supabase](https://supabase.com) (Postgres + RLS) — tabelas `plaquinhas` e `settings`, função `registrar_scan`
- Deploy na [Vercel](https://vercel.com)

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```

Variáveis de ambiente:

| Variável | Descrição |
| --- | --- |
| `SUPABASE_URL` | URL do projeto Supabase (ex.: `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` (somente servidor — nunca exponha) |
| `ADMIN_PASSWORD` | Senha do painel |
| `SESSION_SECRET` | Segredo longo e aleatório para assinar o cookie de sessão |

## Banco de dados

As tabelas e a função RPC vivem no projeto Supabase (`plaquinhas`). A função
`registrar_scan(p_slug)` incrementa o contador de scans atomicamente e só pode
ser executada pela role `service_role`. Ambas as tabelas estão com Row Level
Security habilitado, sem policies públicas — todo acesso passa pelo servidor.

## Deploy

O projeto está configurado para a Vercel. Configure as 4 variáveis de ambiente
acima nas configurações do projeto e faça o deploy (push na branch de produção
ou `vercel deploy`).

Depois do deploy, ajuste a **URL base** no painel (ícone de engrenagem) para o
domínio final — ex.: `https://seusite.vercel.app`. Os QR Codes gerados e
baixados depois disso apontarão para o domínio certo.
