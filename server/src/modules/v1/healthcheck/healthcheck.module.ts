import { Module } from '@nestjs/common'
import * as services from './services'
import * as controllers from './controllers'

@Module({
  imports: [],
  controllers: [...Object.values(controllers)],
  providers: [...Object.values(services)],
})
export class HealthcheckModule {}
