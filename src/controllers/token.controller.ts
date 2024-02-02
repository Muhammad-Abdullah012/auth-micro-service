import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { AuthService } from "@/services/auth.service";
import { RequestWithUser } from "@/interfaces/auth.interface";

export class TokenController {
  public auth = Container.get(AuthService);
  public tokenValidity(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ data: "token is valid!" });
    } catch (error) {
      next(error);
    }
  }
  public async refreshToken(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const tokenController = new TokenController();
      const { refresh, bearer } = await tokenController.auth.createAndGetTokens(
        req.user,
      );
      res.json({ data: { refresh, bearer } });
    } catch (error) {
      console.log("Error => ", error);
      next(error);
    }
  }
}
