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
    console.log(client.id);
    // this.connectedClients[client.id] = userid 
  }

  @SubscribeMessage('setUserId')
  writeUserId(client: Socket, userid: number)
  {
    console.log(client.id, userid)

    this.connectedClients[client.id] = userid;
  }


  afterInit(server: any)
  {}

  handleDisconnect(client: Socket) {
    console.log(this.connectedClients[client.id])
    if (this.connectedClients[client.id])
      this.profileService.updateUserById(this.connectedClients[client.id], {status: 0})
  }

}

