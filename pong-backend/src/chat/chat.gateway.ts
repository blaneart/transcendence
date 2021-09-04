import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
// import { Socket } from "@nestjs/platform-socket.io";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { UseGuards } from "@nestjs/common";
import { JwtWsAuthGuard } from "../auth/jwt-ws-auth.guard";
import { type } from "os";

enum ChatMessageType {
  TEXT,
  GAME_INVITE,
  GAME_SCORE
}

interface ChatMessage {
  type: ChatMessageType,
  text: string
  room: string
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

interface AuthenticatedSocket extends Socket {
  user: User
}

@WebSocketGateway(8080, { cors: true })
export class ChatGateway {
  constructor (private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    // this.server.emit('message', message);
    console.log(message);
    this.server.emit('response', message);
  }


  @SubscribeMessage('requestJoin')
  async handleEvent(client: Socket, data: string) {
    // return data;
    // client.join()

    client.join(data);
    this.server.to(data).emit("roomUpdate", "client joined");
    // return ("Fine");
    const messages = await this.chatService.getRoomMessages(data);
    console.log(messages);
    this.server.to(client.id).emit("initialMessages", messages);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chatMessage')
  handleChatMessage(client: AuthenticatedSocket, message: ChatMessage) {
    // console.log(client);
    // const newMessage = JSON.parse(data) as ChatMessage;
    
    // In the future, where we will associate 
    // this.chatService.saveMessage(client.user.id)
    console.log(`Sender: ${message.room}`);
    this.chatService.sendMessage(client.user.id, message.room, message.text)
    
    // return data;
    // client.join()
    // console.log(`Got a chat message: ${data}`);
    // console.log(data);
  }
}