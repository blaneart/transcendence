import { IsString, IsNumberString, IsNotEmpty } from "class-validator";

export class userIdDto {
  @IsNumberString()
  @IsNotEmpty()
  id: number
}