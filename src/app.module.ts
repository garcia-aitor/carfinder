import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ScraperModule } from "./scraper/scraper.module";
import { JobsModule } from "./jobs/jobs.module";
import { PersistenceModule } from "./persistence/persistence.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ScraperModule,
    PersistenceModule,
    JobsModule,
  ],
})
export class AppModule {}
