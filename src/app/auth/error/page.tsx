import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Error de autenticación — Winnex" };

const ERRORS: Record<string, string> = {
  Configuration: "Error de configuración del servidor.",
  AccessDenied: "Acceso denegado.",
  Verification: "El enlace de verificación expiró o ya fue usado.",
  Default: "Ocurrió un error inesperado.",
};

interface ErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const { error } = await searchParams;
  const message = ERRORS[error ?? "Default"] ?? ERRORS.Default;

  return (
    <Card>
      <div className="text-center flex flex-col items-center gap-4">
        <span className="text-5xl">⚠️</span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Error de autenticación</h1>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/auth/login">
            <Button variant="primary">Ir al login</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Inicio</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
