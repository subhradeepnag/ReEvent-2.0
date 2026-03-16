export interface ActivityAttendee {
  user_id: number
  activity_id: string
  is_host: boolean
}

export interface Attendee {
  id: number
  email: string
  name: string
  phone: string
  createdAt: string
  updatedAt: string
  ActivityAttendee: ActivityAttendee
}