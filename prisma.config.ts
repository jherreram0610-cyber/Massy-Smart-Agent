import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL bypasses PgBouncer — required for DDL (db push / migrate)
    url: process.env["DIRECT_URL"]!,
  },
});
