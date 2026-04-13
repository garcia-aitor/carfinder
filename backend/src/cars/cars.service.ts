import { Injectable, NotFoundException } from "@nestjs/common";
import { Car } from "@prisma/client";
import { CarRepository } from "../persistence/repositories/car.repository";
import { CarsListResponse, CarDetailResponse } from "./dto/cars-list.response";
import { QueryCarsDto } from "./dto/query-cars.dto";

@Injectable()
export class CarsService {
  constructor(private readonly carRepository: CarRepository) {}

  async listCars(query: QueryCarsDto): Promise<CarsListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await Promise.all([
      this.carRepository.findManyWithFilters(query),
      this.carRepository.countWithFilters(query),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getCarById(id: string): Promise<CarDetailResponse> {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new NotFoundException("Car not found");
    }

    return { data: car };
  }
}
