# TaskNotes API

API simples para gerenciar tarefas, criada com NestJS, PostgreSQL e Redis.

## Requisitos

- Node.js 20+
- npm
- Docker e Docker Compose, caso prefira rodar tudo em containers

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Exemplo para rodar localmente com npm:

```env
API_HOST_PORT=3000
API_CONTAINER_PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin
DATABASE_NAME=tasks_db

REDIS_HOST=localhost
REDIS_PORT=6379
```

## Rodando com npm

Instale as dependências:

```bash
npm install
```

Suba PostgreSQL e Redis. Se quiser usar os serviços do Docker Compose sem subir a API em container:

```bash
docker compose up -d postgres redis
```

Inicie a API em modo desenvolvimento:

```bash
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`.

## Rodando com Docker

Com o `.env` configurado, suba a aplicação completa:

```bash
docker compose up --build
```

Para parar os containers:

```bash
docker compose down
```

## Documentação da API

Com a aplicação rodando:

- Scalar API Reference: `http://localhost:3000/reference`
- OpenAPI JSON: `http://localhost:3000/openapi.json`
- Health check: `http://localhost:3000/health`

## Testes

```bash
npm test
npm run test:cov
```
