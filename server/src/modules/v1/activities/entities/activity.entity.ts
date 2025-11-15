import { Table, Column, Model, DataType, PrimaryKey, BelongsToMany } from 'sequelize-typescript'
import { User } from '../../accounts/entities'
import { ActivityAttendee } from './activity-attendee.entity'

@Table({ tableName: 'activities' })
export class Activity extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  id: string

  @Column(DataType.STRING)
  title: string

  @Column(DataType.STRING)
  description: string

  @Column(DataType.DATE)
  date: Date

  @Column(DataType.STRING)
  category: string

  @Column(DataType.STRING)
  city: string

  @Column(DataType.STRING)
  venue: string

  @Column(DataType.STRING)
  hostEmail: string

  @Column(DataType.BOOLEAN)
  isCancelled: boolean

  @BelongsToMany(() => User, () => ActivityAttendee)
  attendees: User[]
}
