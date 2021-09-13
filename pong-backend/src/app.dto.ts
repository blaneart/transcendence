import { IsString, IsNumberString } from "class-validator";

export class getUserByNameDto {
  @IsString()
  value: string
}

export class getUserByIdDto {
  @IsNumberString()
  value: number
}

export class setNameDto {
  @IsString()
  value: string
}

export class setGamesDto {
  @IsNumberString()
  games: number

  @IsNumberString()
  wins: number
}