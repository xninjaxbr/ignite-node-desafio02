import "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    user?: {
      id: string;
      name: string;
      email: string;
      password: string;
      created_at: string;
    };
  }
}
