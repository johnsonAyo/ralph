import "reflect-metadata";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";
import { AppLoggerService } from "@/common/logging/app-logger.service";
import { AppExceptionFilter } from "@/common/filters/app-exception.filter";


const localWebOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

async function bootstrap() {
  const logger = new AppLoggerService();
  const app = await NestFactory.create(AppModule, { logger });
  
  app.useGlobalFilters(new AppExceptionFilter());

  const config = app.get(ConfigService);
  const configuredWebOrigin = config.get<string>("WEB_ORIGIN");

  app.enableCors({
    origin: configuredWebOrigin ?? localWebOrigins,
    credentials: true,
  });

  const port = config.get<number>("PORT") ?? 4000;
  await app.listen(port);
}

void bootstrap();

