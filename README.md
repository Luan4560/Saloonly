# Saloonly

MVP de agendamento de serviços para estabelecimentos (barbearias, salões de beleza).

## Estrutura

- **`client/`** – Frontend React (Vite + TypeScript + Tailwind). Painel admin: login, dashboard, CRUD de estabelecimentos, serviços, colaboradores e agendamentos.
- **`server/`** – Backend Fastify (TypeScript + Prisma + PostgreSQL). API REST com autenticação JWT em cookie, documentação Swagger.

## Pré-requisitos

- Node.js >= 22
- pnpm
- PostgreSQL (local ou Docker)

## Como rodar

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

**Server** – copie `server/.env.example` para `server/.env` e preencha:

- `DATABASE_URL` – conexão PostgreSQL (ex.: `postgresql://user:pass@localhost:5432/saloonly?schema=public`)
- `JWT_SECRET` – segredo para assinatura do JWT (mín. 32 caracteres)
- `COOKIE_SECRET` – segredo para cookie (mín. 32 caracteres)
- `PORT` – porta do servidor (padrão 8080)
- `FRONTEND_URL` – URL do frontend para links de recuperação de senha (ex.: `http://localhost:5173` em dev; em produção use a URL pública do app)

Se o server não iniciar com `Error: Invalid environment variables`, confira se `server/.env` existe e se `JWT_SECRET`, `DATABASE_URL` e `COOKIE_SECRET` estão definidos (e `COOKIE_SECRET` com 32+ caracteres).

**Client** – copie `client/.env.example` para `client/.env`:

- `VITE_API_URL` – URL base da API (ex.: `http://localhost:8080/api` em dev; em produção use a URL pública da API, ex.: `https://api.seudominio.com/api`)

### 3. Banco de dados

Gere o Prisma Client e rode as migrações (obrigatório antes de rodar ou buildar o server; o client fica em `server/src/generated/` e não é versionado):

```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Subir aplicação

**Desenvolvimento** (client + server em paralelo):

```bash
pnpm dev
```

- Frontend: http://localhost:5173 (ou porta que o Vite indicar)
- Backend: http://localhost:8080

**Apenas backend:**

```bash
pnpm dev:server
```

**Apenas frontend:**

```bash
pnpm dev:client
```

### 5. Build para produção

```bash
pnpm build
```

Gera artefatos em `client/dist` e `server/build`. Em produção, sirva o frontend como estático e rode o server (Node) apontando para o mesmo host ou subdomínio, com `VITE_API_URL` apontando para a API pública.

## Rate limiting

A API aplica limite de requisições por IP: 100 requisições a cada 15 minutos (global). Rotas de autenticação têm limites mais restritos: registro e login (10/15 min), esqueci senha e redefinição (5/15 min).

## Documentação da API

Com o server rodando, acesse:

- **Swagger UI:** http://localhost:8080/docs

## Docker

Para subir apenas o banco (ou stack definida no `docker-compose`):

```bash
pnpm docker:up
pnpm docker:down
```

Ajuste `DATABASE_URL` no `.env` do server para o host/porta do PostgreSQL no Docker.

## Scripts principais

| Script           | Descrição                          |
|------------------|------------------------------------|
| `pnpm dev`       | Roda client e server em paralelo   |
| `pnpm build`     | Build do client e do server        |
| `pnpm db:migrate`| Roda migrações Prisma              |
| `pnpm db:generate` | Gera Prisma Client               |
| `pnpm test`      | Testes (client e server)           |
| `pnpm lint`      | Lint em todos os pacotes            |

## Deploy

- **Backend:** rode o build do server em um processo Node (ex.: `node server/build/server.js`) com variáveis de ambiente de produção. Use um PostgreSQL gerenciado (ex.: Railway, Neon, Supabase) ou em container. Defina `FRONTEND_URL` com a URL pública do frontend para que os e-mails de recuperação de senha apontem para o link correto.
- **Frontend:** faça o build (`pnpm build` ou `pnpm build:client`) e sirva a pasta `client/dist` com Nginx, Vercel, Netlify ou similar. Configure `VITE_API_URL` no build para a URL pública da API (variáveis `VITE_*` são embutidas no build no momento do `vite build`).
- **Recomendações:** use HTTPS, `NODE_ENV=production`, segredos fortes e não versionar `.env` com credenciais.
