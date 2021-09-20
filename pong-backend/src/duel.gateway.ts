import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3002, { namespace: '/duels', cors: true })
export class DuelGateway implements OnGatewayInit {
  private logger =  new Logger('GameGateway');
  @WebSocketServer() 
  server: Server;
  connectedClients = [];
  handleConnection(client: Socket)
  {
    this.connectedClients = [...this.connectedClients, client.id]
    this.logger.log(
      `Client connected in duels: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
  }
  handleDisconnect(client: Socket) {
    this.connectedClients = this.connectedClients.filter(
      connectedClient => connectedClient !== client.id
    );
    this.logger.log(
      `Client disconnected in duels: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
  }
  afterInit(server: any) {
    this.logger.log('Initialize');

  }

  @SubscribeMessage('joinedWaitingRoom')
  waitingRoom()
  {}

  @SubscribeMessage('gameStarted')
  gameInitializer(client: Socket)
  {

  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
  

  
}
