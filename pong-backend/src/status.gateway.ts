import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { userInfo } from 'os';
import { Server, Socket } from 'socket.io';
import { ProfileService } from './profile/profile.service';


const PORT_ONE = process.env.PORT_ONE ? parseInt(process.env.PORT_ONE) : 3002;


@WebSocketGateway(PORT_ONE, {namespace: "status", cors: true})
export class StatusGateway implements OnGatewayInit {
  constructor(private readonly profileService: ProfileService){}


  @WebSocketServer() 
  server: Server;
  
  connectedClients = {};
  handleConnection(client: Socket, userid)
  {
  }

  @SubscribeMessage('setUserId')
  writeUserId(client: Socket, userid: number)
  {
    this.connectedClients[client.id] = userid;
  }


  afterInit(server: any)
  {}

  handleDisconnect(client: Socket) {
    if (this.connectedClients[client.id])
    {
      this.profileService.updateUserById(this.connectedClients[client.id], {status: 0})
      delete this.connectedClients[client.id];
    }
  }
}

