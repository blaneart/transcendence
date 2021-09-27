import { IsString, IsInt, IsIn, IsNumber, isString } from "class-validator";
import { Settings } from "src/app.types";


export class joinRoomDto {
    @IsString()
    userName: string

    @IsNumber()
    userId: number

    @IsNumber()
    userElo: number

    gameSettings: Settings
}

export class joinRoomInviteDto {
    @IsString()
    userName: string

    @IsNumber()
    userId: number

    gameSettings?: Settings | null

    @IsString()
    gameRoomName:string;
}