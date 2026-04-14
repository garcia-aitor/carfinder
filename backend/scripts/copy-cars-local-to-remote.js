"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const BATCH = 200;
async function main() {
    const localUrl = process.env.LOCAL_DATABASE_URL;
    const remoteUrl = process.env.REMOTE_DATABASE_URL;
    if (!localUrl || !remoteUrl) {
        console.error("Missing variables: LOCAL_DATABASE_URL and REMOTE_DATABASE_URL (export them or set them in .env).");
        process.exit(1);
    }
    const replace = process.argv.includes("--replace");
    const local = new client_1.PrismaClient({ datasourceUrl: localUrl });
    const remote = new client_1.PrismaClient({ datasourceUrl: remoteUrl });
    try {
        const total = await local.car.count();
        console.log(`Car rows in local database: ${total}`);
        if (replace) {
            const deleted = await remote.car.deleteMany({});
            console.log(`Remote: deleted ${deleted.count} rows (--replace).`);
        }
        let cursor;
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
    }
    finally {
        await local.$disconnect();
        await remote.$disconnect();
    }
}
void main();
//# sourceMappingURL=copy-cars-local-to-remote.js.map