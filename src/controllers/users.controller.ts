import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { User } from "@prisma/client";
import { UserService } from "@services/users.service";
import { RequestWithUser } from "@/interfaces/auth.interface";
import { removeExtraUserProperties } from "@/utils/sanitizeResponseData";
import { IndexService } from "@/services/index.service";

export class UserController {
  public user = Container.get(UserService);
  public index = Container.get(IndexService);
  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllUsersData: User[] = await this.user.findAllUser();

      res.status(200).json({ data: findAllUsersData });
    } catch (error) {
      next(error);
    }
  };

  public getMyProfile = (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData = removeExtraUserProperties(req.user);
      res.status(200).json({ data: userData });
    } catch (error) {
      next(error);
    }
  };
  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const findOneUserData: User = await this.user.findUserById(userId);

      res.status(200).json({ data: findOneUserData });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;
      if (userData.username != null) {
        await this.index.checkUsernameAvailibility(userData.username);
      }
      const updateUserData: User = await this.user.updateUser(req.user.id, userData);

      res.status(200).json({ data: removeExtraUserProperties(updateUserData), message: "updated" });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const deleteUserData: User = await this.user.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: "deleted" });
    } catch (error) {
      next(error);
    }
  };
}
