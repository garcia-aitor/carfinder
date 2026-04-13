import { Injectable } from "@nestjs/common";
import { ScrapeJobStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ScrapeJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createQueuedJobs(runId: string, pages: number[]): Promise<void> {
    await this.prisma.scrapeJob.createMany({
      data: pages.map((page) => ({
        runId,
        page,
        status: ScrapeJobStatus.QUEUED,
      })),
      skipDuplicates: true,
    });
  }

  async markProcessing(runId: string, page: number, attempt: number): Promise<void> {
    await this.prisma.scrapeJob.update({
      where: { runId_page: { runId, page } },
      data: {
        status: ScrapeJobStatus.PROCESSING,
        attempts: attempt,
        startedAt: new Date(),
      },
    });
  }

  async markSuccess(runId: string, page: number, carsCount: number): Promise<void> {
    await this.prisma.scrapeJob.update({
      where: { runId_page: { runId, page } },
      data: {
        status: ScrapeJobStatus.SUCCESS,
        carsCount,
        finishedAt: new Date(),
        lastError: null,
      },
    });
  }

  async markFailure(runId: string, page: number, error: string): Promise<void> {
    await this.prisma.scrapeJob.update({
      where: { runId_page: { runId, page } },
      data: {
        status: ScrapeJobStatus.FAILED,
        lastError: error,
        finishedAt: new Date(),
      },
    });
  }

  async markRetrying(
    runId: string,
    page: number,
    attempt: number,
    error: string,
  ): Promise<void> {
    await this.prisma.scrapeJob.update({
      where: { runId_page: { runId, page } },
      data: {
        status: ScrapeJobStatus.QUEUED,
        attempts: attempt,
        lastError: error,
      },
    });
  }
}
