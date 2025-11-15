import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import * as services from './services'
import * as middlewares from './middlewares'

const allProviders = [...Object.values(services)]

@Global()
@Module({
  providers: allProviders,
  exports: allProviders,
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(middlewares.CorrelationMiddleware).forRoutes('*')
    consumer.apply(middlewares.LoggingMiddleware).forRoutes('*')
  }
}
