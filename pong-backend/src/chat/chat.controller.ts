import { Controller, Get, Put, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor( private readonly chatService: ChatService)  {
  }

  // Return all rooms
  @Get('/rooms')
  async allRooms()
  {
    // Get the rooms from the service
    return await this.chatService.getAllRooms();
  }

  // Create a new room with a given name
  @UseGuards(JwtAuthGuard)
  @Put('/rooms/:name/')
  async createRoom(@Request() request, @Param('name') name: string)
  {
    // Create the room using the service
    console.log('here');
    console.log(request.user);
    return await this.chatService.createRoom(name, request.user.id);
  }

}
