import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";
import { checkSession } from "../middlewares/check_session";

export async function snacksRouters(app: FastifyInstance) {
  // GET ALL SNACKS
  app.get("/", { preHandler: [checkSession] }, async (request) => {
    const snacks = await knex("snacks")
      .where({ user_id: request.user?.id })
      .select();

    return {
      snacks,
    };
  });

  // GET ONE SNACK
  app.get("/:id", { preHandler: [checkSession] }, async (request) => {
    const requestParamsSchema = z.object({
      id: z.string(),
    });
    const { id } = requestParamsSchema.parse(request.params);

    const snack = await knex("snacks")
      .where({ id, user_id: request.user?.id })
      .select()
      .first();

    return {
      snack,
    };
  });

  // CREATE SNACK
  app.post("/", { preHandler: [checkSession] }, async (request, reply) => {
    const requestBodySchema = z.object({
      title: z.string(),
      description: z.string(),
      diet: z.boolean(),
      created_at: z.string().optional(),
    });

    const { title, description, diet, created_at } = requestBodySchema.parse(
      request.body,
    );

    let data = {};

    if (created_at) {
      data = {
        id: randomUUID(),
        title,
        description,
        diet,
        created_at,
        user_id: request.user?.id,
      };
    } else {
      data = {
        id: randomUUID(),
        title,
        description,
        diet,
        user_id: request.user?.id,
      };
    }

    await knex("snacks")
      .insert(data)
      .then(() => {
        reply.status(201).send();
      });
  });

  // UPDATE SNACK
  app.put("/:id", { preHandler: [checkSession] }, async (request, reply) => {
    const requestBodySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      diet: z.boolean().optional(),
      created_at: z.string().optional(),
    });

    const requestParamsSchema = z.object({
      id: z.string(),
    });

    const { title, description, diet, created_at } = requestBodySchema.parse(
      request.body,
    );

    const { id } = requestParamsSchema.parse(request.params);

    const dietBoolean = diet ? 1 : 0;

    const currentSnack = await knex("snacks")
      .where({ id, user_id: request.user?.id })
      .select()
      .first();

    await knex("snacks")
      .where({ id, user_id: request.user?.id })
      .update({
        title: title ?? currentSnack?.title,
        description: description ?? currentSnack?.description,
        diet: dietBoolean ?? currentSnack?.diet,
        created_at: created_at ?? currentSnack?.created_at,
      })
      .then(() => {
        reply.status(201);
      });
  });

  // DELETE
  app.delete("/:id", { preHandler: [checkSession] }, async (request, reply) => {
    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = requestParamsSchema.parse(request.params);

    await knex("snacks")
      .where({ id, user_id: request.user?.id })
      .delete()
      .then((res) => {
        if (res === 1) {
          reply.status(200).send("Snack deleted");
        }
        if (res === 0) {
          reply.status(404).send("Snack not found");
        }
      });
  });
}
