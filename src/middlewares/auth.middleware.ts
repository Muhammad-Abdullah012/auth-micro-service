import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import {
  SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  VERIFICATION_TOKEN_SECRET_KEY,
  PASSWORD_RESET_TOKEN_SECRET_KEY,
} from "@config";
import { HttpException } from "@exceptions/HttpException";
import { DataStoredInToken, RequestWithUser } from "@interfaces/auth.interface";
import { Prisma } from "@/config/prismaClient";
import { logger } from "@/utils/logger";

const getAuthorization = (req: RequestWithUser) => {
  const header = req.header("Authorization");
  if (header) return header.split("Bearer ")[1];

  return null;
};

export const AuthMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const Authorization = getAuthorization(req);

    if (Authorization) {
      const { id } = (await verify(
        Authorization,
        SECRET_KEY,
      )) as DataStoredInToken;
      const users = Prisma.user;
      const findUser = await users.findUnique({ where: { id: Number(id) } });

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, "Wrong authentication token"));
      }
    } else {
      next(new HttpException(400, "Authentication token missing"));
    }
  } catch (error) {
    logger.error(error);
    next(new HttpException(401, "Wrong authentication token"));
  }
};

export const RefreshTokenMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) next(new HttpException(400, "Refresh token missing"));
    const { id } = (await verify(
      refreshToken,
      REFRESH_TOKEN_SECRET_KEY,
    )) as DataStoredInToken;
    const users = Prisma.user;
    const findUser = await users.findFirstOrThrow({
      where: { id: Number(id), refreshToken },
    });
    if (findUser) {
      req.user = findUser;
      next();
    } else {
      next(new HttpException(401, "Wrong refresh token"));
    }
  } catch (error) {
    logger.error(error);
    next(new HttpException(401, "Wrong refresh token"));
  }
};

export const VerificationTokenMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.query;

    if (token && typeof token === "string") {
      const { id } = (await verify(
        token,
        VERIFICATION_TOKEN_SECRET_KEY,
      )) as DataStoredInToken;
      const users = Prisma.user;
      const findUser = await users.findFirstOrThrow({
        where: { id: Number(id), verificationToken: token },
      });

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, "Invalid token or token expired!"));
      }
    } else {
      next(new HttpException(400, "Verification token missing"));
    }
  } catch (error) {
    logger.error(error);
    next(
      new HttpException(
        403,
        "Something went wrong or token expired or token already used!",
      ),
    );
  }
};

export const PasswordResetTokenValidationMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.query;

    if (token && typeof token === "string") {
      const { id } = (await verify(
        token,
        PASSWORD_RESET_TOKEN_SECRET_KEY,
      )) as DataStoredInToken;
      const users = Prisma.user;
      const findUser = await users.findFirstOrThrow({
        where: { id: Number(id), passwordResetToken: token },
      });

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, "Invalid token or token expired!"));
      }
    } else {
      next(new HttpException(400, "Reset token missing"));
    }
  } catch (error) {
    logger.error(error);
    next(
      new HttpException(
        403,
        "Something went wrong or token expired or token already used!",
      ),
    );
  }
};
