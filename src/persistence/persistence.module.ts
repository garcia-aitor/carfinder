import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { CarRepository } from "./repositories/car.repository";
import { ScrapeRunRepository } from "./repositories/scrape-run.repository";
import { ScrapeJobRepository } from "./repositories/scrape-job.repository";

@Module({
  providers: [
    PrismaService,
    CarRepository,
    ScrapeRunRepository,
    ScrapeJobRepository,
  ],
  exports: [
    PrismaService,
    CarRepository,
    ScrapeRunRepository,
    ScrapeJobRepository,
  ],
})
export class PersistenceModule {}
