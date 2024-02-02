import "reflect-metadata";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from "@config";
import { Routes } from "@interfaces/routes.interface";
import { ErrorMiddleware } from "@middlewares/error.middleware";
import { logger, stream } from "@utils/logger";

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || "development";
    this.port = PORT || 3000;
    try {
      this.initializeMiddlewares();
      this.initializeRoutes(routes);
      this.initializeSwagger();
      this.initializeErrorHandling();
    } catch (error) {
      console.error(error);
      logger.error(error);
    }
  }

  public listen() {
    console.log("listening to port => ", this.port);
    try {
      this.app.listen(this.port, () => {
        logger.info(`=================================`);
        logger.info(`======= ENV: ${this.env} =======`);
        logger.info(`🚀 App listening on the port ${this.port}`);
        logger.info(`=================================`);
      });
    } catch (err) {
      console.error("Error occured while listening to port => ", err);
      logger.error(err);
    }
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(hpp());
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use("/", route.router);
    });
  }

  private initializeSwagger() {
    const options: swaggerJSDoc.OAS3Options = {
      swaggerDefinition: {
        openapi: "3.1.0",
        info: {
          title: "REST API",
          version: "1.0.0",
          description: "Example docs",
        },
      },

      apis: [`${__dirname}/controllers/*.ts`],
    };

    const specs = swaggerJSDoc(options);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
