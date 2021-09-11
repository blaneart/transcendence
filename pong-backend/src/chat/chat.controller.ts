import { Controller, Get, Put, Param, Delete, UseGuards, Request, HttpException, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Room } from './chat.types';
import { WsException } from '@nestjs/websockets';

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

  // Get the room instance
  @UseGuards(JwtAuthGuard)
  @Get('/rooms/:name/')
  async getRoom(@Request() request, @Param('name') name: string)
  {
    // Find the room
    const room = await this.chatService.getRoom(name);
    // Ensure the room exists
    if (!room)
    {
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);
    }
    return room;
  }

  // Delete a room
  @UseGuards(JwtAuthGuard)
  @Delete('/rooms/:name/')
  async deleteRoom(@Request() request, @Param('name') name: string)
  {
    // Find the room by name
    const room: Room = await this.chatService.findRoomByName(name);

    // Ensure the room exists (existed?)
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

  // Block messages from a specific user
  @UseGuards(JwtAuthGuard)
  @Put('/block/:id/')
  async blockUser(@Request() request, @Param('id') id: number)
  {
    // Ensure the user is not blocking themselves
    if (request.user.id === id)
      throw new WsException("Can't block yourself");
    
      // Add a block to our database
    return await this.chatService.blockUser(request.user.id, id);
  }

  // Get a list of blocked users (to block them on frontend)
  @UseGuards(JwtAuthGuard)
  @Get('/block/')
  async getBlockList(@Request() request)
  {
    // Get block entries from database
    return await this.chatService.getBlockList(request.user.id);
  }

  // Find out if the requesting user is muted in a given chat
  @UseGuards(JwtAuthGuard)
  @Get('/muted/:name/')
  async getMuted(@Request() request, @Param('name') name: string)
  {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(name);

    // Ensure the room exists
    if (!room)
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);

    // Return the answer from our DB
    return await this.chatService.isMuted(request.user.id, room.id);
  }

  // Find out util when is the requesting user is muted in a given chat
  @UseGuards(JwtAuthGuard)
  @Get('/muted/:name/until/')
  async getMutedUntil(@Request() request, @Param('name') name: string)
  {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(name);

    // Ensure the room exists
    if (!room)
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);
    
    // Return the answer from our DB
    return await this.chatService.getMutedUntil(request.user.id, room.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admins/:name')
  async getAdmins(@Request() request, @Param('name') name: string)
  {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(name);

    // Ensure the room exists
    if (!room)
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);

    return await this.chatService.getAllAdmins(room.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admins/:name/me')
  async getAmAdmin(@Request() request, @Param('name') name: string)
  {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(name);

    // Ensure the room exists
    if (!room)
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);

    return await this.chatService.isAdmin(request.user.id, room.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/directs/me/')
  async getDirects(@Request() request)
  {
    return await this.chatService.getAllDirects(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/directs/:id/')
  async createDirect(@Request() request, @Param('id') id: number)
  {
    return await this.chatService.createDirect(request.user.id, id);
  }

}
