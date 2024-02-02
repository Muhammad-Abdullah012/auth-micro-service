import request from "supertest";
import bcrypt from "bcrypt";
import { equal, notEqual } from "node:assert";
import { App } from "@/app";
import { LoginUserDto } from "@/dtos/users.dto";
import { AuthRoute } from "@/routes/auth.route";
import { TokenRoute } from "@/routes/token.route";
import { UserRoute } from "@/routes/users.route";

describe("Testing Tokens", () => {
  beforeEach(() => jest.clearAllMocks());
  describe("[POST] /token/validate", () => {
    it("Should return token is valid", async () => {
      const payload: LoginUserDto = {
        username: "test-user",
        password: "test12345",
      };
      const authRoute = new AuthRoute();
      const tokenRoute = new TokenRoute();
      const usersRoute = new UserRoute();
      const app = new App([authRoute, tokenRoute, usersRoute]);
      const users1 = usersRoute.user.user.user;
      users1.update = jest.fn().mockReturnValue(null);
      users1.findUnique = jest.fn().mockReturnValue({ passwordHash: await bcrypt.hash(payload.password, 10) });
      const respose = await request(app.getServer()).post(`${authRoute.path}login`).send(payload);
      equal(respose.status, 200);
      const bearer = respose.body.data.bearer;
      const response2 = await request(app.getServer()).post(`${tokenRoute.path}/validate`).set("Authorization", `Bearer ${bearer.token}`);
      equal(response2.status, 200);
      equal(response2.body.data, "token is valid!");
    });
  });
  describe("[POST] /token/refresh", () => {
    it("Should return new tokens", async () => {
      const payload: LoginUserDto = {
        username: "test-user",
        password: "test12345",
      };
      const authRoute = new AuthRoute();
      const tokenRoute = new TokenRoute();
      const usersRoute = new UserRoute();
      const app = new App([authRoute, tokenRoute, usersRoute]);
      const users1 = usersRoute.user.user.user;
      users1.update = jest.fn().mockReturnValue(null);
      users1.findUnique = jest.fn().mockReturnValue({ passwordHash: await bcrypt.hash(payload.password, 10) });
      const respose = await request(app.getServer()).post(`${authRoute.path}login`).send(payload);
      equal(respose.status, 200);
      const { refresh, bearer } = respose.body.data;
      notEqual(refresh, undefined);
      notEqual(bearer, undefined);
      notEqual(bearer.token, undefined);
      notEqual(refresh.token, undefined);
      users1.findFirstOrThrow = jest.fn().mockReturnValue({ id: 1 });
      const response2 = await request(app.getServer()).post(`${tokenRoute.path}/refresh`).send({ refreshToken: refresh?.token });
      equal(response2.status, 200);
      const { refresh: newRefresh, bearer: newBearer } = response2.body.data;
      notEqual(newRefresh, undefined);
      notEqual(newRefresh.token, undefined);
      notEqual(newBearer, undefined);
      notEqual(newRefresh.token, refresh.token);
      notEqual(newBearer.token, bearer.token);
    });
    it("Should return error", async () => {
      const payload: LoginUserDto = {
        username: "test-user",
        password: "test12345",
      };
      const authRoute = new AuthRoute();
      const tokenRoute = new TokenRoute();
      const usersRoute = new UserRoute();
      const app = new App([authRoute, tokenRoute, usersRoute]);
      const users1 = usersRoute.user.user.user;
      users1.update = jest.fn().mockReturnValue(null);
      users1.findUnique = jest.fn().mockReturnValue({ passwordHash: await bcrypt.hash(payload.password, 10) });
      const respose = await request(app.getServer()).post(`${authRoute.path}login`).send(payload);
      equal(respose.status, 200);
      const { refresh, bearer } = respose.body.data;
      notEqual(refresh, undefined);
      notEqual(bearer, undefined);
      notEqual(bearer.token, undefined);
      notEqual(refresh.token, undefined);
      users1.findFirstOrThrow = jest.fn().mockRejectedValue(new Error("Not Found!"));
      const response2 = await request(app.getServer()).post(`${tokenRoute.path}/refresh`).send({ refreshToken: refresh?.token });
      equal(response2.status, 401);
      const { message } = response2.body;
      equal(message, "Wrong refresh token")
    });
  });
});
