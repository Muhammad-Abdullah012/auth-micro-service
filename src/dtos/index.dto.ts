import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class CheckUsernameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;
}

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
