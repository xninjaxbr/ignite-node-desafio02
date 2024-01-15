// eslint-disable-next-line
import { knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    user: {
      id: string;
      name: string;
      email: string;
      password: string;
      created_at: string;
    };
    snacks: {
      id: string;
      title: string;
      description: string;
      user_id: string;
      created_at: string;
      diet: number;
    };
  }
}
