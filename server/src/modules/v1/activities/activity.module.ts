import { Module } from '@nestjs/common'
import * as controllers from './controllers'
import * as services from './services'
import { Activity } from './entities'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from '../accounts/entities'
import { ActivityAttendee } from './entities/activity-attendee.entity'

@Module({
  imports: [SequelizeModule.forFeature([Activity, User, ActivityAttendee])],
  controllers: [...Object.values(controllers)],
  providers: [...Object.values(services)],
})
export class ActivityModule {}
