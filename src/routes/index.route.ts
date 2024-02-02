import { Router } from "express";
import { ValidationMiddleware } from "@/middlewares/validation.middleware";
import {
  PasswordResetTokenValidationMiddleware,
  VerificationTokenMiddleware,
} from "@/middlewares/auth.middleware";
import { IndexController } from "@controllers/index.controller";
import { Routes } from "@interfaces/routes.interface";
import { CheckUsernameDto } from "@/dtos/index.dto";
import { ForgotPasswordDto } from "@/dtos/auth.dto";

export class IndexRoute implements Routes {
  public router: Router = Router();
  public index = new IndexController();
  public path = "/";

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.index.ping);
    this.router.get(
      `${this.path}verify-email`,
      VerificationTokenMiddleware,
      this.index.verifyEmail,
    );
    this.router.post(
      `${this.path}forgot-password`,
      ValidationMiddleware(ForgotPasswordDto),
    );
    this.router.get(
      `${this.path}forgot-password`,
      PasswordResetTokenValidationMiddleware,
      this.index.resetPassword,
    );
    this.router.post(
      `${this.path}check-username`,
      ValidationMiddleware(CheckUsernameDto),
      this.index.checkUsername,
    );
  }
}
