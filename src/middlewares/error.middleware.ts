import { NextFunction, Request, Response } from "express";
import { HttpException } from "@exceptions/HttpException";
import { logger } from "@utils/logger";
import { stringifyIfPossible } from "@/utils/helpers";

export const ErrorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    logger.error(`[${req.method}] ${req.path}:: Error ==> `, error);
    const status: number = error.status || 500;
    const message: string = error.message || "Something went wrong";

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    const stringified = stringifyIfPossible(error);
    res.status(status).json({ message, error: stringified == null ? error : stringified });
  } catch (error) {
    next(error);
  }
};
