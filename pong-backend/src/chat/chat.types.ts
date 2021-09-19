import { Socket } from "socket.io";
import { UserPublic } from "../app.types";

export interface Room
{
  id: number,
  name: string,
  ownerID: number,
  restricted: boolean,
  hash: string
}

export interface Direct {
  id: number,
  userA: number,
  userB: number
}

export interface DirectMessageUpdate {
  id: number
  name: string
  message: string
  senderID: number
  type: ChatMessageType
  receiverId?: number
}

export enum ChatMessageType {
  TEXT = 0,
  GAME_INVITE
}

// The update we send to frontend to show messages
export interface ChatMessageUpdate {
  id: number,
  name: string,
  message: string,
  senderID: number
  sender: UserPublic
  type: ChatMessageType
  receiverId?: number   
}

// The update we send to frontend to show messages
export interface DirectMessageUpdate {
  id: number,
  name: string,
  message: string,
  senderID: number
  sender: UserPublic
}

interface User {
  id: number;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean
  status: number;
  elo: number;
}

// TypeScript needs to know that our auth guards append the user to the socket
export interface AuthenticatedSocket extends Socket {
  user: User
}