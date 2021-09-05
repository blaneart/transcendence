import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { WSASERVICE_NOT_FOUND } from 'constants';
import { Socket, Server } from 'socket.io';
var uuid = require('uuid');

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
  data = {};
  playersId = {};
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

    // this.server.emit(ActionTypes.ClientConnected, this.connectedClients);
  }
  @SubscribeMessage('quitGame')
  quitGame(clinet: Socket, score1: number, score2: number) 
  {
    if ((score1  < 10 && score2 < 10))
      this.server.emit('won');
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

        client.broadcast.emit('getPosition', text);
  }
  

  @SubscribeMessage('scored')
  ballLaunch(socket: Socket) {
    let message = {
      pos_y: Math.random() * 600,
      vel_x: 300 * (Math.random() > .5 ? 1 : -1),
      vel_y: 300 * (Math.random() * 2  -1)
    }
    this.server.emit('getBallSpeed', message)
  }
  getActiveRooms = () => {
    // Convert map into 2D list:
    // ==> [['4ziBKG9XFS06NdtVAAAH', Set(1)], ['room1', Set(2)], ...]
    const arr = Array.from(this.server.sockets.adapter.rooms);
    // Filter rooms whose name exist in set:
    // ==> [['room1', Set(2)], ['room2', Set(2)]]
    const filtered = arr.filter(room => !room[1].has(room[0]))
    // Return only the room name: 
    // ==> ['room1', 'room2']
    const res = filtered.map(i => i[0]);
    return res;
}

  getWaitingRoom = (socket: Socket) =>
  {
    let playerId;
    let ready = false;
    let roomName;

    roomName = this.getActiveRooms().find((roomName) => 
         this.server.sockets.adapter.rooms.get(roomName).size < 2);

    if (!roomName)
    {
      console.log(roomName);
      roomName = uuid.v4();
      playerId =  Math.random()>=0.5? 1 : 0;
      this.playersId[roomName] = playerId;
    }
    else
    {
      ready = true;
      playerId  = 1 - this.playersId[roomName];
    }
    console.log(roomName);
    socket.join(roomName);
    this.server.to(socket.id).emit('getId', playerId)
    if (ready)
      this.server.emit('ready');
  }

  getRoomNameByUser

  getByValue = (map, searchValue) => {
    for (let [key, value] of map.entries()) {
      console.log(key, value)
      if (value === searchValue)
        return key;
    }
  }

  @SubscribeMessage('leaveRoom')
  leavRoom(socket: Socket)
  {
    console.log('leaveRoom')
    // this.server.sockets.adapter.rooms.forEach(value => {console.log(value)})
    // let roomName = this.getByValue(this.server.sockets.adapter.rooms, socket.id);
    const arr = Array.from(socket.rooms);
    const filtered = arr.filter(room => room !== socket.id)

    // delete this.server.sockets.adapter.rooms[socket.id];
    console.log(filtered[0]);


    // if (this.server.sockets.adapter.rooms[filtered[0]])
      this.server.of("/").adapter.on("delete-room", (room) => 
      console.log(room, "room was deleted"));
  
      socket.leave(filtered[0])
  }


  @SubscribeMessage('joinRoom')
  createRoom(socket: Socket) {
    console.log('joinRoom');
    this.getWaitingRoom(socket);


    // socket.to('aRoom').emit('roomCreated', {room: 'aRoom'});
  //   if (this.server.sockets.adapter.rooms.get('aRoom').size === 1)
  // {
  //     this.server.emit('returnWaitingResponse', false);
  // }
  //   else if (this.server.sockets.adapter.rooms.get('aRoom').size === 2)
  //   {
  //     var x = this.server.sockets.adapter.rooms.get('aRoom')
  //     var it = x.values();
  //     //get first entry:
  //     var first = it.next();
  //     this.server.sockets.sockets.get(first.value).emit('getId', 0)
  //     socket.emit('getId', 1);
      // socket.broadcast.to(this.server.sockets[first.value].id).emit('getId', 0);

      // this.server.emit('returnWaitingResponse', true);
    // }
  }
}
