import { Controller, Post, Body } from '@nestjs/common'
import { ChatService } from '../services'

@Controller('api/v1/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: { message: string }) {
    return this.chatService.sendMessage(body.message)
  }
}
