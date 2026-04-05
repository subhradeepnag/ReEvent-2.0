import { Table, Column, Model, DataType, PrimaryKey, BelongsToMany, HasMany } from 'sequelize-typescript'
import { User } from '../../accounts/entities'
import { ActivityAttendee } from './activity-attendee.entity'
import { ActivityRegistration } from './activity-registration.entity'

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

  @Column(DataType.TEXT)
  imageUrl: string

  @Column(DataType.STRING)
  hostEmail: string

  @Column(DataType.STRING)
  hostName: string

  @Column(DataType.BOOLEAN)
  isCancelled: boolean

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isPaid: boolean

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  price: number

  @Column({ type: DataType.INTEGER, allowNull: true })
  maxAttendees: number | null // null = unlimited

  @BelongsToMany(() => User, () => ActivityAttendee)
  attendees: User[]

  @HasMany(() => ActivityRegistration)
  registrations: ActivityRegistration[]
}
