import busboy = require("busboy");
import { join } from "path";
import { createWriteStream } from "fs";
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
        (err, info) => {
          if (err) {
            return res
              .status(400)
              .json({ message: "Failed to send password reset email!" });
          }
          res.status(200).json({ data: "Password reset email sent!" });
        },
      );
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ data: "Reset Password!" });
    } catch (error) {
      next(error);
    }
  }
  public async fileUpload(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const busboyInstance = busboy({ headers: req.headers });
      const uploadDir = join(__dirname, "..", "..", "public", "images");
      const filePaths = [];

      busboyInstance.on(
        "file",
        (fieldname, file, { filename, encoding, mimeType }) => {
          const _fileName =
            new Date().getTime() + "_" + filename.split(" ").join("_");
          const filePathAbsolute = join(uploadDir, _fileName);
          const writeStream = createWriteStream(filePathAbsolute);
          file.pipe(writeStream);
          filePaths.push(filePathAbsolute);

          writeStream.on("close", async () => {
            console.log(`File ${filename} saved successfully.`);
            if (mimeType.startsWith("image")) {
              const idxController = new IndexController();
              await idxController.index.setProfileImage(req.user, _fileName);
            }
          });
          writeStream.on("error", error => {
            console.error("Error occured ==> ", error);
          });
        },
      );

      busboyInstance.on("error", error => {
        console.error("error => ", error);
        res.json({ message: "Something went wrong!" });
      });
      busboyInstance.on("finish", () => {
        console.log("File upload finished.");
        res.json({ success: true });
      });

      req.pipe(busboyInstance);
    } catch (err) {
      console.error("Error occured ==> ", err);
      next(err);
    }
  }
}
