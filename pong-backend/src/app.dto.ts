import { IsString, IsNumberString, IsNotEmpty } from "class-validator";

export class getUserByNameDto {
  @IsNotEmpty()
  @IsString()
  value: string
}

export class getUserByIdDto {
  @IsNotEmpty()
  @IsNumberString()
  value: number
}

export class setNameDto {
  @IsNotEmpty()
  @IsString()
  value: string
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