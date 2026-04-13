import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const adminPasswordHash = await hash("admin123", 10);

    await prisma.user.upsert({
      where: { username: "admin" },
      update: {
        passwordHash: adminPasswordHash,
        isActive: true,
      },
      create: {
        username: "admin",
        passwordHash: adminPasswordHash,
        isActive: true,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

void main();
