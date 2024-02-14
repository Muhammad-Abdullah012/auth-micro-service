import { Router } from "express";
import { UserController } from "@controllers/users.controller";
import { Routes } from "@interfaces/routes.interface";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { ValidationMiddleware } from "@/middlewares/validation.middleware";
import { UpdateUserDto } from "@/dtos/users.dto";

export class UserRoute implements Routes {
  public path = "/users";
  public router: Router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/profile", AuthMiddleware, this.user.getMyProfile);
    this.router.post(
      "/update-profile",
      AuthMiddleware,
      ValidationMiddleware(UpdateUserDto, false, true, true),
      this.user.updateUser,
    );
  }
}
