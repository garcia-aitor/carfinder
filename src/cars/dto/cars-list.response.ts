import { Car } from "@prisma/client";

export interface CarsListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CarsListResponse {
  data: Car[];
  meta: CarsListMeta;
}

export interface CarDetailResponse {
  data: Car;
}
