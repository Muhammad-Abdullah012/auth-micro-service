import { User } from "@prisma/client";
import { Service } from "typedi";
import { Prisma } from "@/config/prismaClient";
import { HttpException } from "@/exceptions/HttpException";

@Service()
export class IndexService {
  public users = Prisma.user;
  public ping() {
    return { status: "OK" };
  }

  public async checkUsernameAvailibility(username: string) {
    const user = await this.users.findUnique({ where: { username } });
    if (user) {
      throw new HttpException(409, "Username is already in use!");
    }
  }

  public verifyUserEmail(user: User): Promise<User> {
    return this.users.update({
      where: { email: user.email },
      data: { emailVerified: true, verificationToken: "" },
    });
  }

  public setProfileImage(user: User, image: string): Promise<User> {
    return this.users.update({
      where: { email: user.email },
      data: { profileImage: image },
    });
  }
}
