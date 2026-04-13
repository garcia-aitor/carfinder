import { Injectable } from "@nestjs/common";
import { Prisma, ScrapeRunStatus } from "@prisma/client";
import { env } from "../../config/env";
import { CarRepository } from "./car.repository";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ScrapeRunRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly carRepository: CarRepository,
  ) {}

  async createRun(runId: string, totalPages: number): Promise<void> {
    await this.prisma.scrapeRun.create({
      data: {
        id: runId,
        totalPages,
        queuedPages: totalPages,
        status: ScrapeRunStatus.RUNNING,
      },
    });
  }

  async appendQueuedPages(runId: string, pages: number): Promise<void> {
    if (pages <= 0) {
      return;
    }

    await this.prisma.scrapeRun.update({
      where: { id: runId },
      data: {
        totalPages: { increment: pages },
        queuedPages: { increment: pages },
      },
    });
  }

  async registerJobSuccess(runId: string): Promise<void> {
    await this.registerJobOutcome(runId, true);
  }

  async registerJobFailure(runId: string): Promise<void> {
    await this.registerJobOutcome(runId, false);
  }

  private async registerJobOutcome(runId: string, success: boolean): Promise<void> {
    const data: Prisma.ScrapeRunUpdateInput = {
      processedPages: { increment: 1 },
      successPages: success ? { increment: 1 } : undefined,
      failedPages: success ? undefined : { increment: 1 },
    };

    await this.prisma.scrapeRun.update({
      where: { id: runId },
      data,
    });

    const run = await this.prisma.scrapeRun.findUnique({
      where: { id: runId },
      select: {
        status: true,
        queuedPages: true,
        processedPages: true,
        failedPages: true,
      },
    });

    if (!run || run.status !== ScrapeRunStatus.RUNNING) {
      return;
    }

    if (run.processedPages < run.queuedPages) {
      return;
    }

    const finalStatus =
      run.failedPages > 0 ? ScrapeRunStatus.PARTIAL_FAILED : ScrapeRunStatus.COMPLETED;
    const closed = await this.prisma.scrapeRun.updateMany({
      where: {
        id: runId,
        status: ScrapeRunStatus.RUNNING,
      },
      data: {
        status: finalStatus,
        finishedAt: new Date(),
      },
    });

    if (closed.count === 1 && finalStatus === ScrapeRunStatus.COMPLETED) {
      await this.carRepository.reconcileAvailabilityForCompletedRun(
        runId,
        env.availabilityMissingRunsThreshold,
      );
    }
  }
}
