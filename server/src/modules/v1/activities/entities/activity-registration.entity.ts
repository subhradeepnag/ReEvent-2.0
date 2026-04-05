import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { Activity } from './activity.entity'
import { User } from '../../accounts/entities'

export enum RegistrationStatus {
  PENDING = 'PENDING', // Razorpay order created, awaiting payment
  CONFIRMED = 'CONFIRMED', // Payment verified ✅
  FREE = 'FREE', // Free activity, no payment needed
  FAILED = 'FAILED', // Payment failed
}

@Table({ tableName: 'activity_registrations' })
export class ActivityRegistration extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING, defaultValue: DataType.UUIDV4 })
  id: string

  @ForeignKey(() => Activity)
  @Column(DataType.STRING)
  activityId: string

  @BelongsTo(() => Activity)
  activity: Activity

  @ForeignKey(() => User)
  @Column(DataType.INTEGER) // ← was STRING, now INTEGER
  userId: number // ← was string, now number

  @BelongsTo(() => User)
  user: User

  @Column({
    type: DataType.ENUM(...Object.values(RegistrationStatus)),
    defaultValue: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus

  // Razorpay fields — null for free activities
  @Column({ type: DataType.STRING, allowNull: true })
  razorpayOrderId: string | null

  @Column({ type: DataType.STRING, allowNull: true })
  razorpayPaymentId: string | null

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  amountPaid: number | null

  @Column({ type: DataType.DATE, allowNull: true })
  paidAt: Date | null
}
