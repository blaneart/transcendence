import { ChatMessageType, ChatMessageUpdate, DirectMessageUpdate } from './chat.types';
import { UserPublic } from 'src/app.types';
import { Injectable } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';
import { Room, Direct } from './chat.types';
import * as bcrypt from 'bcrypt';


const saltRounds = 10;

@Injectable()
export class ChatService {
  async createRoom(name: string, creatorId: number) {
    // Create a new room in the database
    const new_room = await db('room').returning('*').insert({ name: name, ownerID: creatorId });

    // Add new room to favourites
    await db('my_rooms')
      .returning('*')
      .insert({ userID: creatorId, roomID: new_room[0].id });
    // Return the instance of the room
    return new_room[0];
  }

  // Delete a room
  async deleteRoom(roomID: number) {
    const response = await db('room').where({ id: roomID }).del();
    return response;
  }

  async getAllRooms(userID: number) {
    // Get all rooms in the database
    const rooms = await db('room')
      .join('users', 'users.id', '=', 'room.ownerID')
      .leftJoin('my_rooms', function () {
        this.on('my_rooms.roomID', '=', 'room.id')
          .andOn('my_rooms.userID', '=', userID)
      })
      .select('room.id', 'room.name', 'room.ownerID', 'room.restricted', 'users.name as owner_name', 'my_rooms.userID as fav');
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

    // Add the room to favourites
    await db('my_rooms')
      .insert({ userID: userID, roomID: roomID })
      .onConflict(['userID', 'roomID'])
      .ignore();
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

  async sendMessage(userID: number, roomName: string, text: string, type: ChatMessageType = ChatMessageType.TEXT, receiverId: number | null = null, gameRoomName: string | null = null) {
    // Add a new message entry in the database
    const roomID = await this.findRoomId(roomName);
    const newMessage = await db('message').returning('*').insert({
      userID: userID,
      roomID: roomID,
      message: text,
      receiverId: receiverId,
      type: type,
      roomName: gameRoomName
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
      .select('message.id', 'message.message', 'message.type', 'message.receiverId', 'message.roomName',
        'users.name', 'users.id as senderID', 'users.id42', 'users.avatar', 'users.realAvatar', 'users.owner', 'users.banned', 'users.banned');
    return messages;
  }

  // Get all the messages from the database and transform them to ChatMessageUpdates
  async getRoomMessageUpdates(roomName: string) {
    // Get the messages from the backend
    const messages = await this.getRoomMessages(roomName);
    // Transform them
    const messageUpdates: ChatMessageUpdate[] = messages.map((message) => {
      // Get the user information from the database response
      const senderObject: UserPublic = {
        id: message.senderID,
        name: message.name,
        id42: message.id42,
        avatar: message.avatar,
        elo: message.elo,
        realAvatar: message.realAvatar,
        owner: message.owner,
        banned: message.banned,
        admin: message.admin,
      }
      // Construct the final object
      const messageObject: ChatMessageUpdate = {
        id: message.id,
        name: message.name,
        message: message.message,
        senderID: message.senderID,
        sender: senderObject,
        type: message.type,
        receiverId: message.receiverId,
        roomName: message.roomName
      }
      return messageObject;
    })
    return messageUpdates;
  }

  // Restrict a room with a password
  async restrictRoom(roomName: string, newPassword: string) {
    // Find the room
    const room = await this.findRoomByName(roomName);

    // Create a hash of the future password
    const hash = await bcrypt.hash(newPassword, saltRounds);

    // Restrict the room and save the hash to the database
    const response = await db('room').returning('*').where({ id: room.id }).update({ restricted: true, hash: hash });
    return response[0];
  }

  // Unrestrict a room
  async unrestrictRoom(roomName: string) {
    // Find the room
    const room = await this.findRoomByName(roomName);

    // Unrestrict the room
    const response = await db('room').returning('*').where({ id: room.id }).update({ restricted: false });
    return response[0];
  }

  // Check an attempt to login to a room
  async loginToRoom(roomName: string, attemptedPassword: string): Promise<boolean> {
    // Find the room
    const room = await this.findRoomByName(roomName);

    // Compare the hash of the attempted password to the saved hash
    return await bcrypt.compare(attemptedPassword, room.hash);
  }

  // Check a password against a room's saved hash
  async checkPassword(room: Room, attemptedPassword: string): Promise<boolean> {
    // Compare the hash of the attempted password to the saved hash
    return await bcrypt.compare(attemptedPassword, room.hash);
  }

  async checkUserJoined(room: Room, user_id: number): Promise<boolean> {
    // Find a corresponding participation entry
    const participation = await db('participants').where({ roomID: room.id, userID: user_id }).select('*');

    // Ensure such entry exists
    if (!participation.length) {
      return false;
    }
    return true;
  }

  // Log user out of all rooms
  async leaveAllRooms(user_id: number) {
    // Remove all participation entries from our database
    const response = await db('participants').where({ userID: user_id }).del();
    return response[0];
  }

  // Log all users out from a room
  async deleteAllParticipations(room: Room) {
    // Delete all participation entries linked to this room from our database
    const response = await db('participants').where({ roomID: room.id }).del();
    return response[0];
  }

  // Get a room entry from our database
  async getRoom(roomName: string) {
    // Find a corresponding room
    const response = await db('room').where({ 'room.name': roomName })
      .join('users', 'users.id', '=', 'room.ownerID') // Join to users for username
      .select('room.id', 'room.name', 'room.ownerID', 'room.restricted', 'users.name as owner_name')
    return response[0];
  }

  // Add a block entry for a given pair of users
  async blockUser(blockerID: number, blockedID: number) {
    // Insert a block entry to the database
    const response = await db('blocklist').returning('*').insert({ blockerID: blockerID, blockedID: blockedID });
    return response[0];
  }

  // Remove a block entry for a given pair of users
  async unblockUser(blockerID: number, blockedID: number) {
    // Insert a block entry to the database
    const response = await db('blocklist').where({ blockerID: blockerID, blockedID: blockedID }).delete();
    return response[0];
  }

  async isBlocked(blockerID: number, blockedID: number) 
  {
    const response = await db('blocklist').where({ blockerID: blockerID, blockedID: blockedID }).select('id');
    return response.length;
  }

  // Get all block pairs from our database
  async getBlockList(blockerID: number) {
    // Get all corresponding block entries
    const response = await db('blocklist').where({ blockerID: blockerID })
      .join('users', 'users.id', '=', 'blocklist.blockedID') // Join to users for username
      .select('blocklist.blockedID', 'users.name');
    return response;
  }

  // Ban a user in a given room
  async banUser(userId: number, roomId: number, minutes: number) {
    // Calculate the ban end date
    const now = new Date();
    const banEnd = new Date(now.getTime() + minutes * 1000 * 60);

    // Create a record in our database
    const response = await db('banlist').returning('*').insert({ userID: userId, roomID: roomId, until: banEnd });
    return response[0];
  }

  // Remove the ban record from our database
  async removeBan(userId: number, roomId: number) {
    const response = await db('banlist').where({ userID: userId, roomID: roomId }).del();
    return response[0];
  }

  // Find out if a user is banned in a given chat
  async isBanned(userId: number, roomId: number): Promise<boolean> {
    // Find the corresponding record
    const response = await db('banlist').where({ userID: userId, roomID: roomId }).select('*');

    // If such a record exists
    if (response.length) {
      // If it is still in effect, return true
      const now = new Date()
      if (response[0].until.getTime() > now.getTime())
        return true;
      // If it's already expired, remove the ban and return false
      this.removeBan(userId, roomId);
      return false;
    }
    return false;
  }

  // Mute a user in a given room for a given number of minutes
  async muteUser(userId: number, roomId: number, minutes: number) {
    // Calculate the mute end date
    const now = new Date();
    const banEnd = new Date(now.getTime() + minutes * 1000 * 60);

    // Create the DB record
    const response = await db('mutelist').returning('*').insert({ userID: userId, roomID: roomId, until: banEnd });
    return banEnd;
  }

  // Remove a mute record from our database
  async removeMute(userId: number, roomId: number) {
    const response = await db('mutelist').where({ userID: userId, roomID: roomId }).del();
    return response[0];
  }

  // Find out if a user is muted in a room
  async isMuted(userId: number, roomId: number): Promise<boolean> {
    // Find the corresponding record
    const response = await db('mutelist').where({ userID: userId, roomID: roomId }).select('*');

    // If such record exists
    if (response.length) {
      // And is still in effect, return true
      const now = new Date()
      if (response[0].until.getTime() > now.getTime())
        return true;
      // If it's already expired, remove the mute
      this.removeMute(userId, roomId);
      return false;
    }
    return false;
  }

  // Find out until which date a user is muted in the room
  async getMutedUntil(userId: number, roomId: number): Promise<Date | null> {
    // Find the corresponding record
    const response = await db('mutelist').where({ userID: userId, roomID: roomId }).select('*');

    // If the record exists
    if (response.length) {
      // If it is still in vigor, return when it ends
      const now = new Date()
      if (response[0].until.getTime() > now.getTime())
        return response[0].until;

      // If it's already expired, remove the mute
      this.removeMute(userId, roomId);
      return null;
    }
    return null;
  }

  // Create admin 
  async addAdmin(userId: number, roomId: number) {
    // Creat the record in the database
    const response = await db('admins').returning('*').insert({ userID: userId, roomID: roomId });
    return response;
  }

  // Check if a user is an admin in a given room
  async isAdmin(userId: number, roomId: number): Promise<boolean> {
    // Get the value from the DB
    const response = await db('admins').where({ userID: userId, roomID: roomId }).select('*');
    if (response.length)
      return true;
    return false;
  }

  // Get all admins saved in our database
  async getAllAdmins(roomId: number) {
    // Get all admin instances
    const response = await db('admins').where({ roomID: roomId })
      .join('users', 'users.id', '=', 'admins.userID').select('admins.id', 'admins.userID', 'users.name');
    return response
  }

  async createDirect(userAId: number, userBId: number) {
    // Create a new room in the database
    const new_direct = await db('directs').returning('*').insert({ userA: userAId, userB: userBId });
    // Return the instance of the room
    return new_direct[0];
  }

  // Get all direct conversations for a given user
  async getAllDirects(userId: number) {
    // Find the direct conversation instances
    const directs = await db('directs').where({ userA: userId }).orWhere({ userB: userId }).select('*');
    return directs;
  }

  // Find an instance of direct conversation between user A and user B
  async findDirect(userAId: number, userBId: number): Promise<Direct | null> {
    // Find the direct conversation instance
    const direct = await db('directs').where({ userA: userAId, userB: userBId })
      .orWhere({ userA: userBId, userB: userAId }).select('*');
    return direct[0] as Direct;
  }

  // Get all direct messages up to this moment in a given direct conversation
  async getAllDirectMessages(directId: number) {
    // Find the message instances
    const messages = await db('directmessages').where({ directID: directId })
      .join('users', 'users.id', '=', 'directmessages.senderID')
      .select(
        'directmessages.id', 'directmessages.message', 'directmessages.senderID', 'directmessages.type', 'directmessages.receiverId', 'directmessages.roomName',
        'users.name as name', 'users.id42', 'users.avatar', 'users.owner', 'users.banned', 'users.admin', 'users.realAvatar');
    return messages;
  }

  // Get all direct messages up to this moment in a given direct conversation
  // plus wrap in sender information
  async getAllDirectUpdates(directId: number) {
    // First, get all the messages from the database
    const messages = await this.getAllDirectMessages(directId);
    // Second, map messages into updates
    const updates: DirectMessageUpdate[] = messages.map((message) => {
      // Construct the sender
      const sender: UserPublic = {
        id: message.senderID,
        id42: message.id42,
        name: message.name,
        avatar: message.avatar,
        elo: message.elo,
        realAvatar: message.realAvatar,
        owner: message.owner,
        banned: message.banned,
        admin: message.admin
      }
      // Then, construct the update object
      const update: DirectMessageUpdate = {
        id: message.id,
        name: message.name,
        message: message.message,
        senderID: message.senderID,
        sender: sender,
        type: message.type,
        receiverId: message.receiverId,
        roomName: message.roomName
      }
      return update;
    });
    return updates;
  }

  // Save a newly sent direct message to our database
  async sendDirectMessage(directId: number, senderId: number, message: string, type: ChatMessageType = ChatMessageType.TEXT, receiverId: number | null = null, roomName: string | null = null) {
    // Create the message instance
    const response = await db('directmessages').returning('*')
      .insert({ directID: directId, senderID: senderId, message: message, type: type, receiverId: receiverId, roomName: roomName });
    return response[0]
  }

  async removeRoomFromFavs(roomID: number, userID: number) {
    const response = await db('my_rooms').where({ roomID: roomID, userID: userID }).delete();

    return response;
  }

  async addRoom(roomID: number, userID: number) {
    // Add the room to favourites
    const response = await db('my_rooms')
      .returning('*')
      .insert({ userID: userID, roomID: roomID });

    return response[0];
  }

  async updateMessageById(mId: number, updates: any)
  {
    const response = await db('message').returning('*').where({id: mId}).update(updates);
    return response[0];
  }

  async updateDirectMessageById(mId: number, updates: any)
  {
    const response = await db('directmessages').returning('*').where({id: mId}).update(updates);
    return response[0];
  }
}
