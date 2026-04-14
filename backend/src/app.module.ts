import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { JobsModule } from "./jobs/jobs.module";
import { PersistenceModule } from "./persistence/persistence.module";
import { AuthModule } from "./auth/auth.module";
import { CarsModule } from "./cars/cars.module";
import { env } from "./config/env";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PersistenceModule,
    ...(env.enableJobs ? [JobsModule] : []),
    AuthModule,
    CarsModule,
  ],
})
export class AppModule {}
