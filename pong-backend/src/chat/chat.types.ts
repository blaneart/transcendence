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