import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";
import { Container } from "typedi";
import { RequestWithUser } from "@interfaces/auth.interface";
import { AuthService } from "@services/auth.service";
import { removeExtraUserProperties } from "@/utils/sanitizeResponseData";
import { ChangePasswordDto } from "@/dtos/auth.dto";
import { transporter } from "@/config/nodemailer";
import { IndexService } from "@/services/index.service";
import { getSendEmailPayload, secondsToHumanReadable } from "@/utils/helpers";

export class AuthController {
  public auth = Container.get(AuthService);
  public index = Container.get(IndexService);
  /**
   * @swagger
   * /sign-up:
   *   post:
   *     summary: User Sign-Up
   *     description: Creates a new user account.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *
   *     responses:
   *       201:
   *         description: Successful sign-up
   *         content:
   *           application/json:
   *             example: { data: { user: {   }, bearer: "Bearer Token", refresh: "Refresh Token" } }
   *       500:
   *         description: Internal Server Error
   *         content:
   *           application/json:
   *             example: { error: "Internal Server Error" }
   */
  public signUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData = req.body;
      await this.index.checkUsernameAvailibility(userData.username);
      const {
        user: signUpUserData,
        bearer,
        refresh,
      } = await this.auth.signup(userData);
      const tokenData = await this.auth.createAndUpdateVerificationToken(
        signUpUserData,
      );
      transporter.sendMail(
        getSendEmailPayload({
          to: signUpUserData.email,
          subject: "Verification link",
          text: `Click the link to verify your email:\n http://127.0.0.1:5000/verify-email?token=${
            tokenData.token
          } \n This link will expires in ${secondsToHumanReadable(
            tokenData.expiresIn,
          )}`,
        }),
        (err: Error, info) => {
          console.log("info => ", info);
          if (err) {
            console.error(err);
          }
        },
      );
      res.status(201).json({
        data: {
          user: removeExtraUserProperties(signUpUserData),
          bearer,
          refresh,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData = req.body;
      const { bearer, refresh } = await this.auth.login(userData);
      res.status(200).json({ data: { refresh, bearer } });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.auth.logout(userData);

      res.status(200).json({ data: logOutUserData });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userData: User = req.user;
      const requestBody: ChangePasswordDto = req.body;
      const changePasswordResponse = await this.auth.changePassword(
        userData,
        requestBody,
      );
      res.status(200).json({ data: changePasswordResponse });
    } catch (error) {
      next(error);
    }
  };
}
