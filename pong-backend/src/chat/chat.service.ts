import { Injectable } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

@Injectable()
export class ChatService {
  async createRoom(name: string) {
    // Create a new room in the database
    const new_room = await db('room').returning('*').insert({ name: name });
    // Return the instance of the room
    return new_room[0];
  }

  async getAllRooms() {
    // Get all rooms in the database
    const rooms = await db('room').select('*');
    // Return all of the rooms
    return rooms;
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
    const room = await db('rooms').where({ name: roomName }).select('*');
    // Check if the corresponding rooms don't exist
    if (!room.length) {
      throw 'Room not found';
    }
    // Join the room by the new-found ID
    return await this.joinRoomByID(userID, room[0].id);
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
}
