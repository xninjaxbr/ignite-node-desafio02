import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { knex } from "../database";

export async function checkSession(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const cookieUserIdSchema = z.string().uuid();
  const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    password: z.string(),
    created_at: z.string(),
  });

  const id = cookieUserIdSchema.safeParse(request.cookies.userId);

  if (!id.success) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const checkUser = await knex("user").where({ id: id.data }).select().first();

  const user = userSchema.safeParse(checkUser);

  if (!user.success) {
    return reply.status(401).send({ error: "User not found" });
  }

  request.user = user.data;
}
