import { Module } from '@nestjs/common'
import * as controllers from './controllers'
import * as services from './services'
import { JwtService } from '@nestjs/jwt'

@Module({
  controllers: [...Object.values(controllers)],
  providers: [...Object.values(services), JwtService],
})
export class ChatModule {}
