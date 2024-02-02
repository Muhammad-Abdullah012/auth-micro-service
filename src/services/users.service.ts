import { User } from "@prisma/client";
import { hash } from "bcrypt";
import { Service } from "typedi";
import { CreateUserDto, UpdateUserDto } from "@dtos/users.dto";
import { HttpException } from "@/exceptions/HttpException";
import { Prisma } from "@/config/prismaClient";

@Service()
export class UserService {
  public user = Prisma.user;

  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await this.user.findMany();
    return allUser;
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async updateUser(userId: number, userData: UpdateUserDto): Promise<User> {
    if (Object.keys(userData).length === 0) {
      throw new HttpException(400, "Update request must include data");
    }
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(404, "User not found!");
    const updateUserData = await this.user.update({ where: { id: userId }, data: { ...userData } });
    return updateUserData;
  }

  public async deleteUser(userId: number): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(404, "User doesn't exist");

    const deleteUserData = await this.user.update({ where: { id: userId }, data: { deleted: true } });
    return deleteUserData;
  }
}
