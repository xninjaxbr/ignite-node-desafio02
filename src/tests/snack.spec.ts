import { it, describe, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { app } from "../app";
import request from "supertest";
import { execSync } from "node:child_process";

describe("Snacks route", () => {
  beforeAll(async () => {
    await app.ready();
    execSync("npm run knex migrate:latest");
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new snack", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Paulo Test",
        email: "paulo@test.com",
        password: "123456",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/snacks")
      .send({
        title: "almoço",
        description: "Arroz com bife",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);
  });

  it("should be able to list all snacks", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Paulo Test",
        email: "paulo@test.com",
        password: "123456",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/snacks")
      .send({
        title: "almoço",
        description: "Arroz com bife",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);

    const listUserResponse = await request(app.server)
      .get("/snacks")
      .set("Cookie", cookies)
      .expect(200);

    expect(listUserResponse.body.snacks).toEqual([
      expect.objectContaining({
        title: "almoço",
        description: "Arroz com bife",
      }),
    ]);
  });

  it("should be able to list one snack", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Paulo Test",
        email: "paulo@test.com",
        password: "123456",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/snacks")
      .send({
        title: "almoço",
        description: "Arroz com bife",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);

    await request(app.server)
      .post("/snacks")
      .send({
        title: "janta",
        description: "feijão com frango",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);

    const listUserResponse = await request(app.server)
      .get("/snacks")
      .set("Cookie", cookies)
      .expect(200);

    const id = listUserResponse.body.snacks[0].id;

    const snack = await request(app.server)
      .get(`/snacks/${id}`)
      .set("Cookie", cookies);

    expect(snack.body.snack).toEqual(
      expect.objectContaining({
        title: "almoço",
        description: "Arroz com bife",
      }),
    );
  });

  it("should be able to update snack", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Paulo Test",
        email: "paulo@test.com",
        password: "123456",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/snacks")
      .send({
        title: "almoço",
        description: "Arroz com bife",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);

    const listUserResponse = await request(app.server)
      .get("/snacks")
      .set("Cookie", cookies)
      .expect(200);

    const id = listUserResponse.body.snacks[0].id;

    await request(app.server)
      .put(`/snacks/${id}`)
      .send({ title: "janta", description: "pão", diet: false })
      .set("Cookie", cookies)
      .expect(201);

    const changedSnack = await request(app.server)
      .get(`/snacks/${id}`)
      .set("Cookie", cookies);

    expect(changedSnack.body.snack).toEqual(
      expect.objectContaining({
        title: "janta",
        description: "pão",
      }),
    );
  });

  it("should be able to delete snack", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Paulo Test",
        email: "paulo@test.com",
        password: "123456",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/snacks")
      .send({
        title: "almoço",
        description: "Arroz com bife",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);

    const listUserResponse = await request(app.server)
      .get("/snacks")
      .set("Cookie", cookies)
      .expect(200);

    const id = listUserResponse.body.snacks[0].id;

    await request(app.server)
      .delete(`/snacks/${id}`)
      .set("Cookie", cookies)
      .expect(200);
  });

  it("should be able to list metrics of user", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({
        name: "Paulo Test",
        email: "paulo@test.com",
        password: "123456",
      })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/snacks")
      .send({
        title: "café",
        description: "pão com ovo",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);

    await request(app.server)
      .post("/snacks")
      .send({
        title: "almoço",
        description: "Arroz com bife",
        diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);

    await request(app.server)
      .post("/snacks")
      .send({
        title: "janta",
        description: "Hamburguer",
        diet: false,
      })
      .set("Cookie", cookies)
      .expect(201);

    const listUserResponse = await request(app.server)
      .get("/users/usermetric")
      .set("Cookie", cookies)
      .expect(200);

    expect(listUserResponse.body).toEqual(
      expect.objectContaining({
        totalSnacks: 3,
        totalOnDiet: 2,
        totalOffDiet: 1,
        bestSequenceSnack: 2,
      }),
    );
  });
});
