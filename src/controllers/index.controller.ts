import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { IndexService } from "@services/index.service";
import { RequestWithUser } from "@/interfaces/auth.interface";
import { AuthService } from "@/services/auth.service";
import { AuthController } from "./auth.controller";
import { transporter } from "@/config/nodemailer";
import { getSendEmailPayload, secondsToHumanReadable } from "@/utils/helpers";

export class IndexController {
  public auth = Container.get(AuthService);
  public index = Container.get(IndexService);

  /**
   * @swagger
   * /:
   *   get:
   *     summary: Ping endpoint
   *     description: Returns a simple ping response.
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             example: { message: "Ping successful!" }
   *       500:
   *         description: Internal Server Error
   *         content:
   *           application/json:
   *             example: { error: "Internal Server Error" }
   */
  public ping(req: Request, res: Response, next: NextFunction) {
    try {
      const idxController = new IndexController();
      res.status(200).json(idxController.index.ping());
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /check-username:
   *   post:
   *     summary: Check username availability
   *     description: Checks if the provided username is available.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 description: The username to check for availability.
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             example: { data: "username is available!", message: "checkUsername" }
   *       500:
   *         description: Internal Server Error
   *         content:
   *           application/json:
   *             example: { error: "Internal Server Error" }
   */
  public async checkUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const idxController = new IndexController();
      await idxController.index.checkUsernameAvailibility(req.body.username);
      res.status(200).json({
        data: `${req.body.username} is available!`,
        message: "checkUsername",
      });
    } catch (error) {
      next(error);
    }
  }

  public async verifyEmail(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const idxController = new IndexController();
      await idxController.index.verifyUserEmail(req.user);
      res.status(200).json({ verified: true });
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const authController = new AuthController();

      const { token, expiresIn } =
        await authController.auth.createAndUpdatePasswordResetToken(email);
      transporter.sendMail(
        getSendEmailPayload({
          to: email,
          subject: "Password Reset",
          text: `Click this link to reset your password! \t http://127.0.0.1/forgot-password?token=${token}\nThis link will expire in ${secondsToHumanReadable(
            expiresIn,
          )}`,
        }),
      );
      res.status(200).json({ message: "Password reset email sent!" });
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ message: "Reset Password!" });
    } catch (error) {
      next(error);
    }
  }
}
