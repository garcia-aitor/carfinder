import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { env } from "../config/env";
import { SCRAPE_QUEUE } from "./queue.constants";
import { ScrapeProducer } from "./producer/scrape.producer";
import { ScrapeScheduler } from "./scheduler/scrape.scheduler";
import { ScrapeWorker } from "./worker/scrape.worker";
import { ScraperModule } from "../scraper/scraper.module";
import { PersistenceModule } from "../persistence/persistence.module";

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: env.redisUrl,
      },
    }),
    BullModule.registerQueue({
      name: SCRAPE_QUEUE,
    }),
    ScraperModule,
    PersistenceModule,
  ],
  providers: [ScrapeProducer, ScrapeScheduler, ScrapeWorker],
})
export class JobsModule {}
