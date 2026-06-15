# TaskNotes API

API simples para gerenciar tarefas, criada com NestJS, PostgreSQL e Redis.

## Requisitos

- Node.js 22+
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

## Usando a imagem publicada

O GitHub Actions publica a imagem no GitHub Container Registry:

```bash
docker pull ghcr.io/<dono-do-repositorio>/<nome-do-repositorio>:main
```

Tags geradas:

- `main`: último commit publicado na branch `main`
- `sha-<commit>`: imagem específica de cada commit processado pelo workflow
- `<release-tag>` e `latest`: release publicado

Para usar em outro projeto, informe PostgreSQL e Redis por variáveis de ambiente quando os serviços não estiverem nos valores padrão:

```bash
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -e DATABASE_HOST=<host-postgres> \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USER=<usuario> \
  -e DATABASE_PASSWORD=<senha> \
  -e DATABASE_NAME=<banco> \
  -e REDIS_HOST=<host-redis> \
  -e REDIS_PORT=6379 \
  ghcr.io/<dono-do-repositorio>/<nome-do-repositorio>:main
```

Valores padrão da aplicação: `PORT=3000`, `DATABASE_HOST=localhost`, `DATABASE_PORT=5432`, `DATABASE_USER=admin`, `DATABASE_PASSWORD=admin`, `DATABASE_NAME=tasks_db`, `REDIS_HOST=localhost` e `REDIS_PORT=6379`.

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
