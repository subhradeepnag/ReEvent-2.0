import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript'
import { User } from '../../accounts/entities'
import { Activity } from '.'

@Table({ tableName: 'activity_attendees', timestamps: false })
export class ActivityAttendee extends Model {
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  user_id: number

  @ForeignKey(() => Activity)
  @Column(DataType.UUID)
  activity_id: string

  @Column(DataType.BOOLEAN)
  is_host: boolean

  @BelongsTo(() => User)
  user: User

  @BelongsTo(() => Activity)
  activity: Activity
}
