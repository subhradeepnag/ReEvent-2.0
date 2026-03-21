import { fetchClient } from './common/fetchClient'

interface Login {
  access_token: string
}

interface Signup {
  access_token: string
}

interface Profile {
  id: number
  email: string
  name: string
  phone: string
}

export const AccountsService = {
  signup: async ({ name, phone, email, password }: { name: string; phone: string; email: string; password: string }): Promise<Signup> => {
    return fetchClient('api/v1/accounts/signup', {
      method: 'POST',
      body: { name, phone, email, password },
    })
  },

  login: async (email: string, password: string): Promise<Login> => {
    return fetchClient('api/v1/accounts/login', {
      method: 'POST',
      body: { email, password },
    })
  },

  getProfile: async (token: string): Promise<Profile> => {
    return fetchClient('api/v1/accounts/profile', {
      token,
    })
  },
  googleLogin: async (idToken: string): Promise<Signup> => {
    return fetchClient('api/v1/accounts/google', {
      method: 'POST',
      body: { token: idToken },
    })
  },
}
