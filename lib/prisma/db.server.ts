// Server-only re-export of the shared Prisma singleton.
//
// `db.ts` registers the singleton and calls `prisma.$connect()` at module load
// (top-level side effects). Because `@prisma/client` cannot run in the browser,
// any Remix route importing `db.ts` directly would drag PrismaClient into the
// client bundle (the side effects defeat tree-shaking). The `.server` suffix
// tells Remix to strip this module — and its transitive `./db` import — from the
// client bundle, exactly like `sql.server.ts`. Routes should import `prisma`
// from here; non-Remix code (importer, models) can keep importing `./db`.
export { prisma } from "./db";
