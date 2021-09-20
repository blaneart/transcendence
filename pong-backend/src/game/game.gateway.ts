import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { WSASERVICE_NOT_FOUND } from 'constants';
import { SocketAddress } from 'net';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
import { ProfileService } from '../profile/profile.service';
var uuid = require('uuid');
import {Pong, Ball, Paddle} from './game';

// import Ball from './game/game';

export class Player {
  name: string;
  userId: number;
  id: number;
  elo: number;
  paddle: Paddle;
  socketId: string;
  position: number;
  dp: number;
  constructor(name: string, userId: number, id: number, elo: number, socket: string, pos: number)
  {
    this.paddle = new Paddle();
    this.name = name;
    this.userId = userId;
    this.id = id;
    this.elo = elo;
    this.socketId = socket;
    this.paddle.pos.y = pos;
    this.paddle.pos.x = id === 0 ? 30 : 800 - 30;
    this.dp = 0;
  }

  get Name()
  {
    return this.name;
  }

  get UserId()
  {
    return this.userId;
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

  set Position(position: number)
  {
    this.position = position;
  }
}

@WebSocketGateway(3002, { cors: true })
export class GameGateway implements OnGatewayInit {
  rooms = {};
  constructor(private readonly gameService: GameService, private readonly profileService: ProfileService){}

  @WebSocketServer() 
  server: Server;
  connectedClients = [];
  start = Math.floor((new Date).getTime() / 1000);
  playersIdAndElo = Array<[number, number]>();
  private logger =  new Logger('GameGateway');

  handleConnection(client: Socket)
  {
    this.connectedClients = [...this.connectedClients, client.id]
    this.logger.log(
      `Client connected: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
  }

  handleDisconnect(client: Socket) {
    this.connectedClients = this.connectedClients.filter(
      connectedClient => connectedClient !== client.id
    );
    let roomName = this.getRoomNameBySocket(client);
    // if (this.rooms[roomName])
    //   this.rooms[roomName].ready = false;
    // this.server.emit('getListOfRooms', this.showRooms());
    this.logger.log(
      `Client disconnected: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
  }

  getActiveTimelyRoom = (count: number) => {
    const arr = Array.from(this.server.sockets.adapter.rooms);
    console.log('arr');
    console.log(arr);
    const filtered = arr.filter(room => !room[1].has(room[0]))
    const res = filtered.map(i => i[0]);

    console.log('res');
    console.log(res);
    if (this.rooms[res[0]])
    {
      console.log('this.rooms[res[0]]');
      console.log(this.rooms[res[0]]);

      if (this.rooms[res[0]].players.length < 3)
      {
        console.log('this.rooms[res[0]].players.length < 3');
        console.log(this.rooms[res[0]].players.length < 3);
        if ((count - this.rooms[res[0]].start < 10))
        {
          console.log('(count - this.rooms[res[0]].start < 10)');
          console.log((count - this.rooms[res[0]].start < 10));
        }
        else
        {
          console.log('(count - this.rooms[res[0]].start)');
          console.log((count - this.rooms[res[0]].start));
        }
      }
      else
      {
        console.log('this.rooms[res[0]].players.length');
        console.log(this.rooms[res[0]].players.length);
      }
    }
    if (res.length && this.rooms[res[0]] && this.rooms[res[0]].players.length < 3 && (count - this.rooms[res[0]].start < 10))
      return (res[0]);
    return null;
  }

  getWaitingRoom = (socket: Socket, userName: string, userId: number, userElo: number, bool: Boolean = false) =>
  {
    let playerId = 0;
    let ready = false;
    let roomName;
    let count = Math.floor((new Date()).getTime() / 1000);

    roomName = this.getActiveTimelyRoom(count);
    const a = roomName;
    if (a)
    {
      console.log('roomName');
      console.log(roomName);
    }
    console.log('userId, userName, userElo');
    console.log(userId, userName, userElo);
    /* creates new room if every room is full*/
    if (!roomName || bool)
    {
      console.log('createRoom');
      roomName = uuid.v4();
      playerId = 0;
      if (!this.rooms[roomName])
        this.rooms[roomName] = {
          players: [],
          scores: [0,0],
          ball: new Ball(),
          start: Math.floor((new Date()).getTime() / 1000),
        }
        console.log(roomName);
        console.log(this.rooms[roomName].start);
        this.rooms[roomName].players[playerId] = new Player(userName, userId, playerId, userElo, socket.id, (600 - 100) / 2,);
    }

    /* or assigns player to a room with one player */
    else
    {
      console.log('HERE');
      console.log('this.rooms[roomName].players.length');
      console.log(this.rooms[roomName].players.length);
      console.log('count - this.rooms[roomName].start');
      console.log(count - this.rooms[roomName].start);
      if (this.rooms[roomName].players.length == 2 && count - this.rooms[roomName].start < 10)
      {
        console.log('first true');
        if (Math.abs(this.rooms[roomName].players[1] - this.rooms[roomName].players[0]) > Math.abs(this.rooms[roomName].players[1] - userElo))
        {
          console.log('CHANGE PLAYER[1]');
          playerId = 1;
          delete this.rooms[roomName].players[playerId];
          this.rooms[roomName].players[playerId] = new Player(userName, userId, playerId, userElo, socket.id, (600 - 100) / 2)
        }
        else
        {
          console.log('NEW ROOM');
          this.getWaitingRoom(socket, userName, userId, userElo, true);
          return;
        }
      }
      else
        console.log('NO CHANGE AT ALL')
      if (this.rooms[roomName].players.length == 1)
      {
        if (this.rooms[roomName].players[0])
          playerId = 1;
      }
      this.rooms[roomName].players[playerId] = new Player(userName, userId, playerId, userElo, socket.id, (600 - 100) / 2)
      
      //let timeout = setTimeout(() => {
      //   // If the third person connects before this, they will replace
      //   //...
      //   startGame();
      // }, 10*1000);

      timeout.clearTimeout();

      // If the room is empty
      


      ready = true;
      this.rooms[roomName].ready = true;
    }

    socket.join(roomName);
    this.server.to(socket.id).emit('gameId', roomName);
    this.server.to(socket.id).emit('getId', playerId);
    if (ready)
    {
      console.log('ready = 1')
      this.server.to(this.rooms[roomName].players[1].socketId).emit('enemyname', this.rooms[roomName].players[0].name);
      this.server.to(this.rooms[roomName].players[0].socketId).emit('enemyname', this.rooms[roomName].players[1].name);
      this.server.to(roomName).emit('ready');
      this.server.emit('getListOfRooms', this.showRooms());
      this.pushBall(roomName);
    }
  }

  @SubscribeMessage('playerPos')
  updatePlayers(client: Socket, new_pos: number[])
  {

    let roomName = this.getRoomNameBySocket(client)
    let id = 0;
    if (roomName && this.rooms[roomName])
    {
    if (this.rooms[roomName].players[0].socketId == client.id)
      id = this.rooms[roomName].players[0].id;
    else
      id = this.rooms[roomName].players[1].id;
    this.rooms[roomName].players[id].paddle.pos.y = new_pos[0];
    this.rooms[roomName].players[id].dp = new_pos[1];
    client.broadcast.emit('getPosition', new_pos[0], id);
    }
  }

  getNewMmr(winner_old_mmr, loser_old_mmr)
  {
    let mmr = {winner_new_mmr: 0, loser_new_mmr: 0};
  
    let win_percentage_winner = 1 / (1 + (10 ** ((loser_old_mmr - winner_old_mmr) / 400)));
    let win_percentage_loser = 1 / (1 + (10 ** ((winner_old_mmr - loser_old_mmr) / 400)));

    mmr.winner_new_mmr = Math.floor(winner_old_mmr + 20 * (1 - win_percentage_winner));
    mmr.loser_new_mmr = Math.floor(loser_old_mmr + 20 * (-win_percentage_loser));
    
    console.log(mmr);
    return (mmr);
  }

  saveAndUpdate(roomName: string, winner_id: number, winner_elo: number, loser_id: number, loser_elo: number, loser_score: number)
  {
    let newMmrs = this.getNewMmr(winner_elo, loser_elo);
    this.gameService.saveGame(winner_id, loser_id, loser_score);
    this.profileService.updateUserById(winner_id, {elo: newMmrs.winner_new_mmr});
    this.profileService.updateUserById(loser_id, {elo: newMmrs.loser_new_mmr});
  }

  pushBall(roomName: string)
  {
    const callback = (dt: number, pong: Pong) => {
      // if (!this.rooms[roomName])
      //   clearInterval(interval)
      if (this.rooms[roomName]  && this.rooms[roomName].players[0].id === 0)
        pong.update(dt /1000, this.rooms[roomName].players[0], this.rooms[roomName].players[1]);
      else 
        pong.update(dt /1000, this.rooms[roomName].players[1], this.rooms[roomName].players[0]);
        if (this.rooms[roomName].scores[0] >= 10 || this.rooms[roomName].scores[1] >= 10)
        {
          console.log('ended');
          let playerid = 1;
          if (this.rooms[roomName].players[0].id === 0)
            playerid = 0;
          if (this.rooms[roomName].scores[0] >= 10)
            this.saveAndUpdate(roomName,
              this.rooms[roomName].players[playerid].userId,
              this.rooms[roomName].players[playerid].elo,
              this.rooms[roomName].players[1 - playerid].userId,
              this.rooms[roomName].players[1 - playerid].elo,
              this.rooms[roomName].scores[1]);
          else
            this.saveAndUpdate(roomName,
              this.rooms[roomName].players[1 - playerid].userId,
              this.rooms[roomName].players[1 - playerid].elo,
              this.rooms[roomName].players[playerid].userId, 
              this.rooms[roomName].players[playerid].elo,
              this.rooms[roomName].scores[0]);

          this.server.emit('changeScore', this.rooms[roomName].scores)

          this.server.to(roomName).emit('endGame');
          clearInterval(interval);
        }

      this.server.to(roomName).emit('changeScore', this.rooms[roomName].scores);
      this.server.to(roomName).emit('getBallPosition', pong.ball.pos);

  };
    // let roomName = this.getRoomNameBySocket(client);
    var interval = null;
    let dt  = 10;
    var myBall = this.rooms[roomName].ball;   
    let pong = new Pong(myBall, this.rooms[roomName].scores);
    interval = setInterval(function() {callback(dt, pong)}, dt);
  }

  @SubscribeMessage('watchMatch')
  watchMatch(client: Socket, roomName: string)
  {
    console.log(roomName);
    client.join(roomName)
    console.log(this.server.sockets.adapter.rooms.get(roomName).size)
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



  // @SubscribeMessage('msgToServer')
  // handleMessage(client: Socket, text: number)  {
  //       client.broadcast.emit('getPosition', text);
  // }
  


  // @SubscribeMessage('launchBall')
  // ballLaunch(socket: Socket) {
  //   let message = {
  //     pos_x: 400,
  //     pos_y: Math.random() * 600,
  //     vel_x: 500 * (Math.random() > .5 ? 1 : -1),
  //     vel_y: 500 * (Math.random() * 2  -1)
  //   }
  //   this.server.emit('getBallSpeed', message)
  // }


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
  leaveRoom(socket: Socket)
  {
    console.log('leaveRoom');

    let roomName = this.getRoomNameBySocket(socket);
    if (this.rooms[roomName])
      this.rooms[roomName].ready = false;

    socket.leave(roomName);
    if (this.rooms.hasOwnProperty(roomName)) // true
      delete this.rooms[roomName];
    this.server.emit('getListOfRooms', this.showRooms());
  }

  getClosestPlayerIdByElo()
  {
    var getCloseToMe = this.playersIdAndElo[0][1];
    var biggest = 1000;
    let i = 0;
    let rtn_me = -1;
    while (i < this.playersIdAndElo.length)
    {
      if (Math.abs(this.playersIdAndElo[i][1] - getCloseToMe) < biggest)
      {
        biggest = Math.abs(this.playersIdAndElo[i][1] - getCloseToMe);
        rtn_me = i;
      }
      i++;
    }
    return (rtn_me);
  }

  @SubscribeMessage('joinRoom')
  createRoom(socket: Socket, userInfo) {
    console.log('joinRoom');
    // this.playersIdAndElo.push([userInfo[1], userInfo[2]]);
    // console.log('here');
    this.getWaitingRoom(socket, userInfo[0], userInfo[1], userInfo[2]);

    // if (this.playersIdAndElo.length > 3)
    // {
    //   console.log('length > 2');
    //   let meIn = (this.playersIdAndElo[0][0] == userInfo[1]) ? 1 : 2;
    //   if (this.playersIdAndElo[0][0] == userInfo[1])
    //   {
    //     this.getWaitingRoom(socket, userInfo[0], userInfo[1], userInfo[2])
    //   }
    //   if (userInfo[1] == this.getClosestPlayerIdByElo())
    //   {
    //     this.getWaitingRoom(socket, userInfo[0], userInfo[1], userInfo[2])
    //   }
    // }
  }


  // @SubscribeMessage('QueueMain')
  // QueueMain() {
  //   console.log('QueueMain');
  //   console.log(this.playersIdAndElo);
  // }

  // @SubscribeMessage('joinQueue')
  // joinQueue(socket: Socket, userInfo) {
  //   console.log('joinQueue');
  //   this.playersIdAndElo.push(userInfo[1]);
  //   console.log(this.playersIdAndElo);
  //   // this.server.emit(socket.id, 'QueueMain');
  // }

  // @SubscribeMessage('leaveQueue')
  // leaveQueue(socket: Socket, userInfo) {
  //   console.log('leaveQueue');
  //   this.playersIdAndElo.push(userInfo[1]);
  //   console.log(this.playersIdAndElo);
  //   // this.server.emit(socket.id, 'QueueMain');
  // }
  
  @SubscribeMessage('getListOfRooms')
  sendRooms(client: Socket)
  {
    this.server.to(client.id).emit('getListOfRooms', this.showRooms());
  }

  showRooms = () =>
  {
    var roomList: string[];

    roomList = this.getActiveRooms().filter(roomName => 
        this.rooms[roomName]?.ready === true
           )
    console.log(roomList);
    console.log(this.getActiveRooms())
    return roomList;
  }
}



export default Player;