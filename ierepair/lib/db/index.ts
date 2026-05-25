import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For Cloud Run + Cloud SQL (Unix socket) the URL format is:
// postgresql://user:pass@/dbname?host=/cloudsql/project:region:instance
// For local dev: postgresql://user:pass@localhost:5432/dbname

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // required for Cloud SQL via Unix socket
});

export const db = drizzle(client, { schema, logger: process.env.NODE_ENV === "development" });

export type DB = typeof db;
