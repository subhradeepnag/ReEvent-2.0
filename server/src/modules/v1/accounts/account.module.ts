import { Module } from '@nestjs/common'
import * as controllers from './controllers'
import * as services from './services'
import { User } from './entities'
import { SequelizeModule } from '@nestjs/sequelize'
import { JwtService } from '@nestjs/jwt'

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [...Object.values(controllers)],
  providers: [...Object.values(services), JwtService],
})
export class AccountModule {}
