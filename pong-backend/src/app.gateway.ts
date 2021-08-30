import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { WSASERVICE_NOT_FOUND } from 'constants';
import { Socket, Server } from 'socket.io';

export enum ActionTypes {
  Data = '[Socket] Data',
  ClientConnected = '[Socket] Client Connected',
  ValuePatched = '[Socket] Value Patched',
  PatchValue = '[Form] Patch Value',
  Init = '[Init] Init'
}

export interface FormData {
  title: string;
  description: string;
}
class Vec {
  x: number;
  y: number;
  constructor(x = 0, y = 0)
  {
    this.x = x;
    this.y = y;
  }
  get len()
  {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  set len(value)
  {
    const fact = value / this.len;
    this.x *= fact;
    this.y *= fact;
  }
}

class Rect {
  pos: Vec;
  size: Vec;
  constructor(w: number, h: number)
  {
    this.pos = new Vec();
    this.size = new Vec(w, h);
  }
  get left()
  {
    return this.pos.x;
  }
  get right()
  {
    return this.pos.x + this.size.x;
  }
  get top()
  {
    return this.pos.y;
  }
  get bottom()
  {
    return this.pos.y + this.size.y;
  }
}


class Player extends Rect {
  score: number;
  socket_id: string;
  constructor()
  {
    super(20,100);
    this.score = 9;
    this.socket_id;
  }
}
var players = [
  new Player(),
  new Player(),
]
@WebSocketGateway(3002, { cors: true })
export class AppGateway implements OnGatewayInit {

  @WebSocketServer() 
  server: Server;
  connectedClients = [];
  data = {}
  // @WebSocketServer()
  // server: Server;
  private logger =  new Logger('AppGateway');

  handleConnection(client: Socket)
  {
    this.connectedClients = [...this.connectedClients, client.id]
    this.logger.log(
      `Client connected: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
    this.server.emit(ActionTypes.ClientConnected, this.connectedClients);
    client.emit(ActionTypes.Data, this.data);
  }
  handleDisconnect(client: Socket) {
    this.connectedClients = this.connectedClients.filter(
      connectedClient => connectedClient !== client.id
    );
    this.logger.log(
      `Client disconnected: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
    this.server.emit(ActionTypes.ClientConnected, this.connectedClients);
  }

  afterInit(server: any)
  {
      this.logger.log('Initialize');
  }

  @SubscribeMessage(ActionTypes.PatchValue)
  patchValue(client: Socket, payload: Partial<FormData>) {
    this.data = { ...this.data, ...payload };
    this.logger.log(`Patch value: ${JSON.stringify(payload)}.`);
    client.broadcast.emit(ActionTypes.ValuePatched, payload);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: number)  {
    // this.connectedClients.forEach((reciever: Socket) => {
    //   if (reciever !== client)
    // {
    //     console.log(client.id, reciever)
        client.broadcast.emit('msgToClient', text);
    // }
    // })
  // handleMessage(client: Socket, text: string): void {
  }
  @SubscribeMessage('joinRoom')
  createRoom(socket: Socket) {
    socket.join('aRoom');
    // socket.to('aRoom').emit('roomCreated', {room: 'aRoom'});
    if (this.server.sockets.adapter.rooms.get('aRoom').size === 1)
  {
      this.server.emit('returnWaitingResponse', false);
  }
    else if (this.server.sockets.adapter.rooms.get('aRoom').size === 2)
    {
      var x = this.server.sockets.adapter.rooms.get('aRoom')
      var it = x.values();
      //get first entry:
      var first = it.next();
      this.server.sockets.sockets.get(first.value).emit('getId', 0)
      socket.emit('getId', 1);
      // socket.broadcast.to(this.server.sockets[first.value].id).emit('getId', 0);

      // this.server.emit('returnWaitingResponse', true);
    }
  }
}
