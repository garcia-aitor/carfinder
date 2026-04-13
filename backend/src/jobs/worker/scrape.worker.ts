import { Injectable, Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { env } from "../../config/env";
import { CarRepository } from "../../persistence/repositories/car.repository";
import { ScrapeJobRepository } from "../../persistence/repositories/scrape-job.repository";
import { ScrapeRunRepository } from "../../persistence/repositories/scrape-run.repository";
import { ScraperService } from "../../scraper/scraper.service";
import { ScrapePageJob } from "../dto/scrape-page.job";
import { SCRAPE_PAGE_JOB, SCRAPE_QUEUE } from "../queue.constants";

@Injectable()
@Processor(SCRAPE_QUEUE, { concurrency: env.workerConcurrency })
export class ScrapeWorker extends WorkerHost {
  private readonly logger = new Logger(ScrapeWorker.name);

  constructor(
    private readonly scraperService: ScraperService,
    private readonly carRepository: CarRepository,
    private readonly scrapeJobRepository: ScrapeJobRepository,
    private readonly scrapeRunRepository: ScrapeRunRepository,
  ) {
    super();
  }

  async process(job: Job<ScrapePageJob>): Promise<void> {
    if (job.name !== SCRAPE_PAGE_JOB) {
      return;
    }

    const { runId, page } = job.data;
    const attempt = job.attemptsMade + 1;

    await this.scrapeJobRepository.markProcessing(runId, page, attempt);

    try {
      const cars = await this.scraperService.scrapePage(page);
      if (cars.length > 0) {
        await this.carRepository.upsertMany(cars, runId);
      }

      await this.scrapeJobRepository.markSuccess(runId, page, cars.length);
      await this.scrapeRunRepository.registerJobSuccess(runId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      const maxAttempts = job.opts.attempts ?? 1;
      const willRetry = attempt < maxAttempts;

      if (willRetry) {
        await this.scrapeJobRepository.markRetrying(runId, page, attempt, message);
      } else {
        await this.scrapeJobRepository.markFailure(runId, page, message);
        await this.scrapeRunRepository.registerJobFailure(runId);
      }

      this.logger.error(
        `Run ${runId} page ${page} failed (attempt ${attempt}/${maxAttempts}): ${message}`,
      );
      throw error;
    }
  }
}
