import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { time } from 'console';
import { WSASERVICE_NOT_FOUND } from 'constants';
import { SocketAddress } from 'net';
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

class Player {
  name: string;
  id: number;
  socketId: string;
  position: number;
  constructor(name: string, id: number, socket: string, pos: number)
  {
    this.name= name;
    this.id = id;
    this.socketId= socket;
    this.position = pos;
  }

  get Name()
  {
    return this.name;
  }

  get SocketID()
  {
    return this.socketId;
  }

  get Position()
  {
    return this.position;
  }

  get Id()
  {
    return this.id;
  }

  set Poisiton(position: number)
  {
    this.position = position;
  }

}

class Ball extends Rect {
  vel: Vec;
  constructor()
  {
    super(18,18);
    this.vel = new Vec(100, 100);
  }
}

@WebSocketGateway(3002, { cors: true })
export class AppGateway implements OnGatewayInit {
  rooms = {};

  @WebSocketServer() 
  server: Server;
  connectedClients = [];
  playersId = {};
  private logger =  new Logger('AppGateway');
  handleConnection(client: Socket)
  {
    this.connectedClients = [...this.connectedClients, client.id]
    this.logger.log(
      `Client connected: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
    this.server.emit(ActionTypes.ClientConnected, this.connectedClients);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients = this.connectedClients.filter(
      connectedClient => connectedClient !== client.id
    );

    this.logger.log(
      `Client disconnected: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
  }

  getWaitingRoom = (socket: Socket, userName: string) =>
  {
    let playerId;
    let ready = false;
    let roomName;

    roomName = this.getActiveRooms().find((roomName) => 
         this.server.sockets.adapter.rooms.get(roomName).size < 2);

    /* creates new room if every room is full*/
    if (!roomName)
    {
      console.log(roomName);
      roomName = uuid.v4();
      playerId =  Math.random()>=0.5? 1 : 0;
      if (!this.rooms[roomName])
        this.rooms[roomName] = {
          players: [],
          scores: [0,0],
          ball: new Ball(),
          ball_speed: [0,0],
          ball_position: [50, 50],
        }
        this.rooms[roomName].players[playerId] = new Player(userName, playerId, socket.id, 100)
    }
    
    /* or assigns player to a room with one player */
    else
    {
      ready = true;
      if (!this.rooms[roomName].players[0])
        playerId  = 0;
      else
        playerId = 1;
      this.rooms[roomName].players[playerId] = new Player(userName, playerId, socket.id, 100)
    }

    socket.join(roomName);
    this.server.to(socket.id).emit('gameId', roomName);
    this.server.to(socket.id).emit('getId', playerId);
    if (ready)
    {
      this.server.to(this.rooms[roomName].players[1].socketId).emit('enemyname', this.rooms[roomName].players[0].name);
      this.server.to(this.rooms[roomName].players[0].socketId).emit('enemyname', this.rooms[roomName].players[1].name);
      this.server.emit('ready');
    }
  }

  @SubscribeMessage('subscribe')
  pushBall(client: Socket)
  {


    const callback = (dt: number, ball: Ball) => {

      ball.pos.x += ball.vel.x * (dt / 1000);
      ball.pos.y += ball.vel.y * (dt / 1000);
      if (this.rooms[roomName].scores[0] >= 10 || this.rooms[roomName].scores[1] >= 10 || ball.pos.x > 1000)
        clearInterval(interval);
      console.log(ball.pos);
      this.server.to(roomName).emit('getBallPosition', ball.pos);

  };

    let lastTime: number;
    let roomName = this.getRoomNameBySocket(client);
    var interval = null;
    let dt  = 10;
    let myBall = this.rooms[roomName].ball;
    interval = setInterval(function() {callback(dt, myBall);}, dt);
    // interval = setInterval(() => {
    //   msg.posx = msg.posx + 1;
    //   // Object.keys(TextFile)[0]

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
    this.logger.log(`Patch value: ${JSON.stringify(payload)}.`);
    client.broadcast.emit(ActionTypes.ValuePatched, payload);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: number)  {
        client.broadcast.emit('getPosition', text);
  }
  


  @SubscribeMessage('launchBall')
  ballLaunch(socket: Socket) {
    let message = {
      pos_x: 400,
      pos_y: Math.random() * 600,
      vel_x: 300 * (Math.random() > .5 ? 1 : -1),
      vel_y: 300 * (Math.random() * 2  -1)
    }
    this.server.emit('getBallSpeed', message)
  }


  @SubscribeMessage('scored')
  playerScored(socket: Socket, who: number) {
    if (socket.id != this.rooms[this.getRoomNameBySocket(socket)].players[who].socketId)
      this.rooms[this.getRoomNameBySocket(socket)].scores[who] =  this.rooms[this.getRoomNameBySocket(socket)].scores[who] + 1;
    this.server.emit('changeScore', this.rooms[this.getRoomNameBySocket(socket)].scores)
  }


  getActiveRooms = () => {
    const arr = Array.from(this.server.sockets.adapter.rooms);
    const filtered = arr.filter(room => !room[1].has(room[0]))
    const res = filtered.map(i => i[0]);

    return res;
}



  getRoomNameBySocket = (socket: Socket) => {
    const arr = Array.from(socket.rooms);
    const filtered = arr.filter(room => room !== socket.id)
    return filtered[0];
  }

  @SubscribeMessage('leaveRoom')
  leavRoom(socket: Socket)
  {
    console.log('leaveRoom');

    let roomName = this.getRoomNameBySocket(socket);
    socket.leave(roomName);
    if (this.rooms.hasOwnProperty(roomName)) // true
      delete this.rooms[roomName];
  }


  @SubscribeMessage('joinRoom')
  createRoom(socket: Socket, userName: string) {
    console.log('joinRoom');
    this.getWaitingRoom(socket, userName);
  }
}
