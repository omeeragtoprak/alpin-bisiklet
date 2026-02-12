// Prisma Configuration for Alpin Bisiklet
// Prisma 7+ uses this file for database configuration

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // PostgreSQL
    url: process.env["DATABASE_URL"]!,
  },
});
