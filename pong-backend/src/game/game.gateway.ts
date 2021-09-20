import { Logger, UseGuards } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { WSASERVICE_NOT_FOUND } from 'constants';
import { SocketAddress } from 'net';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
import { ProfileService } from '../profile/profile.service';
var uuid = require('uuid');
import {Pong, Ball, Paddle} from './game';
import { JwtWsAuthGuard } from 'src/auth/jwt-ws-auth.guard';
import { AuthenticatedSocket } from 'src/chat/chat.types';

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
  empowered: number;
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
    this.empowered = 0;
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

// This is an async version of the Array find method in Javascript
async function findAsyncSequential<T>(
  array: T[],
  predicate: (t: T) => Promise<boolean>,
): Promise<T | undefined> {
  for (const t of array) {
    if (await predicate(t)) {
      return t;
    }
  }
  return undefined;
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

    if (!client.data.user)
      return;

    let abandonedRoomName = null;
    let abandoningPlayerIndex = null;
    // Find the room where the leaving user was
    for (let room in this.rooms)
    {
      if (this.rooms[room].players.length === 2 && this.rooms[room].players[1].userId === client.data.user.id)
      {
        abandonedRoomName = room;
        abandoningPlayerIndex = 1;
      }
      else if (this.rooms[room].players[0].userId === client.data.user.id)
      {
        abandonedRoomName = room;
        abandoningPlayerIndex = 0;
      }
    }
    
    // If the room the user has abandoned was actually in a game
    if (abandonedRoomName && this.rooms[abandonedRoomName].ready)
    {
      // Settle this game via a 10:0 TKO
      this.endGame(abandonedRoomName, true, abandoningPlayerIndex);
    }
    this.logger.log(
      `Client disconnected: ${client.id} - ${this.connectedClients.length} connected clients.`
    );
  }

  // Return true, if the room with this name is available for joining
  // i.e. contains only one player, and that player is not yourself.
  // userId: our user id.
  async roomAvailable(roomName: string, userId: number): Promise<boolean>
  {
    const theRoom = this.server.sockets.adapter.rooms.get(roomName);
    if (theRoom.size < 2)
    {
      // If this is an empty room, something isn't right.
      if (theRoom.size == 0)
        return false;
      
      // If there is one player in the room, get their indentity
      const lonelyPlayer = (await this.server.in([...theRoom][0]).fetchSockets())[0];

      // Ensure we're not playing with ourself
      return (lonelyPlayer.data.user && lonelyPlayer.data.user.id !== userId);
    }
    return false;
  }

  getWaitingRoom = async (socket: AuthenticatedSocket, userName: string, userId: number, userElo: number) =>
  {
    let playerId;
    let ready = false;
    let roomName;

    // Check all rooms available for joining
    roomName = await findAsyncSequential(this.getActiveRooms(/*userInfo[3]*/), async (roomName) => await this.roomAvailable(roomName, userId));
    console.log('foundRoomName: ', roomName);
    console.log(userId, userName);
    /* creates new room if every room is full*/
    if (!roomName)
    {
      console.log('createRoom');
      roomName = uuid.v4();
      playerId = Math.random()>=0.5? 1 : 0;;
      if (!this.rooms[roomName])
        this.rooms[roomName] = {
          players: [],
          scores: [0,0],
          ball: new Ball(),
        }
        // console.log(roomName);
        // console.log(this.rooms[roomName].start);
        this.rooms[roomName].players[playerId] = new Player(userName, userId, playerId, userElo, socket.id, (600 - 100) / 2,);
    }

    /* or assigns player to a room with one player */
    else
    {
      ready = true;
      if (!this.rooms[roomName].players[0])
        playerId = 0;
      else
        playerId = 1;

      this.rooms[roomName].players[playerId] = new Player(userName, userId, playerId, userElo, socket.id, (600 - 100) / 2)
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
      client.to(roomName).emit('getPosition', new_pos[0], id);
    }
  }



  // Do everything necessary to end the game
  endGame(roomName: string, abandoned: boolean = false, abandoningId: number | null = null)
  {
    this.rooms[roomName].ready = false; // Prevent the timeout from settling the game

    let playerid = 1;
    if (this.rooms[roomName].players[0].id === 0)
      playerid = 0;

    // If one of the player has abandoned the game, the other one gets a 10:0 TKO
    if (abandoned)
    {
      this.rooms[roomName].scores[abandoningId] = 0
      this.rooms[roomName].scores[1 - abandoningId] = 10;
    }
    else if (this.rooms[roomName].scores[0] >= 10)
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

    this.server.to(roomName).emit('endGame', abandoned ? "abandoned" : null);
    this.server.to(roomName).emit('winner',
    this.rooms[roomName].scores[0] >= 10
    ? this.rooms[roomName].players[playerid].name
    : this.rooms[roomName].players[1 - playerid].name);
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
          if (this.rooms[roomName].ready) // if it is not ready, the game has been settled by abandon, no need to resettle
            this.endGame(roomName);
          clearInterval(interval);
        }

      this.server.to(roomName).emit('changeScore', this.rooms[roomName].scores);
      this.server.to(roomName).emit('getBallPosition', pong.ball.pos);
      this.server.to(roomName).emit('getPowerUp', pong.curr_powerUp);
      this.server.to(roomName).emit('getPaddles', pong.leftPaddle, pong.rightPaddle);

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
    client.join(roomName);
    let playerid = 1;
    if (this.rooms[roomName].players[0].id === 0)
      playerid = 0;
    this.server.to(client.id).emit('playersNames', this.rooms[roomName].players[playerid].name,
                            this.rooms[roomName].players[1 - playerid].name)
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

    return res/*.map(i => res[i].map*/;
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
    let i = 1;
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

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('joinRoom')
  createRoom(socket: AuthenticatedSocket, userInfo) { // [mapNb, boolPowerUps]
    console.log('joinRoom', userInfo[0], userInfo[1]);
  
    socket.data.user = socket.user; // Save user data for future use
    this.getWaitingRoom(socket, userInfo[0], userInfo[1], userInfo[2]);
  }
  
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