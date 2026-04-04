import { Injectable } from '@nestjs/common'
import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'http://localhost:11434' })

@Injectable()
export class ChatService {
  async sendMessage(message: string) {
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: message }],
    })
    return { reply: response.message.content }
  }
}
