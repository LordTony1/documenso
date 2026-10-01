# Agent Guidelines for Documenso

## Build/Test/Lint Commands

- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run lint:fix` - Auto-fix linting issues
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:dev -w @documenso/app-tests` - Run single E2E test in dev mode
- `npm run test-ui:dev -w @documenso/app-tests` - Run E2E tests with UI
- `npm run format` - Format code with Biome
- `npm run dev` - Start development server for Remix app

**Important:** Do not run `npm run build` to verify changes unless explicitly asked. Builds take a long time (~2 minutes). Use `npx tsc --noEmit` for type checking specific packages if needed.

## Code Style Guidelines

- Use TypeScript for all code; prefer `type` over `interface`
- Use functional components with `const Component = () => {}`
- Never use classes; prefer functional/declarative patterns
- Use descriptive variable names with auxiliary verbs (isLoading, hasError)
- Directory names: lowercase with dashes (auth-wizard)
- Use named exports for components
- Never use 'use client' directive
- Never use 1-line if statements
- Structure files: exported component, subcomponents, helpers, static content, types

## Error Handling & Validation

- Use custom AppError class when throwing errors
- When catching errors on the frontend use `const error = AppError.parse(error)` to get the error code
- Use early returns and guard clauses
- Use Zod for form validation and react-hook-form for forms
- Use error boundaries for unexpected errors

## UI & Styling

- Use Shadcn UI, Radix, and Tailwind CSS with mobile-first approach
- Use `<Form>` `<FormItem>` elements with fieldset having `:disabled` attribute when loading
- Use Lucide icons with longhand names (HomeIcon vs Home)

## TRPC Routes

- Each route in own file: `routers/teams/create-team.ts`
- Associated types file: `routers/teams/create-team.types.ts`
- Request/response schemas: `Z[RouteName]RequestSchema`, `Z[RouteName]ResponseSchema`
- Only use GET and POST methods in OpenAPI meta
- Deconstruct input argument on its own line
- Prefer route names such as get/getMany/find/create/update/delete
- "create" routes request schema should have the ID and data in the top level
- "update" routes request schema should have the ID in the top level and the data in a nested "data" object

## Translations & Remix

- Use `<Trans>string</Trans>` for JSX translations from `@lingui/react/macro`
- Use `t\`string\`` macro for TypeScript translations
- Use `(params: Route.Params)` and `(loaderData: Route.LoaderData)` for routes
- Directly return data from loaders, don't use `json()`
- Use `superLoaderJson` when sending complex data through loaders such as dates or prisma decimals

## Checking Production (read-only debugging)

- SSH over Tailscale, not the LAN IP: `ssh root@100.93.36.104`. Containers: `documenso-selfhost-documenso-1` (app), `documenso-selfhost-database-1` (postgres).
- Postgres credentials live *inside* the database container, never in a host `.env`: `docker exec documenso-selfhost-database-1 env | grep POSTGRES`.
- Query with those creds, e.g. to check whether an email/recipient went out and was opened:
  ```bash
  docker exec documenso-selfhost-database-1 psql -U documenso -d documenso -c \
    "SELECT id, \"envelopeId\", email, name, role, \"signingStatus\", \"sendStatus\", \"readStatus\" FROM \"Recipient\" WHERE email ILIKE '%<address>%' ORDER BY id DESC LIMIT 20;"
  ```
  Then look up the envelope by `envelopeId` in the `Envelope` table (`title`, `type`, `status`) for context.
- App container logs (`docker logs documenso-selfhost-documenso-1 --since 72h`) generally don't contain email addresses/content — prefer the DB query above over grepping logs.
- This is read-only investigation, not a deploy — fine to do without extra approval. Never run `update.sh`/`compose ... up`/anything that deploys or mutates data without explicit approval, per the rules above.
