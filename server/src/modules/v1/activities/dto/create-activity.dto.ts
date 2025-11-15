export class CreateActivityDto {
  title: string
  description: string
  date: Date
  category: string
  city: string
  venue: string
  isCancelled: boolean
  hostEmail: string
}
