import { Controller, Get, Put, Param, Delete, UseGuards, Request, HttpException, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Room } from './chat.types';
import { WsException } from '@nestjs/websockets';
import { RoomNameDto } from './chat.dto';

@Controller('chat')
export class ChatController {
  constructor( private readonly chatService: ChatService)  {
  }

  // Return all rooms
  @UseGuards(JwtAuthGuard)
  @Get('/rooms')
  async allRooms(@Request() req)
  {
    // Get the rooms from the service
    return await this.chatService.getAllRooms(req.user.id);
  }

  // Create a new room with a given name
  @UseGuards(JwtAuthGuard)
  @Put('/rooms/:name/')
  async createRoom(@Request() request, @Param() param: RoomNameDto)
  {
    // Check if the room already exists
    const room = await this.chatService.getRoom(param.name);

    if (room)
      throw new HttpException("Room already exists", HttpStatus.CONFLICT);

    if (param.name.startsWith('direct'))
      throw new HttpException('Forbidden room name', HttpStatus.BAD_REQUEST)
    // Create the room using the service
    return await this.chatService.createRoom(param.name, request.user.id);
  }

  // Get the room instance
  @UseGuards(JwtAuthGuard)
  @Get('/rooms/:name/')
  async getRoom(@Request() request, @Param() param: RoomNameDto)
  {
    // Find the room
    const room = await this.chatService.getRoom(param.name);
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
  async deleteRoom(@Request() request, @Param() param: RoomNameDto)
  {
    // Find the room by name
    const room: Room = await this.chatService.findRoomByName(param.name);

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
  async blockUser(@Request() request, @Param('id', ParseIntPipe) id: number)
  {
    // Ensure the user is not blocking themselves
    if (request.user.id === id)
      throw new WsException("Can't block yourself");

    // If the person is already blocked, that's OK
    if (await this.chatService.isBlocked(request.user.id, id))
      return null;
    
      // Add a block to our database
    return await this.chatService.blockUser(request.user.id, id);
  }

  // Unblock a specific user
  @UseGuards(JwtAuthGuard)
  @Delete('/block/:id/')
  async unblockUser(@Request() request, @Param('id', ParseIntPipe) id: number)
  {
    // Ensure the user is not blocking themselves
    if (request.user.id === id)
      throw new WsException("Can't block yourself");
    
    // Remove a block from our database
    return await this.chatService.unblockUser(request.user.id, id);
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
  async getMuted(@Request() request, @Param() param: RoomNameDto)
  {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(param.name);

    // Ensure the room exists
    if (!room)
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);

    // Return the answer from our DB
    return await this.chatService.isMuted(request.user.id, room.id);
  }

  // Find out util when is the requesting user is muted in a given chat
  @UseGuards(JwtAuthGuard)
  @Get('/muted/:name/until/')
  async getMutedUntil(@Request() request, @Param() param: RoomNameDto)
  {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(param.name);

    // Ensure the room exists
    if (!room)
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);
    
    // Return the answer from our DB
    return await this.chatService.getMutedUntil(request.user.id, room.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admins/:name')
  async getAdmins(@Request() request, @Param() param: RoomNameDto)
  {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(param.name);

    // Ensure the room exists
    if (!room)
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);

    return await this.chatService.getAllAdmins(room.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admins/:name/me')
  async getAmAdmin(@Request() request, @Param() param: RoomNameDto)
  {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(param.name);

    // Ensure the room exists
    if (!room)
      throw new HttpException("Room not found", HttpStatus.NOT_FOUND);

    return await this.chatService.isAdmin(request.user.id, room.id);
  }

  // Get all direct conversations for the caller
  @UseGuards(JwtAuthGuard)
  @Get('/directs/me/')
  async getDirects(@Request() request)
  {
    return await this.chatService.getAllDirects(request.user.id);
  }

  // Create a direct conversation with a given user
  @UseGuards(JwtAuthGuard)
  @Put('/directs/:id/')
  async createDirect(@Request() request, @Param('id', ParseIntPipe) id: number)
  {
    if (await this.chatService.findDirect(request.user.id, id))
      throw new HttpException("Direct conversation with this user already exists.", HttpStatus.CONFLICT);
    return await this.chatService.createDirect(request.user.id, id);
  }

  // Remove a room from 'My rooms'
  @UseGuards(JwtAuthGuard)
  @Delete('/favs/:id/')
  async removeRoomFromFavs(@Request() request, @Param('id', ParseIntPipe) id: number)
  {
    await this.chatService.removeRoomFromFavs(id, request.user.id,);
  }

  // Remove a room from 'My rooms'
  @UseGuards(JwtAuthGuard)
  @Put('/favs/:id/')
  async addRoomToFavs(@Request() request, @Param('id', ParseIntPipe) id: number)
  {
    await this.chatService.addRoom(id, request.user.id);
  }


}
