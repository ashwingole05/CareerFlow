import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter }); // This 'adapter' is now required

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}