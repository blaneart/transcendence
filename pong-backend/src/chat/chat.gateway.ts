import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UseGuards } from "@nestjs/common";
import { JwtWsAuthGuard } from "../auth/jwt-ws-auth.guard";
import { Room } from "./chat.types";

// The kind of the message (to extend later)
enum ChatMessageType {
  TEXT,
  GAME_INVITE,
  GAME_SCORE
}

// The update we get from frontend to update the DB
interface ChatMessage {
  type: ChatMessageType,
  text: string
  room: string
}

// The update we send to frontend to show messages
interface ChatMessageUpdate {
  id: number,
  name: string,
  message: string
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
}

// TypeScript needs to know that our auth guards append the user to the socket
interface AuthenticatedSocket extends Socket {
  user: User
}

interface LoginAttempt {
  roomName: string,
  password: string
}

@WebSocketGateway(8080, { cors: true })
export class ChatGateway {
  constructor (private readonly chatService: ChatService) {}

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
    const messages = await this.chatService.getRoomMessages(room.name);
    
    // And send them to the newly joined user
    this.server.to(client.id).emit("initialMessages", messages);
  }

  // Handle a request to join a room
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('requestJoin')
  async handleEvent(client: AuthenticatedSocket, data: string) {
    
    const room = await this.chatService.findRoomByName(data);

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

    // Check if the user has joined this room
    const canMessage = await this.chatService.checkUserJoined(room, client.user.id);

    // Ensure the user joined this room
    if (canMessage !== true)
    {
      throw new WsException("You must log in the room to write in it");
    }

    // Save the new message to our database
    const savedMessage = await this.chatService.sendMessage(client.user.id, message.room, message.text);
    
    // Create a new update for the clients
    const newMessage: ChatMessageUpdate = {
      id: savedMessage.id, // The id comes from our database
      name: client.user.name, // The name is authenticated
      message: message.text
    };

    // Send the update to all other clients, including the sender
    this.server.to(message.room).emit("newMessage", newMessage);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('deleteRoom')
  async handleDelete(client: AuthenticatedSocket, data: string) {

    // Find the room we're talking about
    const room = await this.chatService.findRoomByName(data);

    // Ensure the room exists
    if (!room)
      throw new WsException("Room not found");

    // Ensure the sender owns the room
    if (room.ownerID !== client.user.id)
      throw new WsException("You have to own this room to delete it.");

    // Kick all the users from the room
    this.server.to(room.name).emit("kickedOut");

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
}