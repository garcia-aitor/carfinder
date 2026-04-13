import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ScraperModule } from "./scraper/scraper.module";
import { JobsModule } from "./jobs/jobs.module";
import { PersistenceModule } from "./persistence/persistence.module";
import { AuthModule } from "./auth/auth.module";
import { CarsModule } from "./cars/cars.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ScraperModule,
    PersistenceModule,
    JobsModule,
    AuthModule,
    CarsModule,
  ],
})
export class AppModule {}
