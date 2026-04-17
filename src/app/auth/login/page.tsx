import { Suspense } from "react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/modules/auth/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — Winnex",
  description: "Accede a tu cuenta para participar en sorteos y concursos.",
};

export default function LoginPage() {
  return (
    <Card>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h1>
        <p className="mt-1 text-sm text-gray-500">
          Inicia sesión para continuar participando.
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </Card>
  );
}
