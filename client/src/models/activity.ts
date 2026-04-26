interface User {
  displayName: string
  image: string
}

interface Attendee extends User {
  username: string
}

export interface Activity {
  id: string
  title: string
  date: Date
  venue: string
  imageUrl: string
  host: User
  hostEmail: string
  hostName: string
  description: string
  category: string
  city: string
  isCancelled: boolean
  isHost: boolean
  isGoing: boolean
  attendees: Attendee[]
  isPaid: boolean
  price: number
  maxAttendees: number | null
}

export interface ActivityFormValues {
  id?: string
  title: string
  date: string | null
  description: string
}
