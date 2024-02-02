import bcrypt from "bcrypt";
import request from "supertest";
import { equal, notEqual } from "node:assert";
import { App } from "@/app";
import { CreateUserDto, LoginUserDto } from "@dtos/users.dto";
import { AuthRoute } from "@routes/auth.route";
import { ChangePasswordDto } from "@/dtos/auth.dto";

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe("Testing Auth", () => {
  beforeEach(() => jest.clearAllMocks());
  describe("[POST] /signup", () => {
    it("Should return error!", async () => {
      const userData = {
        email: "testemail.com",
        password: "q1w2e3r41",
        username: "test",
      };
      const authRoute = new AuthRoute();
      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}signup`).send(userData);
      equal(response.status, 400);
    });
    it("Should return error!", async () => {
      const userData = {
        email: "testemail.com",
        password: "q1w2e3r41",
      };
      const authRoute = new AuthRoute();
      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}signup`).send(userData);
      equal(response.status, 400);
    });
    it("Should return error!", async () => {
      const userData = {
        email: "test@email.com",
        password: "q1w2e3r",
        username: "test",
      };
      const authRoute = new AuthRoute();
      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}signup`).send(userData);
      equal(response.status, 400);
    });
    it("Should return error!", async () => {
      const userData: CreateUserDto = {
        email: "test@email.com",
        password: "q1w2e3r41",
        username: "test",
      };
      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;

      users.findUnique = jest.fn().mockReturnValue(userData);
      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}signup`).send(userData);
      equal(response.status, 409);
    });
    it("Should Create user and return user data and bearer token!", async () => {
      const userData: CreateUserDto = {
        email: "test@email.com",
        password: "q1w2e3r41",
        username: "test",
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;

      users.update = jest.fn().mockReturnValue(null);
      users.findUnique = jest.fn().mockReturnValue(null);
      users.create = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        passwordHash: await bcrypt.hash(userData.password, 10),
        username: userData.username,
      });

      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}signup`).send(userData);
      equal(response.status, 201);
      notEqual(response.body.data.user, undefined);
      notEqual(response.body.data.bearer, undefined);
      notEqual(response.body.data.refresh, undefined);
      const expectedKeys = ["tokenType", "token", "expiresIn"];
      for (const p of Object.keys(response.body.data.bearer)) {
        equal(expectedKeys.includes(p), true);
      }
      for (const p of Object.keys(response.body.data.refresh)) {
        equal(expectedKeys.includes(p), true);
      }
    });
  });

  describe("[POST] /login", () => {
    it("Should return error!", async () => {
      const userData = {
        email: "test@email.com",
        password: "q1w2e3r41",
      };
      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;

      users.findUnique = jest.fn().mockReturnValue(null);
      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      equal(response.status, 409);
    });
    it("Should return error!", async () => {
      const userData = {
        password: "q1w2e3r41",
      };
      const authRoute = new AuthRoute();
      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      equal(response.status, 400);
      equal(response.body.message, "email or username are required!");
    });
    it("Should return error!", async () => {
      const userData: LoginUserDto = {
        email: "test@email.com",
        password: "q1w2e3r41",
      };
      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;

      users.findUnique = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        passwordHash: await bcrypt.hash("123", 10),
      });
      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      equal(response.status, 409);
      equal(response.body.message, "Password is not matching");
    });
    it("response should have the Bearer Token in response body, login with email!", async () => {
      const userData: LoginUserDto = {
        email: "test@email.com",
        password: "q1w2e3r41",
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;
      users.update = jest.fn().mockReturnValue(null);
      users.findUnique = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        passwordHash: await bcrypt.hash(userData.password, 10),
      });

      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      const expectedKeys = ["tokenType", "token", "expiresIn"];
      equal(response.status, 200);
      notEqual(response.body.data.bearer, undefined);
      notEqual(response.body.data.refresh, undefined);
      equal(response.body.data.bearer.tokenType, "Bearer");
      for (const p of Object.keys(response.body.data.bearer)) {
        equal(expectedKeys.includes(p), true);
      }
      for (const p of Object.keys(response.body.data.refresh)) {
        equal(expectedKeys.includes(p), true);
      }
    });
    it("response should have the Bearer Token in response body, login with username!", async () => {
      const userData: LoginUserDto = {
        username: "test",
        password: "q1w2e3r41",
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;
      users.update = jest.fn().mockReturnValue(null);
      users.findUnique = jest.fn().mockReturnValue({
        id: 1,
        username: userData.username,
        passwordHash: await bcrypt.hash(userData.password, 10),
      });

      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      const expectedKeys = ["tokenType", "token", "expiresIn"];
      equal(response.status, 200);
      notEqual(response.body.data.bearer, undefined);
      notEqual(response.body.data.refresh, undefined);
      equal(response.body.data.bearer.tokenType, "Bearer");
      for (const p of Object.keys(response.body.data.bearer)) {
        equal(expectedKeys.includes(p), true);
      }
      for (const p of Object.keys(response.body.data.refresh)) {
        equal(expectedKeys.includes(p), true);
      }
    });
    it("response should have the Bearer Token in response body, FE send both username and password!", async () => {
      const userData: LoginUserDto = {
        email: "test@email.com",
        username: "test",
        password: "q1w2e3r41",
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;
      users.update = jest.fn().mockReturnValue(null);
      users.findUnique = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        username: userData.username,
        passwordHash: await bcrypt.hash(userData.password, 10),
      });

      const app = new App([authRoute]);
      const response = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      const expectedKeys = ["tokenType", "token", "expiresIn"];
      equal(response.status, 200);
      notEqual(response.body.data.bearer, undefined);
      notEqual(response.body.data.refresh, undefined);
      equal(response.body.data.bearer.tokenType, "Bearer");
      for (const p of Object.keys(response.body.data.bearer)) {
        equal(expectedKeys.includes(p), true);
      }
      for (const p of Object.keys(response.body.data.refresh)) {
        equal(expectedKeys.includes(p), true);
      }
    });
  });
  describe("[POST] /change-password", () => {
    it("Should return error!", async () => {
      //////// Login ///////////////////////////
      const userData: LoginUserDto = {
        email: "test@email.com",
        username: "test",
        password: "q1w2e3r41",
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;
      users.update = jest.fn().mockReturnValue(null);
      users.findUnique = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        username: userData.username,
        passwordHash: await bcrypt.hash(userData.password, 10),
      });

      const app = new App([authRoute]);
      const resposne = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      const bearer = resposne.body.data.bearer;
      ////////// Change Password ////////////////
      const changePasswordPayload: ChangePasswordDto = {
        currentPassword: "q1w2e3r40",
        newPassword: "123456789",
      };
      users.update = jest.fn().mockReturnValue({});
      const response = await request(app.getServer())
        .post(`${authRoute.path}change-password`)
        .set("Authorization", `Bearer ${bearer?.token}`)
        .send(changePasswordPayload);

      equal(response.status, 409);
      equal(response.body.message, "Password is not matching");
    });
    it("Should change password successfully!", async () => {
      //////// Login ///////////////////////////
      const userData: LoginUserDto = {
        email: "test@email.com",
        password: "q1w2e3r41",
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;
      users.update = jest.fn().mockReturnValue(null);
      users.findUnique = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        username: userData.username,
        passwordHash: await bcrypt.hash(userData.password, 10),
      });

      const app = new App([authRoute]);
      const resposne = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
      const bearer = resposne.body.data.bearer;
      ////////// Change Password ////////////////
      const changePasswordPayload: ChangePasswordDto = {
        currentPassword: "q1w2e3r41",
        newPassword: "123456789",
      };
      users.update = jest.fn().mockReturnValue({});
      const response = await request(app.getServer())
        .post(`${authRoute.path}change-password`)
        .set("Authorization", `Bearer ${bearer?.token}`)
        .send(changePasswordPayload);
      equal(response.status, 200);
      equal(response.body.data, "Password changed successfully!");
      //////// Login with new password ///////////////////////////
      const updatedUserData: LoginUserDto = {
        email: userData.email,
        password: "123456789",
      };

      users.findUnique = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        username: userData.username,
        passwordHash: await bcrypt.hash(updatedUserData.password, 10),
      });
      const response2 = await request(app.getServer()).post(`${authRoute.path}login`).send(updatedUserData);
      equal(response2.status, 200);
    });
  });
});
