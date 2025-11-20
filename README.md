# Gear Core App

Gear Core lets you manage vehicles end-to-end: inventory, updates, and movement events. Frontend uses React/Apollo; backend uses Go with gqlgen and PostgreSQL.

## Stack
- UI: React 18, Vite, TypeScript, Apollo Client, MUI.
- API: Go 1.24, gqlgen, go-pg, Chi.
- DB: PostgreSQL 16.
- Containers: Docker Compose.

## Requirements
- Node.js 20+ and npm (for local UI dev).
- Go 1.24+ (for local API dev).
- Docker and Docker Compose (for containerized setup).
- PostgreSQL (if not using Docker).

## Quick start with Docker
1) Configure credentials in `go_api/config.yml` (or copy from `config.template.yml`).
   - Set `db.addr` to `db:5432` for Compose.
   - Set `security.admin_password` (creates admin user `main` with that password).

2) Bring everything up:
```bash
COMPOSE_PROJECT_NAME=gearcore docker-compose up --build
```
Services:
- API at `http://localhost:8080/query`
- UI at `http://localhost:3000`

To stop and clean volumes:
```bash
COMPOSE_PROJECT_NAME=gearcore docker-compose down -v
```

## Local development (without Docker)
### API
```bash
cd go_api
go run github.com/99designs/gqlgen generate --config internal/graph/gqlgen.yml  # if schema changed
go run ./cmd/api
```
Configure `go_api/config.yml` with your Postgres creds. API serves `/query` on the configured port (default 8080).

### UI
```bash
cd UI
npm install
npm run dev   # UI at http://localhost:5173
```

## Auth and roles
- Initial admin user: `main` with the password from `security.admin_password` (config.yml).
- Roles: Admin, Editor, Viewer.
- JWTs stored in `localStorage` (`auth`, `auth_token`) and sent via Authorization Bearer header.

## Current features
- Login and role-based route protection.
- Vehicle list, detail, create, edit, delete (delete gated to Admin).
- Vehicle movements: list and add.
- Movement report by date range (`movementReport`).
- User management (Admin): create Viewer users and change roles.

## Useful scripts
- Generate gqlgen code: `go run github.com/99designs/gqlgen generate --config internal/graph/gqlgen.yml`
- UI build: `npm run build` (inside `UI/`).
- UI lint: `npm run lint` (inside `UI/`).

## Notes
- If you expose the API on a different port/host, update `UI/src/apollo/client.ts` (GraphQL URI) before building the UI.
