import { Controller, Get, Put, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor( private readonly chatService: ChatService)  {
  }

  @Get('/rooms')
  async allRooms()
  {
    return await this.chatService.getAllRooms();
  }

  @Put('/rooms/:name/')
  async createRoom(@Param('name') name: string)
  {
    return await this.chatService.createRoom(name);
  }

}
