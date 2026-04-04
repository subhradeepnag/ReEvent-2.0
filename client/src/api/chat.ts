import { fetchClient } from './common/fetchClient'

export interface ChatResponse {
  reply: string;
}

export const ChatService = {
  sendMessage: async (message: string, token?: string): Promise<ChatResponse> => {
    return fetchClient('api/v1/chats', {
      token,
      method: 'POST',
      body: { message },
    })
  },
}
