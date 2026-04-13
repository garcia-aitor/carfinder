import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CarRecord } from "../../scraper/types";

@Injectable()
export class CarRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
