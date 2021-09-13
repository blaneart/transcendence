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
}

// The update we send to frontend to show messages
export interface ChatMessageUpdate {
  id: number,
  name: string,
  message: string,
  senderID: number
  sender: UserPublic
}

// The update we send to frontend to show messages
export interface DirectMessageUpdate {
  id: number,
  name: string,
  message: string,
  senderID: number
  sender: UserPublic
}