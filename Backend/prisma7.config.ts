import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

// Load Backend/.env explicitly so Prisma commands work whether they are
// run from the Backend folder or from the workspace root.
const configDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(configDir, ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
