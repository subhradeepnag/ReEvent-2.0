import { Table, Column, Model, DataType, Unique, PrimaryKey, AutoIncrement, BelongsToMany } from 'sequelize-typescript'
import { ActivityAttendee } from '../../activities/entities/activity-attendee.entity'
import { Activity } from '../../activities/entities'

@Table({ tableName: 'users' })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password: string

  @Column({ allowNull: true })
  avatar: string

  @Column({ defaultValue: false })
  isGoogleUser: boolean

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string

  @BelongsToMany(() => Activity, () => ActivityAttendee)
  activities: Activity[]
}
