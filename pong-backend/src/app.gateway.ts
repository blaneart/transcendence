import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { JwtWsAuthGuard } from "./auth/jwt-ws-auth.guard";
import { ProfileService } from "src/profile/profile.service";

interface User {
  id: number;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  elo: number;
  wins: number;
  realAvatar: boolean
  status: number;
}

// TypeScript needs to know that our auth guards append the user to the socket
interface AuthenticatedSocket extends Socket {
  user: User
}

@WebSocketGateway(3003, { cors: true })
export class AppGateway {
  constructor (private readonly profileService: ProfileService) {}

  @WebSocketServer()
  server: Server;
  connectedClients = [];
  connectedIds = [];

  private logger =  new Logger('AppGateway');

  @UseGuards(JwtWsAuthGuard)
  handleConnection(client: AuthenticatedSocket)
  {
    this.connectedClients = [...this.connectedClients, client.id]
    this.logger.log(
      `Client connected: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
  }

  @UseGuards(JwtWsAuthGuard)
  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients = this.connectedClients.filter(
      connectedClient => connectedClient !== client.id
    );
    this.logger.log(
      `Client disconnected: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('login')
  async handleLogin(client: AuthenticatedSocket)
  {
    this.connectedIds = [...this.connectedIds, client.user.id]
    this.logger.log(
      `Client connected: ${client.user.id} [${client.user.name}] connected.`
    );
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('logout')
  async handleLogout(client: AuthenticatedSocket)
  {
    this.connectedIds = this.connectedIds.filter(
      connectedId => connectedId !== client.user.id
    );
    this.logger.log(
      `Client disconnected: ${client.user.id} [${client.user.name}] disconnected.`
    );
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('getIds')
  async getConnectedIds(client: AuthenticatedSocket)
  {
    return this.connectedIds as number[];
  }
}