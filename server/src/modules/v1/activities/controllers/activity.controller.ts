import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ActivitiesService } from '../services'
import { Activity } from '../entities'
import { AddAttendeeDto } from '../dto/add-attendee.dto'

@Controller('api/v1/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

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
}
