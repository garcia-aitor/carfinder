import { Injectable } from "@nestjs/common";
import { Car, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CarRecord } from "../../scraper/types";
import { CarsSortBy, QueryCarsDto, SortOrder } from "../../cars/dto/query-cars.dto";

@Injectable()
export class CarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyWithFilters(query: QueryCarsDto): Promise<Car[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    return this.prisma.car.findMany({
      where: this.buildWhere(query),
      orderBy: this.buildOrderBy(query),
      skip,
      take: limit,
    });
  }

  countWithFilters(query: QueryCarsDto): Promise<number> {
    return this.prisma.car.count({
      where: this.buildWhere(query),
    });
  }

  findById(id: string): Promise<Car | null> {
    return this.prisma.car.findUnique({
      where: { id },
    });
  }

  async upsertMany(cars: CarRecord[], runId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction(
      cars.map((car, index) => {
        const listingUrl =
          car.listingUrl ?? `fallback:${car.id ?? "unknown"}:${now.getTime()}:${index}`;
        return this.prisma.car.upsert({
          where: {
            listingUrl,
          },
          create: {
            listingUrl,
            externalId: car.id,
            brand: car.brand,
            fullTitle: car.fullTitle,
            model: car.model,
            year: car.year,
            color: car.color,
            mileageKm: car.mileageKm,
            priceYen: car.priceYen,
            engineCc: car.engineCc,
            sellerName: car.sellerName,
            sellerUrl: car.sellerUrl,
            mainPhotoUrl: car.mainPhotoUrl,
            photoUrls: car.photoUrls,
            raw: car.raw,
            firstSeenAt: now,
            lastSeenRunId: runId,
            isAvailable: true,
            missingRuns: 0,
            disappearedAt: null,
          },
          update: {
            externalId: car.id,
            brand: car.brand,
            fullTitle: car.fullTitle,
            model: car.model,
            year: car.year,
            color: car.color,
            mileageKm: car.mileageKm,
            priceYen: car.priceYen,
            engineCc: car.engineCc,
            sellerName: car.sellerName,
            sellerUrl: car.sellerUrl,
            mainPhotoUrl: car.mainPhotoUrl,
            photoUrls: car.photoUrls,
            raw: car.raw,
            lastSeenRunId: runId,
            isAvailable: true,
            missingRuns: 0,
            disappearedAt: null,
            lastSeenAt: now,
          },
        });
      }),
    );
  }

  async reconcileAvailabilityForCompletedRun(
    runId: string,
    missingRunsThreshold: number,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "Car"
      SET
        "missingRuns" = CASE
          WHEN "lastSeenRunId" IS DISTINCT FROM ${runId} THEN "missingRuns" + 1
          ELSE "missingRuns"
        END,
        "isAvailable" = CASE
          WHEN "lastSeenRunId" IS DISTINCT FROM ${runId}
            AND "missingRuns" + 1 >= ${missingRunsThreshold}
            THEN FALSE
          ELSE "isAvailable"
        END,
        "disappearedAt" = CASE
          WHEN "lastSeenRunId" IS DISTINCT FROM ${runId}
            AND "missingRuns" + 1 >= ${missingRunsThreshold}
            THEN NOW()
          WHEN "lastSeenRunId" = ${runId}
            THEN NULL
          ELSE "disappearedAt"
        END
      WHERE "lastSeenRunId" IS DISTINCT FROM ${runId};
    `;
  }

  private buildWhere(query: QueryCarsDto): Prisma.CarWhereInput {
    const where: Prisma.CarWhereInput = {};

    if (query.brand) {
      where.brand = {
        contains: query.brand,
        mode: Prisma.QueryMode.insensitive,
      };
    }
    if (query.model) {
      where.model = {
        contains: query.model,
        mode: Prisma.QueryMode.insensitive,
      };
    }
    if (query.isAvailable !== undefined) {
      where.isAvailable = query.isAvailable;
    }

    if (query.yearFrom !== undefined || query.yearTo !== undefined) {
      where.year = {};
      if (query.yearFrom !== undefined) {
        where.year.gte = query.yearFrom;
      }
      if (query.yearTo !== undefined) {
        where.year.lte = query.yearTo;
      }
    }

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      where.priceYen = {};
      if (query.priceMin !== undefined) {
        where.priceYen.gte = query.priceMin;
      }
      if (query.priceMax !== undefined) {
        where.priceYen.lte = query.priceMax;
      }
    }

    if (query.mileageMin !== undefined || query.mileageMax !== undefined) {
      where.mileageKm = {};
      if (query.mileageMin !== undefined) {
        where.mileageKm.gte = query.mileageMin;
      }
      if (query.mileageMax !== undefined) {
        where.mileageKm.lte = query.mileageMax;
      }
    }

    return where;
  }

  private buildOrderBy(query: QueryCarsDto): Prisma.CarOrderByWithRelationInput {
    const sortBy = query.sortBy ?? CarsSortBy.CREATED_AT;
    const sortOrder: Prisma.SortOrder =
      (query.sortOrder ?? SortOrder.DESC) === SortOrder.ASC ? "asc" : "desc";

    const allowedSortFields: Record<CarsSortBy, Prisma.CarOrderByWithRelationInput> =
      {
        [CarsSortBy.PRICE_YEN]: { priceYen: sortOrder },
        [CarsSortBy.MILEAGE_KM]: { mileageKm: sortOrder },
        [CarsSortBy.YEAR]: { year: sortOrder },
        [CarsSortBy.CREATED_AT]: { createdAt: sortOrder },
      };

    return allowedSortFields[sortBy] ?? { createdAt: "desc" };
  }
}
