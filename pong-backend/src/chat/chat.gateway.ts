import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UseGuards } from "@nestjs/common";
import { JwtWsAuthGuard } from "../auth/jwt-ws-auth.guard";
import { Room, Direct, ChatMessageUpdate, DirectMessageUpdate } from "./chat.types";
import { UserPublic } from "src/app.types";
import { ProfileService } from "src/profile/profile.service";
import { LoginAttempt, DirectMessage, BanRequest, ChatMessage } from "./chat.dto";

// The kind of the message (to extend later)
enum ChatMessageType {
  TEXT,
  GAME_INVITE,
  GAME_SCORE
}

interface User {
  id: number;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean
  status: number;
}

// TypeScript needs to know that our auth guards append the user to the socket
interface AuthenticatedSocket extends Socket {
  user: User
}

@WebSocketGateway(8080, { cors: true })
export class ChatGateway {
  constructor (private readonly chatService: ChatService, private readonly profileService: ProfileService) {}

  @WebSocketServer()
  server: Server;

  // Once we've authenticated the user, add them to the SocketIO room
  async join_room(client: AuthenticatedSocket, room: Room)
  {
    // Leave a join trail in the DB
    this.chatService.joinRoomByID(client.user.id, room.id);

    // Add the client to the SocketIO room
    client.join(room.name);
    
    // Notify others that someone joined
    this.server.to(room.name).emit("roomUpdate", "client joined");
    
    // Get the history of the messages
    // const messages = await this.chatService.getRoomMessages(room.name);
    const update: ChatMessageUpdate[] = await this.chatService.getRoomMessageUpdates(room.name);
    
    // And send them to the newly joined user
    this.server.to(client.id).emit("initialMessages", update);
  }

  // Handle a request to join a room
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('requestJoin')
  async handleEvent(client: AuthenticatedSocket, roomName: string) {

    // Manually validate room name
    if (!roomName || roomName === "")
      throw new WsException("Bad request");

    const room = await this.chatService.findRoomByName(roomName);

    // Store the user in the data property that is always accessible
    client.data.user = client.user;

    // Ensure room exists
    if (room === null)
    {
      throw new WsException("Room not found");
    }

    // Ensure room is not restricted (if it is, ask to log in)
    if (room.restricted)
    {
      return this.server.to(client.id).emit("loginRequest");
    }

    // Ensure the user is not banned in this room
    if (await this.chatService.isBanned(client.user.id, room.id))
      return this.server.to(client.id).emit("banned");

    // Finalize room join
    this.join_room(client, room);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('login')
  async handleLogin(client: AuthenticatedSocket, data: LoginAttempt)
  {
    const room = await this.chatService.findRoomByName(data.roomName);

    if (data.roomName === "")
    {
      throw new WsException("Room name empty");
    }

    // Ensure room exists
    if (room === null)
    {
      throw new WsException("Room not found");
    }

    // Ensure room is restricted (if it isn't, you can just join)
    if (!(room.restricted))
    {
      throw new WsException("Room is open, you should just join");
    }

    // Ensure the passworkd is not empty
    if (data.password === "")
    {
      throw new WsException("Empty password");
    }

    // Compare the password with the stored hash
    const response: boolean = await this.chatService.checkPassword(room, data.password);

    // Ensure the password was a match
    if (response !== true)
    {
      // Kick the person out
      this.server.to(client.id).emit('kickedOut');
      throw new WsException("Wrong password");
    }

    // Finalize room join
    this.join_room(client, room);
  }

  // Handle a new message
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chatMessage')
  async handleChatMessage(client: AuthenticatedSocket, message: ChatMessage) {

    // Find the room in our database
    const room = await this.chatService.findRoomByName(message.room);

    // Ensure room exists
    if (!room)
    {
      throw new WsException("Room not found");
    }

    // Check if the user has joined this room
    const canMessage = await this.chatService.checkUserJoined(room, client.user.id);

    // Ensure the user joined this room
    if (canMessage !== true)
    {
      throw new WsException("You must log in the room to write in it");
    }

    // Ensure the user is not muted
    if (await this.chatService.isMuted(client.user.id, room.id))
      throw new WsException("You are muted");

    // Save the new message to our database
    const savedMessage = await this.chatService.sendMessage(client.user.id, message.room, message.text);

    // Get the sender info for the update
    const senderUser = await this.profileService.getUserById(client.user.id) as UserPublic;
    
    // Create a new update for the clients
    const newMessage: ChatMessageUpdate = {
      id: savedMessage.id, // The id comes from our database
      name: client.user.name, // The name is authenticated
      message: message.text,
      senderID: client.user.id,
      sender: senderUser
    };

    // Send the update to all other clients, including the sender
    this.server.to(message.room).emit("newMessage", newMessage);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('deleteRoom')
  async handleDelete(client: AuthenticatedSocket, roomName: string) {

    // Manually validate room name
    if (!roomName || roomName === "")
      throw new WsException("Bad request");

    // Find the room we're talking about
    const room = await this.chatService.findRoomByName(roomName);

    // Ensure the room exists
    if (!room)
      throw new WsException("Room not found");

    // Ensure the sender owns the room
    if (room.ownerID !== client.user.id)
      throw new WsException("You have to own this room to delete it.");

    // Kick all the users from the room
    this.server.to(room.name).emit("kickedOut");
    this.server.socketsLeave(room.name);

    // Delete the room from the database
    this.chatService.deleteRoom(room.id);

    // Delete all participations from the database
    this.chatService.deleteAllParticipations(room);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('disconnect')
  async handleDisconnect(client: AuthenticatedSocket) {
    // Leave all rooms
    if (client.user)
      this.chatService.leaveAllRooms(client.user.id);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('restrictRoom')
  async handleRestrict(client: AuthenticatedSocket, attempt: LoginAttempt) {
    // Find the room
    const room = await this.chatService.findRoomByName(attempt.roomName);

    // Ensure the room exists
    if (!room)
      throw new WsException("Room not found");

    // Ensure the sender owns the room
    if (room.ownerID !== client.user.id)
      throw new WsException("You have to own the room to make it private");

    // Restrict the room in our database
    this.chatService.restrictRoom(attempt.roomName, attempt.password);

    // Kick all the users from the room
    this.server.to(room.name).emit("kickedOut");
    this.server.socketsLeave(room.name);

    // Delete all participations from the database
    this.chatService.deleteAllParticipations(room);
  }

  // Ban a user
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('banUser')
  async handleBanUser(client: AuthenticatedSocket, data: BanRequest) {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(data.roomName);

    // Ensure the room exists
    if (!room) 
      throw new WsException("Room not found");

     // Ensure the sender is the room owner
     if (!(await this.chatService.isAdmin(room.id, client.user.id))
     && client.user.id !== room.ownerID)
      throw new WsException("You must be the room owner or an administrator to ban people");

    // Ensure the number of minutes is correct
    if (data.minutes <= 0 || isNaN(data.minutes))
      throw new WsException("Incorrect number of minutes");

    // Create a ban record in our database
    const response = await this.chatService.banUser(data.userId, room.id, data.minutes);

    // Kick the user out from the room
    const socketsInTheRoom =  await this.server.in(room.name).fetchSockets()
    for (let socket of socketsInTheRoom)
    {
      if (socket.data.user && socket.data.user.id === data.userId )
      {
        this.server.to(socket.id).emit("banned");
        socket.leave(room.name);
      }
    }
  }

  // Mute a user
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('muteUser')
  async handleMuteUser(client: AuthenticatedSocket, data: BanRequest) {

    // Find the room in our database
    const room = await this.chatService.findRoomByName(data.roomName);

    // Ensure the room exists
    if (!room) 
      throw new WsException("Room not found");

    // Ensure the sender is the room owner
    if (!(await this.chatService.isAdmin(room.id, client.user.id))
            && client.user.id !== room.ownerID)
      throw new WsException("You must be the room owner or an administrator to mute people");

    // Ensure the number of minutes is correct
    if (data.minutes <= 0 || isNaN(data.minutes))
      throw new WsException("Incorrect number of minutes");

    // Add a mute record to our database
    const mutedUntil = await this.chatService.muteUser(data.userId, room.id, data.minutes);

    // Send the muted person a nice message
    const socketsInTheRoom =  await this.server.in(room.name).fetchSockets()
    for (let socket of socketsInTheRoom)
    {
      if (socket.data.user && socket.data.user.id === data.userId )
      {
        this.server.to(socket.id).emit("muted", data.minutes);
      }
    }
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('makeAdmin')
  async handleMakeAdmin(client: AuthenticatedSocket, data: BanRequest) {

    // Find the room in our database
    const room = await this.chatService.findRoomByName(data.roomName);

    // Ensure the room exists
    if (!room) 
      throw new WsException("Room not found");

    // Ensure the caller has the rights to nominate admins
    if (client.user.id !== room.ownerID)
      throw new WsException("You must be the owner of the room to add admins");

    // Make the person admin in the database
    this.chatService.addAdmin(data.userId, room.id);

    // Let the new admin know
    this.server.to(room.name).emit("promoted", data.userId);
  }

 // Once we've authenticated the user, add them to the SocketIO room
  async join_direct_convo(client: AuthenticatedSocket, direct: Direct)
  {
   // Add the client to the SocketIO room
   client.join(`direct_${direct.id}`);
   
   // Get the history of the messages
   const messages = await this.chatService.getAllDirectUpdates(direct.id);
   
   // And send them to the newly joined user
   this.server.to(client.id).emit("initialDirectMessages", messages);
  }

  // Handle a request to join a room
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('requestJoinDm')
  async handleJoinDm(client: AuthenticatedSocket, userName: string) {

    // Manually validate username
    if (!userName || userName === "")
      throw new WsException("Bad request");

      // Find the user instance in our database
    const user = await this.profileService.getUserByName(userName);

    // Ensure the user we're talking about exists
    if (!user)
      throw new WsException("User not found");

    // Find the direct conversation in our database
    let direct = await this.chatService.findDirect(client.user.id, user.id);

    // Ensure direct conversation exists
    if (!direct)
      direct = await this.chatService.createDirect(client.user.id, user.id);
    
    // Save the user data so it's easier to access
    client.data.user = client.user;

    // Finalize room join
    this.join_direct_convo(client, direct);
  }

  // Handle a new message
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('directMessage')
  async handleDirectMessage(client: AuthenticatedSocket, message: DirectMessage) {

    // Find the person we're talking to
    const interlocutor = await this.profileService.getUserByName(message.userB);

    // Ensure the interlocutor exists
    if (!interlocutor)
      throw new WsException("User not found");

    // Find the direct convo in our database
    const direct = await this.chatService.findDirect(client.user.id, interlocutor.id);

    // Ensure room exists
    if (!direct)
      throw new WsException("Conversation not found");

    // Save the new message to our database
    const savedMessage = await this.chatService.sendDirectMessage(direct.id, client.user.id, message.text);

    // Create an update instance
    const newMessage: DirectMessageUpdate = {
      id: savedMessage.id,
      name: client.user.name,
      message: message.text,
      senderID: client.user.id,
      sender: client.user as UserPublic
    }

    // Send the update to other side
    this.server.to(`direct_${direct.id}`).emit("newDirectMessage", newMessage);
  }

}