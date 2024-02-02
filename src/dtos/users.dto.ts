import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsDateString, IsBoolean,  } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  public username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  public password: string;

  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsString()
  public firstName?: string = "";

  @IsString()
  public lastName?: string = "";

  @IsOptional()
  @IsDateString()
  public dateOfBirth?: string;

  @IsString()
  @IsOptional()
  public profileImage?: string;

  @IsOptional()
  @IsBoolean()
  public twoFactorEnabled?: boolean;

  @IsOptional()
  @IsString()
  public phoneNumber?: string;
}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  public password: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  public email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public username?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  public username?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  public email?: string;

  @IsOptional()
  @IsString()
  public firstName?: string;

  @IsOptional()
  @IsString()
  public lastName?: string;

  @IsOptional()
  @IsDateString()
  public dateOfBirth?: string;

  @IsString()
  @IsOptional()
  public profileImage?: string;

  @IsOptional()
  @IsBoolean()
  public twoFactorEnabled?: boolean;

  @IsOptional()
  @IsString()
  public phoneNumber?: string;

  // @Forbidden()
  [key: string]: any;
}
