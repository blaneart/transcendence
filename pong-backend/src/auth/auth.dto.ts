import { IsNumberString, IsBoolean } from "class-validator";

export class Check2FADto {
  @IsNumberString()
  code: number
}

export class Set2FADTO {
  @IsBoolean()
  value: boolean
}