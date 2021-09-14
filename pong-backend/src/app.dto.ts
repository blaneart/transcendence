import { IsNumber, IsString, IsNumberString, IsNotEmpty } from "class-validator";

export class getUserByNameDto {
  @IsNotEmpty()
  @IsString()
  value: string
}

export class getUserByIdDto {
  @IsNotEmpty()
  @IsNumber()
  value: number
}

export class setNameDto {
  @IsNotEmpty()
  @IsString()
  value: string
}

export class setStatusDto {
  @IsNotEmpty()
  @IsNumber()
  value: number
}

export class setGamesDto {
  @IsNotEmpty()
  @IsNumberString()
  games: number

  @IsNotEmpty()
  @IsNumberString()
  wins: number
}

export class fakeUserDto {
  @IsString()
  @IsNotEmpty()
  newName: string
}


export class saveGameDto {
  @IsNotEmpty()
  @IsNumber()
  winner: number

  @IsNotEmpty()
  @IsNumber()
  loser: number

  @IsNotEmpty()
  @IsNumber()
  loserScore: number
}
