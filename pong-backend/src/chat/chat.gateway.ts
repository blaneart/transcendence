import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UseGuards } from "@nestjs/common";
import { JwtWsAuthGuard } from "../auth/jwt-ws-auth.guard";

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

@WebSocketGateway(8080, { cors: true })
export class ChatGateway {
  constructor (private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  // Handle a request to join a room
  @SubscribeMessage('requestJoin')
  async handleEvent(client: Socket, data: string) {
    
    // Add the client to the SocketIO room
    client.join(data);
    
    // Notify others that someone joined
    this.server.to(data).emit("roomUpdate", "client joined");
    
    // Get the history of the messages
    const messages = await this.chatService.getRoomMessages(data);
    
    // And send them to the newly joined user
    this.server.to(client.id).emit("initialMessages", messages);
  }

  // Handle a new message
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chatMessage')
  async handleChatMessage(client: AuthenticatedSocket, message: ChatMessage) {

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
}