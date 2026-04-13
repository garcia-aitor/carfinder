import { Module } from "@nestjs/common";
import { PersistenceModule } from "../persistence/persistence.module";
import { CarsController } from "./cars.controller";
import { CarsService } from "./cars.service";

@Module({
  imports: [PersistenceModule],
  controllers: [CarsController],
  providers: [CarsService],
})
export class CarsModule {}
