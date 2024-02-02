import { IsString, IsNotEmpty, MinLength, IsEmail } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  newPassword: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
