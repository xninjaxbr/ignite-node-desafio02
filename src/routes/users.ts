import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
  // LIST ALL USERS
  app.get("/", async () => {
    const users = await knex
      .select("id", "name", "email", "created_at")
      .from("user");

    return {
      users,
    };
  });

  // LIST UNIQUE USER
  app.get("/profile", async (request) => {
    const cookieUserIdSchema = z.string().uuid();

    const id = cookieUserIdSchema.parse(request.cookies.userId);

    const user = await knex
      .select("name", "email", "created_at")
      .from("user")
      .where("id", id)
      .first();

    return {
      user,
    };
  });

  // CREATE USER
  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    });

    const { name, email, password } = createUserBodySchema.parse(request.body);

    const emailExist = await knex("user").select().where({ email }).first();

    if (emailExist) {
      return reply
        .status(401)
        .send(`User already exists with email: ${emailExist.email}`);
    }

    const userId = await knex("user").insert(
      {
        id: randomUUID(),
        name,
        email,
        password,
      },
      ["id"],
    );

    reply.cookie("userId", userId[0].id, {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return reply.status(201).send();
  });

  // LOGOUT
  app.put("/logout", async (_, reply) => {
    reply.clearCookie("userId");
  });

  // LOGIN
  app.post("/login", async (request, reply) => {
    const reqLoginSchema = z.object({
      email: z.string(),
      password: z.string(),
    });

    const { email, password } = reqLoginSchema.parse(request.body);

    const login = await knex
      .select("id")
      .from("user")
      .where({
        email,
        password,
      })
      .first();

    if (!login) {
      return reply.status(404).send();
    }

    reply.cookie("userId", login?.id, {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return reply.status(200).send();
  });

  // DELETE USER
  app.delete("/:id", async (request, reply) => {
    const requestParamsSchema = z.object({
      id: z.string(),
    });

    const { id } = requestParamsSchema.parse(request.params);

    await knex("user")
      .where("id", id)
      .delete()
      .then((res) => {
        if (res === 1) {
          reply.status(200).send("user deleted");
        }
        if (res === 0) {
          reply.status(404).send("user not found");
        }
      });
  });

  // METRICS
  app.get("/usermetric", async (request) => {
    const userCookieSchema = z.string();

    const userId = userCookieSchema.parse(request.cookies.userId);

    const snaks = await knex("snacks")
      .where({ user_id: userId })
      .orderBy("created_at")
      .select();

    const data = {
      totalSnacks: 0,
      totalOnDiet: 0,
      totalOffDiet: 0,
      bestSequenceSnack: 0,
      currentSnack: 0,
    };
    const { totalSnacks, totalOnDiet, totalOffDiet, bestSequenceSnack } =
      snaks.reduce((acc, snack) => {
        if (snack.diet) {
          acc.currentSnack += 1;
        } else {
          acc.currentSnack = 0;
        }
        if (acc.currentSnack > acc.bestSequenceSnack) {
          acc.bestSequenceSnack = acc.currentSnack;
        }

        acc.totalSnacks += 1;
        acc.totalOnDiet += snack.diet === 1 ? 1 : 0;
        acc.totalOffDiet += snack.diet === 0 ? 1 : 0;
        return acc;
      }, data);

    return {
      totalSnacks,
      totalOnDiet,
      totalOffDiet,
      bestSequenceSnack,
    };
  });
}
