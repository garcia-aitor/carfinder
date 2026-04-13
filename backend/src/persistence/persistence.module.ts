import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { CarRepository } from "./repositories/car.repository";
import { ScrapeRunRepository } from "./repositories/scrape-run.repository";
import { ScrapeJobRepository } from "./repositories/scrape-job.repository";
import { UserRepository } from "./repositories/user.repository";

@Module({
  providers: [
    PrismaService,
    CarRepository,
    ScrapeRunRepository,
    ScrapeJobRepository,
    UserRepository,
  ],
  exports: [
    PrismaService,
    CarRepository,
    ScrapeRunRepository,
    ScrapeJobRepository,
    UserRepository,
  ],
})
export class PersistenceModule {}
