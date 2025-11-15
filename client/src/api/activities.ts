import { fetchClient } from './common/fetchClient'
import { Activity, ActivityFormValues } from '@/models'

export const ActivitiesService = {
  list: async (token?: string): Promise<Activity[]> => {
    return fetchClient('api/v1/activities', { token })
  },
  get: async (id: string, token?: string): Promise<Activity> => {
    return fetchClient(`api/v1/activities/${id}`, { token })
  },
  create: async (activity: ActivityFormValues, hostEmail: string, token?: string): Promise<void> => {
    return fetchClient('api/v1/activities', {
      method: 'POST',
      body: { ...activity, hostEmail },
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
    fetchClient(`api/v1/activities/${id}:attendees`, {
      method: 'POST',
      body: {
        userId,
      },
      token,
    }),
}
