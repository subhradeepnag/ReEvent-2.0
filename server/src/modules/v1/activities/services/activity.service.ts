import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Activity } from '../entities'
import { v4 as uuidv4 } from 'uuid'
import { AddAttendeeDto } from '../dto/add-attendee.dto'
import { User } from '../../accounts/entities'
import { ActivityAttendee } from '../entities/activity-attendee.entity'

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity) private readonly activityModel: typeof Activity,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(ActivityAttendee) private activityAttendeeModel: typeof ActivityAttendee,
  ) {}

  findAll(): Promise<Activity[]> {
    return this.activityModel.findAll()
  }

  findOne(id: string): Promise<Activity> {
    return this.activityModel.findByPk(id)
  }

  create(activity: Partial<Activity>): Promise<Activity> {
    activity.id = uuidv4()
    return this.activityModel.create(activity)
  }

  edit(id: string, activity: Activity): Promise<[number, Activity[]]> {
    return this.activityModel.update(activity, {
      where: { id },
      returning: true,
    })
  }

  delete(id: string): void {
    this.activityModel.destroy({
      where: {
        id: id,
      },
    })
  }

  async addAttendee(activityId: string, dto: AddAttendeeDto) {
    const activity = await this.activityModel.findByPk(activityId)
    if (!activity) throw new NotFoundException('Activity not found')
    const user = await this.userModel.findByPk(dto.userId)
    if (!user) throw new NotFoundException('User not found')

    return this.activityAttendeeModel.create({
      activity_id: activityId,
      user_id: dto.userId,
      is_host: dto.isHost ?? false,
    })
  }

  async getAttendees(activityId: string) {
    const activity = await this.activityModel.findByPk(activityId, {
      include: [
        {
          model: User,
          attributes: { exclude: ['password'] },
        },
      ],
    })

    if (!activity) throw new NotFoundException('Activity not found')

    return activity.attendees
  }

  async removeAttendee(activityId: string, userId: string) {
    const deleted = await this.activityAttendeeModel.destroy({
      where: {
        activity_id: activityId,
        user_id: userId,
      },
    })

    if (!deleted) {
      throw new NotFoundException('Attendee not found for this activity')
    }

    return { message: 'Attendee removed' }
  }
}
