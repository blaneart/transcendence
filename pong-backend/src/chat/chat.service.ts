import { Injectable } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';
import { Room } from './chat.types';

@Injectable()
export class ChatService {
  async createRoom(name: string, creatorId: number) {
    // Create a new room in the database
    const new_room = await db('room').returning('*').insert({ name: name, ownerID: creatorId });
    // Return the instance of the room
    return new_room[0];
  }

  // Delete a room
  async deleteRoom(roomID: number) {
    const response = await db('room').where({id: roomID}).del();
    return response;
  }

  async getAllRooms() {
    // Get all rooms in the database
    const rooms = await db('room').join('users', 'users.id', '=', 'room.ownerID').select('room.id', 'room.name', 'room.ownerID', 'users.name as owner_name');
    // Return all of the rooms
    return rooms;
  }

  //Find the id of the room in our database
  async findRoomId(roomName: string): Promise<number> {
    const room = await db('room').where({ name: roomName }).select('*');
    // Check if the corresponding rooms don't exist
    if (!room.length) {
      throw 'Room not found';
    }
    return room[0].id;
  }

  async findRoomByName(roomName: string): Promise<Room> {
    const room = await db('room').where({ name: roomName }).select('*');
    // Check if the corresponding rooms don't exist
    if (!room.length) {
      throw 'Room not found';
    }
    return room[0];
  }

  async joinRoomByID(userID: number, roomID: number) {
    // Create a new participation between the user and the room
    const new_participation = await db('participants')
      .returning('*')
      .insert({ userID: userID, roomID: roomID });
    // Return the created participation
    return new_participation[0];
  }

  async joinRoomByName(userID: number, roomName: string) {
    // Find the room ID by name
    const id = await this.findRoomId(roomName);
    // Join the room by the new-found ID
    return await this.joinRoomByID(userID, id);
  }

  async saveMessage(userID: number, roomID: number, text: string) {
    // Add a new message entry in the database
    const newMessage = await db('message').returning('*').insert({
      userID: userID,
      roomID: roomID,
      message: text,
    });
    // Return the newly created message
    return newMessage[0];
  }



  async sendMessage(userID: number, roomName: string, text: string) {
    // Add a new message entry in the database
    const roomID = await this.findRoomId(roomName);
    const newMessage = await db('message').returning('*').insert({
      userID: userID,
      roomID: roomID,
      message: text,
    });
    // Return the newly created message
    return newMessage[0];
  }

  // Get all messages sent to a given room up until now
  async getRoomMessages(roomName: string) {
    // Get the ID of the room
    const roomID = await this.findRoomId(roomName);
    // Return the messages populated with user names.
    const messages = await db('message').where({ roomID: roomID })
      .join('users', 'users.id', '=', 'message.userID')
      .select('message.id', 'message.message', 'users.name');
    return messages;
  }
}
