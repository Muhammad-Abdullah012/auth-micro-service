import { equal } from "node:assert";
import bcrypt from "bcrypt";
import request from "supertest";
import { App } from "@/app";
import { LoginUserDto } from "@dtos/users.dto";
import { UserRoute } from "@routes/users.route";
import { AuthRoute } from "@/routes/auth.route";
import { IndexRoute } from "@/routes/index.route";

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe("Testing users", () => {
  beforeEach(() => jest.clearAllMocks());
  describe("[GET] /users/profile", () => {
    it("Should return my profile", async () => {
      const payload: LoginUserDto = {
        username: "test-user",
        password: "test12345",
      };
      const authRoute = new AuthRoute();
      const usersRoute = new UserRoute();
      const app = new App([authRoute, usersRoute]);
      const users1 = usersRoute.user.user.user;
      users1.update = jest.fn().mockReturnValue(null);
      users1.findUnique = jest.fn().mockReturnValue({ passwordHash: await bcrypt.hash(payload.password, 10) });
      const respose = await request(app.getServer()).post(`${authRoute.path}login`).send(payload);
      equal(respose.status, 200);
      const bearer = respose.body.data.bearer;
      const response2 = await request(app.getServer()).get(`${usersRoute.path}/profile`).set("Authorization", `Bearer ${bearer.token}`);
      equal(response2.status, 200);
    });
  });
  describe("[POST] /users/update-profile", () => {
    it("Should successfully update user profile!", async () => {
      const payload: LoginUserDto = {
        username: "test-user",
        password: "test12345",
      };
      const authRoute = new AuthRoute();
      const usersRoute = new UserRoute();
      const indexRoute = new IndexRoute();
      const app = new App([authRoute, usersRoute, indexRoute]);
      const users1 = usersRoute.user.user.user;
      users1.update = jest.fn().mockReturnValue(null);
      users1.findUnique = jest.fn().mockReturnValueOnce({ id: 1, passwordHash: await bcrypt.hash(payload.password, 10) });
      const respose = await request(app.getServer()).post(`${authRoute.path}login`).send(payload);
      equal(respose.status, 200);
      const bearer = respose.body.data.bearer;
      const updatedData = {
        username: "updated-user",
      };
      users1.findUnique = jest
        .fn()
        .mockReturnValueOnce({ id: 1, passwordHash: await bcrypt.hash(payload.password, 10) })
        .mockReturnValueOnce(null)
        .mockReturnValue({ id: 1, passwordHash: await bcrypt.hash(payload.password, 10) });
      // users1.findUnique = jest.fn().mockReturnValue(null);
      users1.update = jest.fn().mockReturnValue({ ...updatedData });
      const response2 = await request(app.getServer())
        .post(`${usersRoute.path}/update-profile`)
        .set("Authorization", `Bearer ${bearer.token}`)
        .send(updatedData);
      equal(response2.status, 200);
    });
  });
  // describe("[GET] /users", () => {
  //   it("response findAll users", async () => {
  //     const usersRoute = new UserRoute();
  //     const users = usersRoute.user.user.user;
  //     users.findMany = jest.fn().mockReturnValue([]);
  //     const app = new App([usersRoute]);
  //     const respose = await request(app.getServer()).get(`${usersRoute.path}`);
  //     equal(respose.status, 200);
  //   });
  // });

  // describe("[POST] /users", () => {
  //   const userData: CreateUserDto = {
  //     email: "test@email.com",
  //     password: "q1w2e3r40",
  //     username: "test",
  //   };
  //   const usersRoute = new UserRoute();
  //   const app = new App([usersRoute]);
  //   it("response findAll users", async () => {
  //     const users = usersRoute.user.user.user;
  //     users.findMany = jest.fn().mockReturnValue([]);
  //     const respose = await request(app.getServer()).get(`${usersRoute.path}`);
  //     equal(respose.status, 200);
  //     deepStrictEqual(respose.body.data, []);
  //   });
  //   it("response Create user", async () => {
  //     const users = usersRoute.user.user.user;
  //     users.findUnique = jest.fn().mockReturnValue(null);
  //     users.create = jest.fn().mockReturnValue(userData);
  //     const response = await request(app.getServer()).post(`${usersRoute.path}`).send(userData);
  //     equal(response.status, 201);
  //     deepStrictEqual(response.body.data, userData);
  //   });
  //   it("response findOne user", async () => {
  //     const userId = 1;
  //     const users = usersRoute.user.user.user;
  //     users.findUnique = jest.fn().mockReturnValue(userData);
  //     const response = await request(app.getServer()).get(`${usersRoute.path}/${userId}`);
  //     equal(response.status, 200);
  //     deepStrictEqual(response.body.data, userData);
  //   });
  //   it("response findAll users", async () => {
  //     const users = usersRoute.user.user.user;
  //     users.findMany = jest.fn().mockReturnValue([userData]);
  //     const respose = await request(app.getServer()).get(`${usersRoute.path}`);
  //     equal(respose.status, 200);
  //     deepStrictEqual(respose.body.data, [userData]);
  //   });
  //   it("Should delete user", async () => {
  //     const userId = 1;
  //     const users = usersRoute.user.user.user;
  //     users.findUnique = jest.fn().mockReturnValue(userData);
  //     users.delete = jest.fn().mockReturnValue(userData)
  //     const respose = await request(app.getServer()).delete(`${usersRoute.path}/${userId}`);
  //     equal(respose.status, 200);
  //   });
  // });

  // describe('[PUT] /users/:id', () => {
  //   it('response Update user', async () => {
  //     const userId = 1;
  //     const userData: CreateUserDto = {
  //       email: 'test@email.com',
  //       password: 'q1w2e3r40',
  //       username: "test",
  //     };

  //     const usersRoute = new UserRoute();
  //     // const users = usersRoute.user.user.user;

  //     // users.findUnique = jest.fn().mockReturnValue({
  //     //   id: userId,
  //     //   email: userData.email,
  //     //   password: await bcrypt.hash(userData.password, 10),
  //     // });
  //     // users.update = jest.fn().mockReturnValue({
  //     //   id: userId,
  //     //   email: userData.email,
  //     //   password: await bcrypt.hash(userData.password, 10),
  //     // });

  //     const app = new App([usersRoute]);
  //     return request(app.getServer()).put(`${usersRoute.path}/${userId}`).send(userData).expect(200);
  //   });
  // });

  // describe('[DELETE] /users/:id', () => {
  //   it('response Delete user', async () => {
  //     const userId = 1;
  //     const userData: CreateUserDto = {
  //       email: 'test@email.com',
  //       password: 'q1w2e3r40',
  //     };

  //     const usersRoute = new UserRoute();
  //     const users = usersRoute.user.user.user;

  //     users.findUnique = jest.fn().mockReturnValue({
  //       id: userId,
  //       email: userData.email,
  //       password: await bcrypt.hash(userData.password, 10),
  //     });
  //     users.delete = jest.fn().mockReturnValue({
  //       id: userId,
  //       email: userData.email,
  //       password: await bcrypt.hash(userData.password, 10),
  //     });

  //     const app = new App([usersRoute]);
  //     return request(app.getServer()).delete(`${usersRoute.path}/${userId}`).expect(200);
  //   });
  // });
});
