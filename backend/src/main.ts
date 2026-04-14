import "reflect-metadata";
import "dotenv/config";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { getQueueToken } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { AppModule } from "./app.module";
import { env } from "./config/env";
import { SCRAPE_QUEUE } from "./jobs/queue.constants";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn"],
  });
  app.enableCors({
    origin: ["https://carfinder-eta.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const queue = app.get<Queue>(getQueueToken(SCRAPE_QUEUE));
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(env.bullBoardPath);

  createBullBoard({
    queues: [new BullMQAdapter(queue)],
    serverAdapter,
  });

  app.use(env.bullBoardPath, serverAdapter.getRouter());
  await app.listen(env.appPort);

  Logger.log(
    `Scraper app started. Scheduler/workers running. Bull Board: http://localhost:${env.appPort}${env.bullBoardPath}`,
  );
}

void bootstrap();
