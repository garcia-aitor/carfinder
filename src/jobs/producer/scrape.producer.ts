import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { env } from "../../config/env";
import { SCRAPE_PAGE_JOB, SCRAPE_QUEUE } from "../queue.constants";

@Injectable()
export class ScrapeProducer {
  constructor(@InjectQueue(SCRAPE_QUEUE) private readonly queue: Queue) {}

  async enqueuePages(runId: string, pages: number[]): Promise<void> {
    if (pages.length === 0) {
      return;
    }

    await this.queue.addBulk(
      pages.map((page) => ({
        name: SCRAPE_PAGE_JOB,
        data: { runId, page },
        opts: {
          jobId: `${runId}-${page}`,
          attempts: env.queueAttempts,
          backoff: {
            type: "exponential",
            delay: env.queueBackoffMs,
          },
          removeOnComplete: 1000,
          removeOnFail: 1000,
        },
      })),
    );
  }
}
