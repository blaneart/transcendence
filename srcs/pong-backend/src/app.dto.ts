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

export class setEloDto {
  @IsNotEmpty()
  @IsNumber()
  winner_id: number

  @IsNotEmpty()
  @IsNumber()
  loser_id: number

  @IsNotEmpty()
  @IsNumber()
  new_winner_elo: number

  @IsNotEmpty()
  @IsNumber()
  new_loser_elo: number
}

export class setGamesDto {
  @IsNotEmpty()
  @IsNumberString()
  games: number

  @IsNotEmpty()
  @IsNumberString()
  wins: number
}

export class fakeUserBodyDto {
  @IsNumber()
  @IsNotEmpty()
  id: number
}

export class fakeUserParamDto {
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

export class getNumberOfGamesDto {
  @IsNumber()
  @IsNotEmpty()
  id: number
}
