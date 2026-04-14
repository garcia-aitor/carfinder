import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const BATCH = 200;

/**
 * Copies all Car rows from LOCAL_DATABASE_URL to REMOTE_DATABASE_URL.
 *
 * Usage:
 *   cd backend
 *   LOCAL_DATABASE_URL="postgresql://..." REMOTE_DATABASE_URL="postgresql://..." npm run db:copy-cars
 *
 * To truncate the remote Car table before copying (avoids id/listingUrl conflicts):
 *   ... npm run db:copy-cars -- --replace
 */
async function main(): Promise<void> {
  const localUrl = process.env.LOCAL_DATABASE_URL;
  const remoteUrl = process.env.REMOTE_DATABASE_URL;

  if (!localUrl || !remoteUrl) {
    console.error(
      "Missing variables: LOCAL_DATABASE_URL and REMOTE_DATABASE_URL (export them or set them in .env).",
    );
    process.exit(1);
  }

  const replace = process.argv.includes("--replace");

  const local = new PrismaClient({ datasourceUrl: localUrl });
  const remote = new PrismaClient({ datasourceUrl: remoteUrl });

  try {
    const total = await local.car.count();
    console.log(`Car rows in local database: ${total}`);

    if (replace) {
      const deleted = await remote.car.deleteMany({});
      console.log(`Remote: deleted ${deleted.count} rows (--replace).`);
    }

    let cursor: { id: string } | undefined;
    let copied = 0;

    for (;;) {
      const rows = await local.car.findMany({
        take: BATCH,
        orderBy: { id: "asc" },
        ...(cursor ? { cursor, skip: 1 } : {}),
      });

      if (rows.length === 0) {
        break;
      }

      await remote.car.createMany({
        data: rows,
        skipDuplicates: !replace,
      });

      copied += rows.length;
      cursor = { id: rows[rows.length - 1].id };
      console.log(`Progress: ${copied}/${total}`);
    }

    console.log("Done.");
  } finally {
    await local.$disconnect();
    await remote.$disconnect();
  }
}

void main();
