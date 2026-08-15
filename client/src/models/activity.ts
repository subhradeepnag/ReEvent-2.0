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

// The payload sent to the create/update endpoints — price and maxAttendees are coerced from
// the form's string inputs before submitting, so the server always receives real numbers
export interface ActivityFormValues {
  id?: string
  title: string
  description: string
  category: string
  date: string | null
  city: string
  venue: string
  imageUrl: string
  isPaid: boolean
  price: number
  maxAttendees: number | null
}
