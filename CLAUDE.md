# Todolist Project

A full-stack Todolist application with a React frontend and Node.js/Express backend.

## Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Testing**: Vitest (unit/integration), Playwright (e2e)

## Project Structure

```
Todolist/
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── api/
│   └── package.json
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── middleware/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── .claude/
    └── agents/        # Subagent definitions for agent teams
```

## Development Commands

- `npm run dev` — start both frontend and backend
- `npm run test` — run all tests
- `npm run build` — production build
- `npx prisma migrate dev` — run DB migrations
- `npx prisma studio` — open DB GUI

## Key Conventions

- Use TypeScript strict mode everywhere
- API routes: REST under `/api/v1/`
- Auth: JWT in httpOnly cookies
- Error responses: `{ error: string, code: string }`
- All DB access goes through service layer, never directly in routes
- Tests must cover happy path + at least one error case

## Agent Team Roles

When creating an agent team for this project, available subagent types:

| Role | Description |
|---|---|
| `frontend-developer` | React components, hooks, pages, and frontend API integration |
| `backend-developer` | Express routes, controllers, services, and middleware |
| `database-engineer` | Prisma schema, migrations, and query optimization |
| `test-engineer` | Unit, integration, and e2e tests |
| `code-reviewer` | Security, performance, and quality review |
