/**
 * Single-line stdout progress for scrape runs (avoids per-page Nest logger spam).
 */
const BAR_WIDTH = 28;

export class ConsoleRunProgress {
  private lastFlushMs = 0;
  private readonly throttleMs = 350;

  tick(runId: string, processed: number, total: number): void {
    if (total <= 0) {
      return;
    }

    const now = Date.now();
    const done = processed >= total;
    if (!done && now - this.lastFlushMs < this.throttleMs) {
      return;
    }
    this.lastFlushMs = now;

    const pct = Math.min(100, Math.floor((100 * processed) / total));
    const filled = Math.min(BAR_WIDTH, Math.round((BAR_WIDTH * processed) / total));
    const bar = "█".repeat(filled) + "░".repeat(BAR_WIDTH - filled);
    const shortId = runId.slice(0, 8);
    const line = `[${bar}] ${pct}%  ${processed}/${total}  run ${shortId}…`;
    process.stdout.write(`\r\x1b[K${line}`);
  }

  /** Newline + summary after run leaves RUNNING state */
  doneLine(
    runId: string,
    processed: number,
    total: number,
    durationMs: number,
    status: string,
  ): void {
    this.tick(runId, processed, total);
    const sec = (durationMs / 1000).toFixed(1);
    const line = `\nRun ${runId} finished in ${sec}s (${processed}/${total} pages) status=${status}\n`;
    process.stdout.write(line);
  }
}

export const consoleRunProgress = new ConsoleRunProgress();
