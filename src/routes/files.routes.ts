import express, { Router } from "express";
import { Routes } from "@/interfaces/routes.interface";
import { join } from "path";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { FilesController } from "@/controllers/files.controller";

export class FilesRoute implements Routes {
  public path = "/files";
  public filesController = new FilesController();
  public router: Router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(
      "/images",
      (req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
      },
      express.static(join(__dirname, "..", "..", "public/images")),
    );

    this.router.post(
      `/upload`,
      AuthMiddleware,
      this.filesController.fileUpload,
    );
  }
}
