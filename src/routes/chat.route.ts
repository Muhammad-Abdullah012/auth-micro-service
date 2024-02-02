import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";
import { AuthMiddleware } from "@middlewares/auth.middleware";
import { ValidationMiddleware } from "@middlewares/validation.middleware";
import { ChatDto } from "@/dtos/index.dto";
import { ChatController } from "@/controllers/chat.controller";

export class ChatRoute implements Routes {
  public path = "/";
  public router: Router = Router();
  public chatController = new ChatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}chat`, AuthMiddleware, ValidationMiddleware(ChatDto), this.chatController.chat);
  }
}
