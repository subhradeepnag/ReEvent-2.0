import { fetchClient } from './common/fetchClient'
import { Activity, ActivityFormValues, ActivityRegistration, Attendee, JoinActivityResponse, VerifyPaymentResponse } from '@/models'

export const ActivitiesService = {
  list: async (token?: string): Promise<Activity[]> => {
    return fetchClient('api/v1/activities', { token })
  },
  get: async (id: string, token?: string): Promise<Activity> => {
    return fetchClient(`api/v1/activities/${id}`, { token })
  },
  create: async (activity: ActivityFormValues, hostEmail: string, hostName: string, token?: string): Promise<void> => {
    return fetchClient('api/v1/activities', {
      method: 'POST',
      body: { ...activity, hostEmail, hostName },
      token,
    })
  },
  update: async (activity: ActivityFormValues, id: string | undefined, token?: string): Promise<void> => {
    return fetchClient(`api/v1/activities/${id}`, {
      method: 'PUT',
      body: activity,
      token,
    })
  },
  remove: async (id: string, token?: string): Promise<void> => {
    return fetchClient(`api/v1/activities/${id}`, {
      method: 'DELETE',
      token,
    })
  },
  attend: async (id: string, userId: number | undefined, token?: string): Promise<void> =>
    fetchClient(`api/v1/activities/${id}/attendees`, {
      method: 'POST',
      body: {
        userId,
      },
      token,
    }),
  getAttendees: async (id: string, token?: string): Promise<Attendee[]> => {
    return fetchClient(`api/v1/activities/${id}/attendees`, { token })
  },
  removeAttendee: async (id: string, userId: string, token?: string): Promise<Attendee[]> => {
    return fetchClient(`api/v1/activities/${id}/attendees/${userId}`, {
      method: 'DELETE',
      token,
    })
  },
  joinActivity: async (activityId: string, userId: number | undefined, token?: string): Promise<JoinActivityResponse> => {
    return fetchClient(`api/v1/activities/${activityId}/join`, {
      method: 'POST',
      body: {
        userId,
      },
      token,
    })
  },
  verifyPayment: async (orderId: string, paymentId: string, signature: string, token?: string): Promise<VerifyPaymentResponse> => {
    return fetchClient(`api/v1/activities/payment/verify`, {
      method: 'POST',
      body: {
        orderId,
        paymentId,
        signature,
      },
      token,
    })
  },
  getRegistrationStatus: async (activityId: string, userId: number | undefined, token?: string): Promise<ActivityRegistration | null> => {
    return fetchClient(`api/v1/activities/${activityId}/registration-status/${userId}`, {
      token,
    })
  },
}
