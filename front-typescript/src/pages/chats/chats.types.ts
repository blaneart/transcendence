export interface Room {
  id: number,
  name: string
  ownerID: number
  owner_name: string
  restricted: boolean
}

// This is the front-end message: the sender, and the text.
export interface MessageType { 
  id: number,
  name: string,
  message: string,
  senderID: number
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
}
