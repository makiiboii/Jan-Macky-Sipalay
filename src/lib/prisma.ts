import { PrismaClient } from "@prisma/client";

const SCHEMA_VERSION = "2026-10-10-ai-role-and-portrait-videos";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaVersion !== SCHEMA_VERSION
) {
  globalForPrisma.prisma.$disconnect().catch(() => {});
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = SCHEMA_VERSION;
}
