import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { randomUUID } from "crypto";
import { env } from "../../config/env";
import { ScraperService } from "../../scraper/scraper.service";
import { ScrapeProducer } from "../producer/scrape.producer";
import { ScrapeRunRepository } from "../../persistence/repositories/scrape-run.repository";
import { ScrapeJobRepository } from "../../persistence/repositories/scrape-job.repository";

@Injectable()
export class ScrapeScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(ScrapeScheduler.name);
  private running = false;

  constructor(
    private readonly scraperService: ScraperService,
    private readonly producer: ScrapeProducer,
    private readonly scrapeRunRepository: ScrapeRunRepository,
    private readonly scrapeJobRepository: ScrapeJobRepository,
  ) {}

  @Cron(env.scrapeCron)
  async handleCron(): Promise<void> {
    await this.startRun();
  }

  async onApplicationBootstrap(): Promise<void> {
    void this.startRun();
  }

  async startRun(): Promise<void> {
    if (this.running) {
      this.logger.warn("Skipping run: previous run is still being scheduled.");
      return;
    }

    this.running = true;
    try {
      const runId = randomUUID();
      const discoveredTotalPages = await this.scraperService.discoverTotalPages();
      const totalPages = Math.min(discoveredTotalPages, env.scrapeMaxPagesCap);
      const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

      await this.scrapeRunRepository.createRun(runId, totalPages);
      await this.scrapeJobRepository.createQueuedJobs(runId, pages);
      await this.producer.enqueuePages(runId, pages);

      await this.enqueueCatchUpPages(runId, totalPages);

      this.logger.log(
        `Scheduled run ${runId} with ${totalPages} pages (discovered=${discoveredTotalPages}).`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error while scheduling run";
      this.logger.error(message);
    } finally {
      this.running = false;
    }
  }

  private async enqueueCatchUpPages(
    runId: string,
    initialTotalPages: number,
  ): Promise<void> {
    const discoveredAfterQueue = await this.scraperService.discoverTotalPages();
    const cappedAfterQueue = Math.min(discoveredAfterQueue, env.scrapeMaxPagesCap);
    if (cappedAfterQueue <= initialTotalPages) {
      return;
    }

    const catchUpPages = Array.from(
      { length: cappedAfterQueue - initialTotalPages },
      (_, index) => initialTotalPages + index + 1,
    );

    await this.scrapeRunRepository.appendQueuedPages(runId, catchUpPages.length);
    await this.scrapeJobRepository.createQueuedJobs(runId, catchUpPages);
    await this.producer.enqueuePages(runId, catchUpPages);

    this.logger.log(
      `Run ${runId}: enqueued ${catchUpPages.length} catch-up pages (${initialTotalPages + 1}-${cappedAfterQueue}).`,
    );
  }
}
