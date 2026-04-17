import { Suspense } from "react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/modules/auth/components/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta — Winnex",
  description: "Únete gratis y empieza a ganar premios hoy mismo.",
};

export default function RegisterPage() {
  return (
    <Card>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gratis. Sin tarjeta. Empieza a ganar hoy.
        </p>
      </div>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </Card>
  );
}
