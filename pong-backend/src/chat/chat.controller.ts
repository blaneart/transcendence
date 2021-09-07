import { Controller, Get, Put, Param, Delete, UseGuards, Request, HttpException, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Room } from './chat.types';
import { request } from 'express';

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
    return await this.chatService.createRoom(name, request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/rooms/:name/')
  async getRoom(@Request() request, @Param('name') name: string)
  {
    const room = await this.chatService.getRoom(name);
    if (!room)
    {
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);
    }
    return room;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/rooms/:name/')
  async deleteRoom(@Request() request, @Param('name') name: string)
  {
    // Find the room by name
    const room: Room = await this.chatService.findRoomByName(name);

    if (!room)
    {
      throw new HttpException("Room not found", HttpStatus.BAD_REQUEST);
    }

    // Make sure the user owns this room and can delete it
    if (room.ownerID != request.user.id)
    {
      throw new HttpException("You don't have rights to delete this room", HttpStatus.FORBIDDEN);
    }

    // Actually delete the room
    return await this.chatService.deleteRoom(room.id);
  }

}
