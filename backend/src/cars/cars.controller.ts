import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CarDetailResponse, CarsListResponse } from "./dto/cars-list.response";
import { QueryCarsDto } from "./dto/query-cars.dto";
import { CarsService } from "./cars.service";

@Controller("cars")
@UseGuards(JwtAuthGuard)
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  listCars(@Query() query: QueryCarsDto): Promise<CarsListResponse> {
    return this.carsService.listCars(query);
  }

  @Get(":id")
  getCarById(@Param("id") id: string): Promise<CarDetailResponse> {
    return this.carsService.getCarById(id);
  }
}
