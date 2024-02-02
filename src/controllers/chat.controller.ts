import { NextFunction, Response } from "express";
import { Container } from "typedi";
import { RequestWithUser } from "@interfaces/auth.interface";
import { ChatService } from "@/services/chat.service";

export class ChatController {
  public chatService = Container.get(ChatService);
  public async chat(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const chatController = new ChatController();
      const response = await chatController.chatService.chat(req.body.prompt);
      res.status(200).json({ data: response.choices[0].message.content });
    } catch (error) {
      next(error);
    }
  }
}
