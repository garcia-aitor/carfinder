import { Injectable } from "@nestjs/common";
import { Car, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CarRecord } from "../../scraper/types";
import { CarsSortBy, QueryCarsDto, SortOrder } from "../../cars/dto/query-cars.dto";

const BRAND_SEARCH_GROUPS = [
  ["toyota", "トヨタ"],
  ["nissan", "日産", "ニッサン"],
  ["honda", "ホンダ"],
  ["mazda", "マツダ"],
  ["subaru", "スバル"],
  ["mitsubishi", "三菱", "ミツビシ"],
  ["suzuki", "スズキ"],
  ["daihatsu", "ダイハツ"],
  ["lexus", "レクサス"],
  ["isuzu", "いすゞ", "イスズ"],
  [
    "mercedes-benz",
    "mercedes benz",
    "mercedes",
    "ベンツ",
    "メルセデス ベンツ",
    "メルセデス・ベンツ",
  ],
  ["bmw", "ＢＭＷ", "ビーエムダブリュー"],
  ["audi", "アウディ"],
  ["volkswagen", "vw", "フォルクスワーゲン"],
  ["porsche", "ポルシェ"],
  ["tesla", "テスラ"],
  ["ford", "フォード"],
  ["chevrolet", "シボレー"],
] as const;

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[・･·]/g, " ")
    .replace(/[-‐‑‒–—―]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function expandBrandSearchTerms(brand: string): string[] {
  const normalizedInput = normalizeSearchText(brand);
  if (!normalizedInput) {
    return [];
  }

  const terms = new Set([brand.trim()]);
  for (const group of BRAND_SEARCH_GROUPS) {
    const normalizedGroup = group.map(normalizeSearchText);
    const hasMatch = normalizedGroup.some(
      (alias) => alias.includes(normalizedInput) || normalizedInput.includes(alias),
    );

    if (hasMatch) {
      group.forEach((alias) => terms.add(alias));
    }
  }

  return [...terms].filter(Boolean);
}

function buildBrandContainsFilter(term: string): Prisma.CarWhereInput {
  return {
    brand: {
      contains: term,
      mode: Prisma.QueryMode.insensitive,
    },
  };
}

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
    const andFilters: Prisma.CarWhereInput[] = [];

    if (query.brand) {
      const brandSearchTerms = expandBrandSearchTerms(query.brand);

      andFilters.push({
        OR: brandSearchTerms.map((term) => buildBrandContainsFilter(term)),
      });
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

    if (andFilters.length > 0) {
      where.AND = andFilters;
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
