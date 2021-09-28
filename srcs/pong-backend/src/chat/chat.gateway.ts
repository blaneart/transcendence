import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException} from "@nestjs/websockets";
import { Server } from "socket.io";
import { ChatService } from "./chat.service";
import { UseGuards, Logger, UseFilters, WsExceptionFilter, UnauthorizedException } from "@nestjs/common";
import { JwtWsAuthGuard } from "../auth/jwt-ws-auth.guard";
import { Room, Direct, ChatMessageUpdate, DirectMessageUpdate, AuthenticatedSocket, ChatMessageType } from "./chat.types";
import { UserPublic } from "src/app.types";
import { ProfileService } from "src/profile/profile.service";
import { LoginAttempt, DirectMessage, BanRequest, ChatMessage, RejectDirectGameDto, AcceptDirectGameDto, AcceptGameDto, RejectGameDto } from "./chat.dto";
import { Settings } from "http2";


import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

var uuid = require('uuid');


const PORT_TWO = process.env.PORT_TWO ? parseInt(process.env.PORT_TWO) : 3003;

@Catch(UnauthorizedException)
export class UnauthorizedChatFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    host.switchToWs().getClient().emit('unauthorized');
  }
}

@UseFilters(new UnauthorizedChatFilter())
@WebSocketGateway(PORT_TWO, { cors: true })
export class ChatGateway {
  constructor (private readonly chatService: ChatService, private readonly profileService: ProfileService) {}

  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  // Once we've authenticated the user, add them to the SocketIO room
  async join_room(client: AuthenticatedSocket, room: Room)
  {
    // Leave a join trail in the DB
    this.chatService.joinRoomByID(client.user.id, room.id);

    // Add the client to the SocketIO room
    client.join(room.name);
    
    // Notify others that someone joined
    this.server.to(room.name).emit("roomUpdate", "client joined");
    
    // Get the history of the messages
    // const messages = await this.chatService.getRoomMessages(room.name);
    const update: ChatMessageUpdate[] = await this.chatService.getRoomMessageUpdates(room.name);
    
    // And send them to the newly joined user
    this.server.to(client.id).emit("initialMessages", update);
  }

  // Handle a request to join a room
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('requestJoin')
  async handleEvent(client: AuthenticatedSocket, roomName: string) {

    // Manually validate room name
    if (!roomName || roomName === "")
      throw new WsException("Bad request");

    const room = await this.chatService.findRoomByName(roomName);

    // Store the user in the data property that is always accessible
    client.data.user = client.user;

    // Ensure room exists
    if (room === null)
    {
      throw new WsException("Room not found");
    }

    // Ensure room is not restricted (if it is, ask to log in)
    if (room.restricted)
    {
      return this.server.to(client.id).emit("loginRequest");
    }

    // Ensure the user is not banned in this room
    if (await this.chatService.isBanned(client.user.id, room.id))
      return this.server.to(client.id).emit("banned");

    // Finalize room join
    this.join_room(client, room);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('login')
  async handleLogin(client: AuthenticatedSocket, data: LoginAttempt)
  {
    const room = await this.chatService.findRoomByName(data.roomName);

    if (data.roomName === "")
    {
      throw new WsException("Room name empty");
    }

    // Ensure room exists
    if (room === null)
    {
      throw new WsException("Room not found");
    }

    // Ensure room is restricted (if it isn't, you can just join)
    if (!(room.restricted))
    {
      throw new WsException("Room is open, you should just join");
    }

    // Ensure the user is not banned in this room
    if (await this.chatService.isBanned(client.user.id, room.id))
      return this.server.to(client.id).emit("banned");

    // Ensure the passworkd is not empty
    if (data.password === "")
    {
      throw new WsException("Empty password");
    }

    // Compare the password with the stored hash
    const response: boolean = await this.chatService.checkPassword(room, data.password);

    // Ensure the password was a match
    if (response !== true)
    {
      // Kick the person out
      this.server.to(client.id).emit('wrongPassword');
      throw new WsException("Wrong password");
    }

    // Finalize room join
    this.join_room(client, room);
  }

  
  // Handle a new message
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('chatMessage')
  async handleChatMessage(client: AuthenticatedSocket, message: ChatMessage) {

    // Find the room in our database
    const room = await this.chatService.findRoomByName(message.room);

    // Ensure room exists
    if (!room)
    {
      throw new WsException("Room not found");
    }

    // Check if the user has joined this room
    const canMessage = await this.chatService.checkUserJoined(room, client.user.id);

    // Ensure the user joined this room
    if (canMessage !== true)
    {
      throw new WsException("You must log in the room to write in it");
    }

    // Ensure the user is not muted
    if (await this.chatService.isMuted(client.user.id, room.id))
      throw new WsException("You are muted");

    // Save the new message to our database
    const savedMessage = await this.chatService.sendMessage(client.user.id, message.room, message.text);

    // Get the sender info for the update
    const senderUser = await this.profileService.getUserById(client.user.id) as UserPublic;
    
    // Create a new update for the clients
    const newMessage: ChatMessageUpdate = {
      id: savedMessage.id, // The id comes from our database
      name: client.user.name, // The name is authenticated
      message: message.text,
      senderID: client.user.id,
      sender: senderUser,
      type: ChatMessageType.TEXT
    };

    // Send the update to all other clients, including the sender
    this.server.to(message.room).emit("newMessage", newMessage);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('deleteRoom')
  async handleDelete(client: AuthenticatedSocket, roomName: string) {

    // Manually validate room name
    if (!roomName || roomName === "")
      throw new WsException("Bad request");

    // Find the room we're talking about
    const room = await this.chatService.findRoomByName(roomName);

    // Ensure the room exists
    if (!room)
      throw new WsException("Room not found");

    // Ensure the sender owns the room
    if (room.ownerID !== client.user.id)
      throw new WsException("You have to own this room to delete it.");

    // Kick all the users from the room
    this.server.to(room.name).emit("roomDeleted");
    this.server.socketsLeave(room.name);

    // Delete the room from the database
    this.chatService.deleteRoom(room.id);

    // Delete all participations from the database
    this.chatService.deleteAllParticipations(room);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('disconnect')
  async handleDisconnect(client: AuthenticatedSocket) {
    // Leave all rooms
    if (client.user)
      this.chatService.leaveAllRooms(client.user.id);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('restrictRoom')
  async handleRestrict(client: AuthenticatedSocket, attempt: LoginAttempt) {
    // Find the room
    const room = await this.chatService.findRoomByName(attempt.roomName);

    // Ensure the room exists
    if (!room)
      throw new WsException("Room not found");

    // Ensure the sender owns the room
    if (room.ownerID !== client.user.id)
      throw new WsException("You have to own the room to make it private");

    // Restrict the room in our database
    const newRoom = await this.chatService.restrictRoom(attempt.roomName, attempt.password);

    this.server.to(room.name).emit("error", "This room is now private :)");
    this.server.to(room.name).emit("updateRoomStatus", newRoom.restricted);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('unrestrictRoom')
  async handleUnrestrict(client: AuthenticatedSocket, roomName: string) {
    // Manually validate room name
    if (!roomName || roomName === "")
      throw new WsException("Bad request");

    // Find the room
    const room = await this.chatService.findRoomByName(roomName);

    // Ensure the room exists
    if (!room)
      throw new WsException("Room not found");

    // Ensure the sender owns the room
    if (room.ownerID !== client.user.id)
      throw new WsException("You have to own the room to make it public");

    // Restrict the room in our database
    const newRoom = await this.chatService.unrestrictRoom(roomName);

    this.server.to(room.name).emit("error", "This room is now without password");
    this.server.to(room.name).emit("updateRoomStatus", newRoom.restricted);
  }

  // Ban a user
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('banUser')
  async handleBanUser(client: AuthenticatedSocket, data: BanRequest) {
    // Find the room in our database
    const room = await this.chatService.findRoomByName(data.roomName);

    // Ensure the room exists
    if (!room) 
      throw new WsException("Room not found");

     // Ensure the sender is the room owner
     if (!(await this.chatService.isAdmin(client.user.id, room.id))
     && client.user.id !== room.ownerID)
      throw new WsException("You must be the room owner or an administrator to ban people");

    // Ensure the number of minutes is correct
    if (data.minutes <= 0 || isNaN(data.minutes) || !Number.isInteger(data.minutes))
    {
      client.emit('error', "Wrong number of minutes");
      throw new WsException("Incorrect number of minutes");
    }

    // Ensure the user is not already banned
    const alreadyBanned = await this.chatService.isBanned(data.userId, room.id);
    if (alreadyBanned === true)
    {
      this.server.to(client.id).emit('error', "This user is already banned, sorry.");
      throw new WsException("This user is already banned");
    }

    // Create a ban record in our database
    const response = await this.chatService.banUser(data.userId, room.id, data.minutes);

    // Kick the user out from the room
    const socketsInTheRoom =  await this.server.in(room.name).fetchSockets()
    for (let socket of socketsInTheRoom)
    {
      if (socket.data.user && socket.data.user.id === data.userId )
      {
        this.server.to(socket.id).emit("banned");
        socket.leave(room.name);
      }
    }
  }

  // Mute a user
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('muteUser')
  async handleMuteUser(client: AuthenticatedSocket, data: BanRequest) {

    // Find the room in our database
    const room = await this.chatService.findRoomByName(data.roomName);

    // Ensure the room exists
    if (!room) 
      throw new WsException("Room not found");

    // Ensure the sender is the room owner
    if (!(await this.chatService.isAdmin(client.user.id, room.id))
            && client.user.id !== room.ownerID)
      throw new WsException("You must be the room owner or an administrator to mute people");

    // Ensure the number of minutes is correct
    if (data.minutes <= 0 || isNaN(data.minutes) || !Number.isInteger(data.minutes))
    {
      client.emit("error", "Wrong number of minutes");
      throw new WsException("Incorrect number of minutes");
    }


    // Ensure the user is not already muted
    const alreadyMuted = await this.chatService.isMuted(data.userId, room.id);

    if (alreadyMuted === true)
    {
      this.server.to(client.id).emit('error', 'This user is already muted, sorry');
      throw new WsException("This user is already muted");
    }

    // Add a mute record to our database
    const mutedUntil = await this.chatService.muteUser(data.userId, room.id, data.minutes);

    // Send the muted person a nice message
    const socketsInTheRoom =  await this.server.in(room.name).fetchSockets()
    for (let socket of socketsInTheRoom)
    {
      if (socket.data.user && socket.data.user.id === data.userId )
      {
        this.server.to(socket.id).emit("muted", data.minutes);
      }
    }
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('makeAdmin')
  async handleMakeAdmin(client: AuthenticatedSocket, data: BanRequest) {

    // Find the room in our database
    const room = await this.chatService.findRoomByName(data.roomName);

    // Ensure the room exists
    if (!room) 
      throw new WsException("Room not found");

    // Ensure the caller has the rights to nominate admins
    if (client.user.id !== room.ownerID)
      throw new WsException("You must be the owner of the room to add admins");

    if (await this.chatService.isAdmin(data.userId, room.id))
      throw new WsException("This person is already admin");
    // Make the person admin in the database
    await this.chatService.addAdmin(data.userId, room.id);

    // Let the new admin know
    this.server.to(room.name).emit("promoted", data.userId);
  }

 // Once we've authenticated the user, add them to the SocketIO room
  async join_direct_convo(client: AuthenticatedSocket, direct: Direct)
  {
   // Add the client to the SocketIO room
   client.join(`direct_${direct.id}`);
   
   // Get the history of the messages
   const messages = await this.chatService.getAllDirectUpdates(direct.id);
   
   // And send them to the newly joined user
   this.server.to(client.id).emit("initialDirectMessages", messages);
  }

  // Handle a request to join a room
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('requestJoinDm')
  async handleJoinDm(client: AuthenticatedSocket, userName: string) {

    // Manually validate username
    if (!userName || userName === "")
    {
      client.emit("notFound");
      throw new WsException("Bad request");
    }

      // Find the user instance in our database
    const user = await this.profileService.getUserByName(userName);

    // Ensure the user we're talking about exists
    if (!user || user.id === client.user.id)
    {
      client.emit("notFound");
      throw new WsException("User not found");
    }

    // Find the direct conversation in our database
    let direct = await this.chatService.findDirect(client.user.id, user.id);

    // Ensure direct conversation exists
    if (!direct)
      direct = await this.chatService.createDirect(client.user.id, user.id);
    
    // Save the user data so it's easier to access
    client.data.user = client.user;

    // Finalize room join
    this.join_direct_convo(client, direct);
  }

  // Handle a new message
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('directMessage')
  async handleDirectMessage(client: AuthenticatedSocket, message: DirectMessage) {

    // Find the person we're talking to
    const interlocutor = await this.profileService.getUserByName(message.userB);

    // Ensure the interlocutor exists
    if (!interlocutor)
      throw new WsException("User not found");

    // Find the direct convo in our database
    const direct = await this.chatService.findDirect(client.user.id, interlocutor.id);

    // Ensure room exists
    if (!direct)
      throw new WsException("Conversation not found");

    // Save the new message to our database
    const savedMessage = await this.chatService.sendDirectMessage(direct.id, client.user.id, message.text);

    // Create an update instance
    const newMessage: DirectMessageUpdate = {
      id: savedMessage.id,
      name: client.user.name,
      message: message.text,
      senderID: client.user.id,
      sender: client.user as UserPublic,
      type: ChatMessageType.TEXT
    }

    // Send the update to other side
    this.server.to(`direct_${direct.id}`).emit("newDirectInvite", newMessage, uuid.v4());
  }


  // Game invitation methods by ablanar


  getRoomNameBySocket = (socket: AuthenticatedSocket) => {
    const arr = Array.from(socket.rooms);
    const filtered = arr.filter(room => room !== socket.id)
    return filtered[0];
  }

  async handleChatGameInvite(client: AuthenticatedSocket, roomName: string, enemyId: number)
  {
    const room = await this.chatService.findRoomByName(roomName);

    // Ensure room exists
    if (!room)
    {
      throw new WsException("Room not found");
    }

    // Check if the user has joined this room
    const canMessage = await this.chatService.checkUserJoined(room, client.user.id);

    // Ensure the user joined this room
    if (canMessage !== true)
    {
      throw new WsException("You must log in the room to write in it");
    }
    // Ensure the user is not muted
    if (await this.chatService.isMuted(client.user.id, room.id))
      throw new WsException("You are muted");
    let enemyName = "you";
    const socketsInTheRoom =  await this.server.in(roomName).fetchSockets()
    for (let socket of socketsInTheRoom)
    {

      if (socket.data.user && socket.data.user.id === enemyId )
         enemyName = socket.data.user.name
      
    }

    const gameRoomName = uuid.v4();

    // Save the new message to our database
    const savedMessage = await this.chatService.sendMessage(client.user.id, roomName, "invited "+ enemyName+" for a game",  ChatMessageType.GAME_INVITE, enemyId, gameRoomName);

    // Get the sender info for the update
    const senderUser = await this.profileService.getUserById(client.user.id) as UserPublic;
    

    // Create a new update for the clients
    const newMessage: ChatMessageUpdate = {
      id: savedMessage.id, // The id comes from our database
      name: client.user.name, // The name is authenticated
      message:  "invited "+ enemyName+" for a game",
      senderID: client.user.id,
      sender: senderUser,
      type: ChatMessageType.GAME_INVITE,
      receiverId: enemyId,
      roomName: gameRoomName
    };

    // Send the update to all other clients, including the sender
    this.server.to(roomName).emit("newInvite", newMessage, gameRoomName);

  }

  async handleDirectGameInvite(client: AuthenticatedSocket, roomName: string, enemyId: number)
  {
    const directConvo = await this.chatService.findDirect(client.user.id, enemyId);

    // Ensure room exists
    if (!directConvo)
    {
      throw new WsException("Direct conversation not found");
    }

    const gameRoomName = uuid.v4();

    // Save the new message to our database
    // const savedMessage = await this.chatService.sendMessage(client.user.id, roomName, "keklol");
    const savedMessage = await this.chatService.sendDirectMessage(directConvo.id, client.user.id, 'game invite', ChatMessageType.GAME_INVITE, enemyId, gameRoomName);

    // Get the sender info for the update
    const senderUser = await this.profileService.getUserById(client.user.id) as UserPublic;
    

    const newMessage: DirectMessageUpdate = {
      id: savedMessage.id,
      name: client.user.name,
      message: "Invited you for a game",
      senderID: client.user.id,
      sender: client.user as UserPublic,
      type: ChatMessageType.GAME_INVITE,
      receiverId: enemyId,
      roomName: gameRoomName
    }

    // Send the update to other side
    this.server.to(`direct_${directConvo.id}`).emit("newDirectInvite", newMessage, roomName);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('acceptGame')
  async acceptGame(client: AuthenticatedSocket, data: AcceptGameDto)
  {
  const roomName = data.roomName;
    const enemyId = data.enemyID;
    const messageid = data.messageID;
    // const GameRoomName = data.gameRoomName;
    // if (roomName.startsWith('direct_'))
    //   this.acceptDirect(client, enemyId, messageid, GameRoomName, roomName);
    // else
    this.acceptChat(client, enemyId, messageid, roomName);
  }

  async acceptChat(client: AuthenticatedSocket, enemyId: number, messageid: number, roomName: string)
  {
    const update: ChatMessageUpdate[] = await this.chatService.getRoomMessageUpdates(roomName);
    let objIndex = update.findIndex((obj => obj.id === messageid));
    update[objIndex].type = ChatMessageType.GAME_INVITE_EXPIRED;
    this.chatService.updateMessageById(update[objIndex].id, {type: update[objIndex].type})


    const socketsInTheRoom =  await this.server.in(roomName).fetchSockets()
    this.server.to(client.id).emit("initialMessages", update);

    if (!update[objIndex].roomName)
      throw new WsException("No room name");

    for (let socket of socketsInTheRoom)
    {

      if (socket.data.user && socket.data.user.id === enemyId )
      {
        this.server.to(socket.id). emit("initialMessages", update);
        this.server.to(socket.id).emit("challengeAccepted", update[objIndex].roomName);
      }
    }
  }

  @SubscribeMessage('acceptDirectGame')
  async acceptDirect(client: AuthenticatedSocket, data: AcceptDirectGameDto)
  {
    const enemyId = data.interlocutorID;
    const messageid = data.inviteID;
    const GameRoomName = data.gameRoomName;

    // Find the direct conversation in our database
    let direct = await this.chatService.findDirect(client.user.id, enemyId);
    const roomName = `direct_${direct.id}`

    // Ensure direct conversation exists
    if (!direct)
      throw new WsException("Direct conversation not found");

    // Get all the messages in the room
    const update = await this.chatService.getAllDirectUpdates(direct.id);

    // Find the invitation among them
    let objIndex = update.findIndex((obj => obj.id === messageid));

    if (objIndex === -1)
      throw new WsException("Invitation not found");

    // Mark the invitation as accepted
    this.chatService.updateDirectMessageById(update[objIndex].id, {type: ChatMessageType.GAME_INVITE_EXPIRED})

    // Refresh all users in the room
    this.server.to(roomName).emit('initialMessages', await this.chatService.getAllDirectUpdates(direct.id));
    
    if (!update[objIndex].roomName)
      throw new WsException('No room name');

    // Let the invite sender know we want to play
    this.server.to(roomName).emit('challengeAccepted', update[objIndex].roomName);
  }


  async handleChatGameReject(messageid:number, roomName: string, client: AuthenticatedSocket)
  {
    const update: ChatMessageUpdate[] = await this.chatService.getRoomMessageUpdates(roomName);
    let objIndex = update.findIndex((obj => obj.id == messageid));

    //Log object to Console.
    //Update object's name property.
    update[objIndex].type = ChatMessageType.GAME_INVITE_REJECTED;
    this.chatService.updateMessageById(update[objIndex].id, {type: update[objIndex].type})
    const socketsInTheRoom =  await this.server.in(roomName).fetchSockets()
    for (let socket of socketsInTheRoom)
    {

      if (socket.data.user && socket.data.user.id === update[objIndex].senderID)      
        this.server.to(socket.id). emit("initialMessages", update);
    }
    this.server.to(client.id).emit("initialMessages", update);
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('rejectDirectGame')
  async handleDirectGameReject(client: AuthenticatedSocket, data: RejectDirectGameDto)
  {
    // Find the direct conversation in our database
    let direct = await this.chatService.findDirect(client.user.id, data.interlocutorID);

    // Ensure direct conversation exists
    if (!direct)
      throw new WsException("Room doesn't exist");

    // Get all the messages in the room
    const update = await this.chatService.getAllDirectUpdates(direct.id);

    // Find the invitation among them
    let objIndex = update.findIndex((obj => obj.id === data.inviteID));

    if (objIndex === -1)
      throw new WsException("Invitation not found");

    // Mark the message as rejected in our database
    await this.chatService.updateDirectMessageById(update[objIndex].id, {type: ChatMessageType.GAME_INVITE_REJECTED});
  
    // Refresh all participants
    this.server.to(`direct_${direct.id}`)
      .emit("initialDirectMessages",
        await this.chatService.getAllDirectUpdates(direct.id));
  }


  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('rejectGame')
  async rejectGame(client: AuthenticatedSocket, data: RejectGameDto)
  {
    const messageid = data.messageID;
    const enemyId = data.enemyID;

    let roomName = this.getRoomNameBySocket(client);

    // if (roomName.startsWith('direct_'))
    //   this.handleDirectGameReject(client, enemyId, messageid, roomName);
  
    this.handleChatGameReject(messageid, roomName, client);

  
  
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('sendGameInvitation')
  async sendGameInvite(client: AuthenticatedSocket, enemyId: number)
  {
    if ((!enemyId && enemyId !== 0) || enemyId < 0 || !Number.isInteger(enemyId))
      throw new WsException('Bad enemy id');
    const roomName: string = this.getRoomNameBySocket(client);
    if (roomName.startsWith('direct_'))
    {
      // This is a direct message
      this.handleDirectGameInvite(client, roomName, enemyId);
    }
    else
    {
      // This is a regular chat message
      this.handleChatGameInvite(client, roomName, enemyId);
    }
  }
}