import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ActivitiesService, PaymentService } from '../services'
import { Activity } from '../entities'
import { JoinActivityDto, VerifyPaymentDto, AddAttendeeDto } from '../dto'

@Controller('api/v1/activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get()
  findAll() {
    return this.activitiesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id)
  }

  @Post()
  create(@Body() activity: Activity) {
    return this.activitiesService.create(activity)
  }

  @Put(':id')
  edit(@Param('id') id: string, @Body() activity: Activity) {
    return this.activitiesService.edit(id, activity)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.activitiesService.delete(id)
  }

  @Post(':id/attendees')
  addAttendee(@Param('id') activityId: string, @Body() dto: AddAttendeeDto) {
    return this.activitiesService.addAttendee(activityId, dto)
  }

  @Get(':id/attendees')
  getAttendees(@Param('id') activityId: string) {
    return this.activitiesService.getAttendees(activityId)
  }

  @Delete(':id/attendees/:userId')
  removeAttendee(@Param('id') activityId: string, @Param('userId') userId: string) {
    return this.activitiesService.removeAttendee(activityId, userId)
  }

  // Endpoint for payment verification callback from client. Client will call this after receiving payment details from Razorpay and completing the payment on the frontend
  @Post('payment/verify')
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment(dto.orderId, dto.paymentId, dto.signature)
  }

  // Endpoint for client to call when user wants to join an activity. If the activity is paid, this will create a Razorpay order and return the order details to the client. If the activity is free, it will just create a registration with status FREE
  @Post(':id/join')
  join(@Param('id') activityId: string, @Body() dto: JoinActivityDto) {
    return this.paymentService.joinActivity(activityId, dto.userId)
  }

  // Endpoint for client to check the registration status of a user for a specific activity. This can be used by the frontend to show appropriate UI (e.g. "Join" button, "Payment pending" message, "Registered" status, etc.)
  @Get(':id/registration-status/:userId')
  registrationStatus(@Param('id') activityId: string, @Param('userId') userId: string) {
    return this.paymentService.getRegistrationStatus(activityId, userId)
  }
}
