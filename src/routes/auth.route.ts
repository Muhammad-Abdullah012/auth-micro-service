import { Router } from "express";
import { AuthController } from "@controllers/auth.controller";
import { CreateUserDto, LoginUserDto } from "@dtos/users.dto";
import { Routes } from "@interfaces/routes.interface";
import { AuthMiddleware } from "@middlewares/auth.middleware";
import { ValidationMiddleware } from "@middlewares/validation.middleware";
import { ChangePasswordDto } from "@/dtos/auth.dto";

export class AuthRoute implements Routes {
  public path = "/";
  public router: Router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, ValidationMiddleware(CreateUserDto), this.auth.signUp);
    this.router.post(`${this.path}login`, ValidationMiddleware(LoginUserDto), this.auth.logIn);
    this.router.post(`${this.path}logout`, AuthMiddleware, this.auth.logOut);
    this.router.post(`${this.path}change-password`, ValidationMiddleware(ChangePasswordDto), AuthMiddleware, this.auth.changePassword);
  }
}
