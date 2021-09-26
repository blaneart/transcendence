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
  GAME_INVITE,
  GAME_INVITE_EXPIRED,
  GAME_INVITE_REJECTED
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
  roomName?: string
}

// The update we send to frontend to show messages
export interface DirectMessageUpdate {
  id: number,
  name: string,
  message: string,
  senderID: number
  sender: UserPublic
  roomName?: string
}

interface User {
  id: number;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  wins: number;
  realAvatar: boolean
  status: number;
  elo: number;
  owner: boolean;
  banned: boolean;
  admin: boolean;
}

// TypeScript needs to know that our auth guards append the user to the socket
export interface AuthenticatedSocket extends Socket {
  user: User
}