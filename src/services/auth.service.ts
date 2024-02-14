import { User } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { Service } from "typedi";
import {
  SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  VERIFICATION_TOKEN_SECRET_KEY,
  PASSWORD_RESET_TOKEN_SECRET_KEY,
  SECRET_KEY_EXPIRATION,
  REFRESH_TOKEN_SECRET_KEY_EXPIRATION,
  VERIFICATION_TOKEN_SECRET_KEY_EXPIRATION,
  PASSWORD_RESET_TOKEN_SECRET_KEY_EXPIRATION,
} from "@config";
import { CreateUserDto, LoginUserDto } from "@dtos/users.dto";
import { HttpException } from "@exceptions/HttpException";
import {
  BearerTokenData,
  DataStoredInToken,
  TokenData,
} from "@interfaces/auth.interface";
import { ChangePasswordDto } from "@/dtos/auth.dto";
import { Prisma } from "@/config/prismaClient";

@Service()
export class AuthService {
  public users = Prisma.user;

  public async signup(userData: CreateUserDto): Promise<{
    user: User;
    bearer: BearerTokenData;
    refresh: BearerTokenData;
  }> {
    const findUser: User = await this.users.findUnique({
      where: { email: userData.email },
    });
    if (findUser && !findUser.deleted)
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`,
      );

    const hashedPassword = await hash(userData.password, 10);
    delete userData.password;
    const dateOfBirthString = userData.dateOfBirth;
    delete userData.dateOfBirth;
    const createUserData: User = await this.users.create({
      data: {
        ...userData,
        dateOfBirth: dateOfBirthString ? new Date(dateOfBirthString) : null,
        passwordHash: hashedPassword,
        passwordResetToken: "",
        refreshToken: "",
        verificationToken: "",
        deleted: false,
      },
    });
    const { bearer, refresh } = await this.createAndGetTokens(createUserData);
    return { user: createUserData, bearer, refresh };
  }

  public async login(userData: LoginUserDto): Promise<{
    bearer: BearerTokenData;
    findUser: User;
    refresh: BearerTokenData;
  }> {
    if (userData.email == null && userData.username == null) {
      throw new HttpException(400, `email or username are required!`);
    }

    const findUser: User = await this.users.findUnique({
      where:
        userData.email?.length > 0
          ? { email: userData.email }
          : { username: userData.username },
    });

    if (!findUser || findUser.deleted)
      throw new HttpException(
        409,
        `User ${
          userData.email?.length > 0 ? userData.email : userData.username
        } not found`,
      );

    const isPasswordMatching: boolean = await compare(
      userData.password,
      findUser.passwordHash,
    );
    if (!isPasswordMatching)
      throw new HttpException(409, "Password is not matching");

    const { bearer, refresh } = await this.createAndGetTokens(findUser);

    return { bearer, findUser, refresh };
  }

  public async logout(userData: User): Promise<User> {
    const findUser: User = await this.users.findUnique({
      where: { email: userData.email },
    });
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    await this.users.update({
      where: { email: userData.email },
      data: { refreshToken: "" },
    });
    return findUser;
  }

  public async changePassword(
    userData: User,
    reqBody: ChangePasswordDto,
  ): Promise<string> {
    const { currentPassword, newPassword } = reqBody;
    await this.login({ email: userData.email, password: currentPassword });
    const hashedPassword = await hash(newPassword, 10);
    await this.users.update({
      where: { email: userData.email },
      data: { passwordHash: hashedPassword },
    });
    return "Password changed successfully!";
  }

  private jwtSignUser({
    user,
    secretKey,
    expiresIn,
  }: {
    user: User;
    secretKey: string;
    expiresIn: number;
  }) {
    const dataStoredInToken: DataStoredInToken = {
      id: user.id,
      createdAt: new Date().getTime(),
    };
    return {
      expiresIn,
      token: sign(dataStoredInToken, secretKey, { expiresIn }),
    };
  }

  public createToken(user: User): TokenData {
    return this.jwtSignUser({
      user,
      secretKey: SECRET_KEY,
      expiresIn: Number(SECRET_KEY_EXPIRATION),
    });
  }

  public bearerToken(tokenData: TokenData): BearerTokenData {
    return { ...tokenData, tokenType: "Bearer" };
  }

  public refreshToken(tokenData: TokenData): BearerTokenData {
    return { ...tokenData, tokenType: "Refresh" };
  }

  public async createAndSaveRefreshToken(user: User): Promise<TokenData> {
    const { token, expiresIn } = this.jwtSignUser({
      user,
      secretKey: REFRESH_TOKEN_SECRET_KEY,
      expiresIn: Number(REFRESH_TOKEN_SECRET_KEY_EXPIRATION),
    });

    await this.users.update({
      where: { email: user.email },
      data: { refreshToken: token },
    });
    return { expiresIn, token };
  }

  public async createAndGetTokens(
    user: User,
  ): Promise<{ bearer: BearerTokenData; refresh: BearerTokenData }> {
    const bearer = this.bearerToken(this.createToken(user));
    const refresh = this.refreshToken(
      await this.createAndSaveRefreshToken(user),
    );
    return { bearer, refresh };
  }

  public async createAndUpdateVerificationToken(
    user: User,
  ): Promise<TokenData> {
    const { token, expiresIn } = this.jwtSignUser({
      user,
      secretKey: VERIFICATION_TOKEN_SECRET_KEY,
      expiresIn: Number(VERIFICATION_TOKEN_SECRET_KEY_EXPIRATION),
    });
    await this.users.update({
      where: { email: user.email },
      data: { verificationToken: token },
    });
    return { token, expiresIn };
  }

  public async createAndUpdatePasswordResetToken(
    email: string,
  ): Promise<TokenData> {
    const user = await this.users.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException(404, "Email not found!");
    }
    const { token, expiresIn } = this.jwtSignUser({
      user,
      secretKey: PASSWORD_RESET_TOKEN_SECRET_KEY,
      expiresIn: Number(PASSWORD_RESET_TOKEN_SECRET_KEY_EXPIRATION),
    });

    await this.users.update({
      where: { email: user.email },
      data: { passwordResetToken: token },
    });

    return { token, expiresIn };
  }
}
