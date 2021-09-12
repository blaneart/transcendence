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

// The info we can show others about a given user
export interface UserPublic {
  id: number;
  id42: number
  name: string;
  avatar: string;
  games: number;
  wins: number;
  realAvatar: boolean;
}

// The update we send to frontend to show messages
export interface ChatMessageUpdate {
  id: number,
  name: string,
  message: string,
  senderID: number
  sender: UserPublic
}