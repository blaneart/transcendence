import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayInit {

  // @WebSocketServer() wss: Server;

  private logger =  new Logger('AppGateway');


  afterInit(server: any)
  {
      this.logger.log('Initialize');
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string): WsResponse<string> {
  // handleMessage(client: Socket, text: string): void {
    // this.wss.emit('msgToClient', text);
    return {event: 'msgToClient', data: text + "1"};
  }
}
