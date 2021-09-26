import { IsString, IsInt, IsIn } from "class-validator";

export class LoginAttempt {
  @IsString()
  roomName: string

  @IsString()
  password: string
}

// The update we get from frontend to update the DB
export class DirectMessage {
  @IsString()
  text: string

  @IsString()
  userB: string
}

// The message we receive when an admin wants to ban a user
export class BanRequest {
  @IsString()
  roomName: string

  @IsInt()
  userId: number

  @IsInt()
  minutes: number
}

export class MakeAdminRequest {
  @IsString()
  roomName: string

  @IsInt()
  userId: number
}

// The update we get from frontend to update the DB
export class ChatMessage {
  // type: ChatMessageType,

  @IsString()
  text: string

  @IsString()
  room: string
}

export class RoomNameDto {
  @IsString()
  name: string
}

export class RejectDirectGameDto {
  @IsInt()
  inviteID: number

  @IsInt()
  interlocutorID: number
}

export class AcceptDirectGameDto {
  @IsInt()
  inviteID: number

  @IsInt()
  interlocutorID: number

  @IsString()
  gameRoomName: string
}

export class AcceptGameDto
{
  @IsInt()
  enemyID: number

  @IsInt()
  messageID: number

  @IsInt()
  roomName: string
}

export class RejectGameDto
{
  @IsInt()
  messageID: number

  @IsInt()
  enemyID: number
}