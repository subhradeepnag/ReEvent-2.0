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
    allowNull: false,
  })
  password: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone: string

  @BelongsToMany(() => Activity, () => ActivityAttendee)
  activities: Activity[]
}
