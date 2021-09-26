export interface Room {
  id: number,
  name: string
  ownerID: number
  owner_name: string
  restricted: boolean
  fav: number | null
}

// The public information about a user
export interface UserPublic {
  id: number;
  id42: number;
  name: string;
  avatar: string;
  games: number;
  elo: number;
  wins: number;
  realAvatar: boolean;
}

export enum ChatMessageType {
  TEXT = 0,
  GAME_INVITE,
  GAME_INVITE_EXPIRED,
  GAME_INVITE_REJECTED
}

// This is the front-end message: the sender, and the text.
export interface MessageType { 
  id: number,
  name: string,
  message: string,
  senderID: number
  sender: UserPublic
  type: ChatMessageType
  receiverId?: number
  roomName?: string
}

export interface Direct {
  id: number,
  userA: number,
  userB: number,
}

export interface DirectMessage {
  id: number
  text: string
  userB: number
}

export interface DirectMessageRequest {
  text: string
  userB: string
}

export interface DirectMessageUpdate {
  id: number,
  name: string,
  message: string,
  senderID: number
  sender: UserPublic
  type: ChatMessageType
  receiverId?: number
  roomName?: string
}
