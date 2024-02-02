import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { AuthMiddleware, RefreshTokenMiddleware } from "@middlewares/auth.middleware";
import { TokenController } from "@/controllers/token.controller";
import { ValidationMiddleware } from "@/middlewares/validation.middleware";
import { RefreshTokenDto } from "@/dtos/auth.dto";

export class TokenRoute implements Routes {
  public path = "/token";
  public router: Router = Router();
  public token = new TokenController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/validate`, AuthMiddleware, this.token.tokenValidity);
    this.router.post(`${this.path}/refresh`, ValidationMiddleware(RefreshTokenDto), RefreshTokenMiddleware, this.token.refreshToken);
  }
}
