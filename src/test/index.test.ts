import request from "supertest";
import { App } from "@/app";
import { IndexRoute } from "@routes/index.route";
import { equal } from "node:assert";
import { CheckUsernameDto } from "@/dtos/index.dto";

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe("Testing Index", () => {
  beforeEach(() => jest.clearAllMocks());
  describe("[GET] /", () => {
    it("response statusCode 200", async () => {
      const indexRoute = new IndexRoute();
      const app = new App([indexRoute]);

      return await request(app.getServer()).get(`${indexRoute.path}`).expect(200);
    });
  });
  describe("[POST] /check-username", () => {
    it("Should return username is available!", async () => {
      const payload: CheckUsernameDto = {
        username: "test",
      };
      const indexRoute = new IndexRoute();
      indexRoute.index.index.users.findUnique = jest.fn().mockResolvedValue(null);
      const app = new App([indexRoute]);
      const response = await request(app.getServer()).post(`${indexRoute.path}check-username`).send(payload);
      equal(response.status, 200);
      equal(response.body.data, `${payload.username} is available!`);
    });
    it("Should return username is already in use!", async () => {
      const payload: CheckUsernameDto = {
        username: "test",
      };
      const indexRoute = new IndexRoute();
      indexRoute.index.index.users.findUnique = jest.fn().mockResolvedValue({ username: "test" });
      const app = new App([indexRoute]);
      const response = await request(app.getServer()).post(`${indexRoute.path}check-username`).send(payload);
      equal(response.status, 409);
      equal(response.body.message, "Username is already in use!");
    });
  });
});
