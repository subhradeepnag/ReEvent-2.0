import 'newrelic'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { RFC2ExceptionFilter } from './common/filters/exception.filter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { LoggingService } from './common/services/logging.service'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: '*',
      credentials: true,
    },
  })

  app.useGlobalFilters(new RFC2ExceptionFilter())

  app.useGlobalPipes(new ValidationPipe())

  const logger = app.get(LoggingService)
  app.useLogger(logger)

  const config = new DocumentBuilder().setTitle('ReEvent').setDescription('API documentation for ReEvent').setVersion('1.0').addTag('ReEvent').build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/v1/swagger', app, document)

  await app.listen(8080)
}

bootstrap()
