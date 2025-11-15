import { Module } from '@nestjs/common'
import { HealthcheckModule } from './healthcheck'
import { ActivityModule } from './activities'
import { AccountModule } from './accounts'

@Module({
  imports: [HealthcheckModule, ActivityModule, AccountModule],
})
export class V1Module {}
