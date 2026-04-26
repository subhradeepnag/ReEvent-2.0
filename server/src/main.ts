import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
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

  app.useGlobalPipes(new ValidationPipe())

  const config = new DocumentBuilder().setTitle('ReEvent').setDescription('API documentation for ReEvent').setVersion('1.0').addTag('ReEvent').build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/swagger', app, document)

  await app.listen(8080)
}

bootstrap()
