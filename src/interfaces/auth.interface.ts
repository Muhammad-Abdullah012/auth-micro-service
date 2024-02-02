import { Request } from "express";
import { User } from "@prisma/client";

export interface DataStoredInToken {
  id: number;
  createdAt: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface BearerTokenData extends TokenData {
  tokenType: "Bearer" | "Refresh";
}

export interface RequestWithUser extends Request {
  user: User;
}
