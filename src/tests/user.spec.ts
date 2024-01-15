import { it, describe, beforeAll, afterAll, beforeEach, expect } from "vitest";
import { app } from "../app";
import request from "supertest";
import { execSync } from "node:child_process";

describe("User route", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new user", async () => {
    await request(app.server)
      .post("/users")
      .send({
        name: "Paulo Test",
        email: "paulo@test.com",
        password: "123456",
      })
      .expect(201);
  });

  it("should be able to list all users", async () => {
    await request(app.server).post("/users").send({
      name: "Paulo Test",
      email: "paulo@test.com",
      password: "123456",
    });

    const listUserResponse = await request(app.server)
      .get("/users")
      .expect(200);

    expect(listUserResponse.body.users).toEqual([
      expect.objectContaining({ name: "Paulo Test", email: "paulo@test.com" }),
    ]);
  });

  it("should be able to list one user", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "Paulo Test",
      email: "paulo@test.com",
      password: "123456",
    });

    await request(app.server).post("/users").send({
      name: "Paulo 2 Test",
      email: "paulo2@test.com",
      password: "123456",
    });
    const cookies = createUserResponse.get("Set-Cookie");

    const listUserResponse = await request(app.server)
      .get("/users/profile")
      .set("Cookie", cookies)
      .expect(200);

    expect(listUserResponse.body.user).toEqual(
      expect.objectContaining({ name: "Paulo Test", email: "paulo@test.com" }),
    );
  });

  it("should be able to logout user", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "Paulo Test",
      email: "paulo@test.com",
      password: "123456",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .put("/users/logout")
      .set("Cookie", cookies)
      .expect(200);
  });

  it("should be able to logout user", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "Paulo Test",
      email: "paulo@test.com",
      password: "123456",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .put("/users/logout")
      .set("Cookie", cookies)
      .expect(200);

    await request(app.server)
      .post("/users/login")
      .send({ email: "paulo@test.com", password: "123456" })
      .expect(200);
  });

  it("should be able to delete a user", async () => {
    await request(app.server).post("/users").send({
      name: "Paulo Test",
      email: "paulo@test.com",
      password: "123456",
    });

    const listUserResponse = await request(app.server)
      .get("/users")
      .expect(200);

    request(app.server)
      .delete(`/users/${listUserResponse.body.id}`)
      .expect(200);
  });
});
