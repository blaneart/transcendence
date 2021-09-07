import { Injectable } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';
import { Room } from './chat.types';
import * as bcrypt from 'bcrypt';
import { response } from 'express';
// import { bcrypt }  from 'bcrypt-nodejs';

const saltRounds = 10;

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
    const rooms = await db('room')
      .join('users', 'users.id', '=', 'room.ownerID')
      .select('room.id', 'room.name', 'room.ownerID', 'room.restricted', 'users.name as owner_name');
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

  async findRoomByName(roomName: string): Promise<Room | null> {
    const room = await db('room').where({ name: roomName }).select('*');
    // Check if the corresponding rooms don't exist
    if (!room.length) {
      return null;
    }
    return room[0];
  }

  async joinRoomByID(userID: number, roomID: number) {

    // Ensure the user doesn't participate in another room
    await this.leaveAllRooms(userID);

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
      .select('message.id', 'message.message', 'users.name', 'users.id as senderID');
    return messages;
  }

  // Restrict a room with a password
  async restrictRoom(roomName: string, newPassword: string)
  {
    // Find the room
    const room = await this.findRoomByName(roomName);

    // Create a hash of the future password
    const hash = await bcrypt.hash(newPassword, saltRounds);

    // Restrict the room and save the hash to the database
    const response = await db('room').where({id: room.id}).update({restricted: true, hash: hash});
    return response[0];
  }

  // Check an attempt to login to a room
  async loginToRoom(roomName: string, attemptedPassword: string) : Promise<boolean>
  {
    // Find the room
    const room = await this.findRoomByName(roomName);

    // Compare the hash of the attempted password to the saved hash
    return await bcrypt.compare(attemptedPassword, room.hash);
  }

  // Check a password against a room's saved hash
  async checkPassword(room: Room, attemptedPassword: string) : Promise<boolean>
  {
    // Compare the hash of the attempted password to the saved hash
    return await bcrypt.compare(attemptedPassword, room.hash);
  }

  async checkUserJoined(room: Room, user_id: number): Promise<boolean>
  {
    // Find a corresponding participation entry
    const participation = await db('participants').where({roomID: room.id, userID: user_id}).select('*');

    // Ensure such entry exists
    if (!participation.length)
    {
      return false;
    }
    return true;
  }

  // Log user out of all rooms
  async leaveAllRooms(user_id: number)
  {
    // Remove all participation entries from our database
    const response = await db('participants').where({userID: user_id}).del();
    return response[0];
  }

  // Log all users out from a room
  async deleteAllParticipations(room: Room)
  {
    // Delete all participation entries linked to this room from our database
    const response = await db('participants').where({roomID: room.id}).del();
    return response[0];
  }

  // Get a room entry from our database
  async getRoom(roomName: string)
  {
    // Find a corresponding room
    const response = await db('room').where({ 'room.name': roomName})
      .join('users', 'users.id', '=', 'room.ownerID') // Join to users for username
      .select('room.id', 'room.name', 'room.ownerID', 'room.restricted', 'users.name as owner_name')
    return response[0];
  }

  // Add a block entry for a given pair of users
  async blockUser(blockerID: number, blockedID: number)
  {
    // Insert a block entry to the database
    const response = await db('blocklist').returning('*').insert({ blockerID: blockerID, blockedID: blockedID });
    return response[0];
  }

  // Get all block pairs from our database
  async getBlockList(blockerID: number)
  {
    // Get all corresponding block entries
    const response = await db('blocklist').where({blockerID: blockerID})
      .join('users', 'users.id', '=', 'blocklist.blockedID') // Join to users for username
      .select('blocklist.blockedID', 'users.name');
    return response;
  }
}
