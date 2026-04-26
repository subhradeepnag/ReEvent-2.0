import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize-typescript'
import * as crypto from 'crypto'
import { Activity, ActivityAttendee, ActivityRegistration, RegistrationStatus } from '../entities'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay')

@Injectable()
export class PaymentService {
  private razorpay: typeof Razorpay | null = null

  constructor(
    @InjectModel(Activity)
    private activityModel: typeof Activity,

    @InjectModel(ActivityRegistration)
    private registrationModel: typeof ActivityRegistration,

    @InjectModel(ActivityAttendee)
    private attendeeModel: typeof ActivityAttendee,

    private sequelize: Sequelize,
  ) {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    }
  }

  private getRazorpay() {
    if (!this.razorpay) {
      throw new BadRequestException('Razorpay is not configured')
    }
    return this.razorpay
  }

  // User joins an activity — create Razorpay order if paid, else just create a free registration
  async joinActivity(activityId: string, userId: number) {
    const activity = await this.activityModel.findByPk(activityId, {
      include: [{ model: ActivityRegistration }],
    })
    if (!activity) throw new NotFoundException('Activity not found')
    if (activity.isCancelled) throw new BadRequestException('Activity is cancelled')

    // If maxAttendees is set, count confirmed+free registrations and compare with capacity. We allow overbooking since some people might fail to pay, but we want to prevent accepting too many paid registrations
    if (activity.maxAttendees) {
      const confirmed = await this.registrationModel.count({
        where: {
          activityId,
          status: [RegistrationStatus.CONFIRMED, RegistrationStatus.FREE], // FREE also counts towards capacity since they have a spot reserved, even if they didn't pay
        },
      })
      // If maxAttendees is set, we consider both CONFIRMED and FREE registrations towards capacity
      if (confirmed >= activity.maxAttendees) {
        throw new BadRequestException('Activity is full')
      }
    }

    // Check if user already has a registration (pending/confirmed/free)
    const existing = await this.registrationModel.findOne({
      where: {
        activityId,
        userId, // ← just userId now
        status: [RegistrationStatus.CONFIRMED, RegistrationStatus.FREE, RegistrationStatus.PENDING],
      },
    })

    if (existing) throw new BadRequestException('Already registered for this activity')

    // If activity is free, create a FREE registration immediately
    if (!activity.isPaid) {
      await this.sequelize.transaction(async (t) => {
        await this.registrationModel.create({ activityId, userId, status: RegistrationStatus.FREE, amountPaid: 0 }, { transaction: t })

        // Also add to attendees
        await this.attendeeModel.create({ user_id: userId, activity_id: activityId, is_host: false }, { transaction: t })
      })
      return { type: 'free' }
    }

    // For paid activities, create a Razorpay order and a PENDING registration
    const order = await this.getRazorpay().orders.create({
      amount: Math.round(Number(activity.price) * 100),
      currency: 'INR',
      receipt: `act_${activityId}_${userId}_${Date.now()}`,
      notes: {
        activityId,
        userId, // ← just userId now
        activityTitle: activity.title,
      },
    })

    // Create a pending registration with the Razorpay order ID
    const registration = await this.registrationModel.create({
      activityId,
      userId, // ← just userId now
      status: RegistrationStatus.PENDING,
      razorpayOrderId: order.id,
      amountPaid: activity.price,
    })

    // Return order details to the client for payment processing
    return {
      type: 'paid',
      registration,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        activityTitle: activity.title,
      },
    }
  }

  // Razorpay will send the payment details to the client, which will then call this endpoint to verify the payment
  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
    // 1. Verify HMAC — NEVER skip this
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex')

    if (expected !== signature) {
      throw new BadRequestException('Payment signature is invalid')
    }

    // 2. Find the pending registration
    const registration = await this.registrationModel.findOne({
      where: { razorpayOrderId, status: RegistrationStatus.PENDING },
    })
    if (!registration) throw new NotFoundException('Registration not found')

    // 3. Confirm atomically
    await this.sequelize.transaction(async (t) => {
      await registration.update(
        {
          status: RegistrationStatus.CONFIRMED,
          razorpayPaymentId,
          paidAt: new Date(),
        },
        { transaction: t },
      )

      // Also add to attendees
      await this.attendeeModel.create({ user_id: registration.userId, activity_id: registration.activityId, is_host: false }, { transaction: t })
    })

    return { success: true, registrationId: registration.id }
  }

  // Get registration status for a user on an activity
  async getRegistrationStatus(activityId: string, userId: string) {
    const registration = await this.registrationModel.findOne({
      where: { activityId, userId },
      order: [['createdAt', 'DESC']],
    })
    return registration ?? null
  }
}
