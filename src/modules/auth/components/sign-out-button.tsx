"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      fullWidth
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-red-500 hover:bg-red-50 hover:text-red-600"
    >
      🚪 Cerrar sesión
    </Button>
  );
}
