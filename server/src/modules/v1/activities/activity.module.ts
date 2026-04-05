import { Module } from '@nestjs/common'
import * as controllers from './controllers'
import * as services from './services'
import { Activity, ActivityAttendee, ActivityRegistration } from './entities'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from '../accounts/entities'

@Module({
  imports: [SequelizeModule.forFeature([Activity, User, ActivityAttendee, ActivityRegistration])],
  controllers: [...Object.values(controllers)],
  providers: [...Object.values(services)],
})
export class ActivityModule {}
