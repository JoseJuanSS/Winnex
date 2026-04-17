import { Suspense } from "react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import {
  RequestResetForm,
  NewPasswordForm,
} from "@/modules/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña — Winnex",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const isNewPassword = !!token;

  return (
    <Card>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNewPassword ? "Nueva contraseña" : "Recuperar contraseña"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isNewPassword
            ? "Elige una contraseña segura para tu cuenta."
            : "Te enviaremos un enlace para restablecer tu contraseña."}
        </p>
      </div>
      <Suspense>
        {isNewPassword ? <NewPasswordForm /> : <RequestResetForm />}
      </Suspense>
    </Card>
  );
}
