import { Module } from '@nestjs/common'
import { HealthcheckModule } from './healthcheck'
import { ActivityModule } from './activities'
import { AccountModule } from './accounts'
import { ChatModule } from './chat'

@Module({
  imports: [HealthcheckModule, ActivityModule, AccountModule, ChatModule],
})
export class V1Module {}
