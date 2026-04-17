import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "@/modules/auth/actions/verify-email";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verificar email — Winnex",
};

interface VerifyPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { token } = await searchParams;

  // No token = instrucciones pendientes
  if (!token) {
    return (
      <Card>
        <div className="text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900">Revisa tu email</h1>
          <p className="mt-2 text-sm text-gray-500">
            Te enviamos un enlace de verificación. Haz clic en él para activar
            tu cuenta.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            ¿No llegó?{" "}
            <Link href="/auth/login" className="text-indigo-600 hover:underline">
              Intenta iniciar sesión
            </Link>{" "}
            y te lo reenviaremos.
          </p>
        </div>
      </Card>
    );
  }

  const result = await verifyEmailAction(token);

  if (!result.success) {
    return (
      <Card>
        <Alert variant="error" message={result.error} />
        <div className="mt-4 text-center">
          <Link href="/auth/login">
            <Button variant="secondary">Volver al login</Button>
          </Link>
        </div>
      </Card>
    );
  }

  redirect("/auth/login?verified=true");
}
