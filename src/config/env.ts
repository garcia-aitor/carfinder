function toInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

export const env = {
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/carfinder?schema=public",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  scrapeCron: process.env.SCRAPE_CRON ?? "0 * * * *",
  scrapeFallbackTotalPages: toInt(process.env.SCRAPE_DEFAULT_TOTAL_PAGES, 17500),
  scrapeMaxPagesCap: toInt(process.env.SCRAPE_MAX_PAGES_CAP, 20000),
  queueAttempts: toInt(process.env.QUEUE_ATTEMPTS, 5),
  queueBackoffMs: toInt(process.env.QUEUE_BACKOFF_MS, 2000),
  workerConcurrency: toInt(process.env.WORKER_CONCURRENCY, 50),
  httpTimeoutMs: toInt(process.env.HTTP_TIMEOUT_MS, 15000),
  appPort: toInt(process.env.APP_PORT, 3000),
  bullBoardPath: process.env.BULL_BOARD_PATH ?? "/admin/queues",
  availabilityMissingRunsThreshold: toInt(
    process.env.AVAILABILITY_MISSING_RUNS_THRESHOLD,
    2,
  ),
  scrapeRunOnBootstrap: toBool(process.env.SCRAPE_RUN_ON_BOOTSTRAP, true),
};
