import type { DefaultSession } from "next-auth";
import type { userRoleEnum } from "@/lib/db/schema";

export type UserRole = (typeof userRoleEnum.enumValues)[number];

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}
