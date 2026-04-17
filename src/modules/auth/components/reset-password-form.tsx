"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  passwordResetRequestSchema,
  passwordResetSchema,
  type PasswordResetRequestInput,
  type PasswordResetInput,
} from "@/lib/validations/auth";
import {
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/modules/auth/actions/reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

// ─── Request form ─────────────────────────────────────────────────────────────

export function RequestResetForm() {
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  async function onSubmit(data: PasswordResetRequestInput) {
    const result = await requestPasswordResetAction(data);
    if (result.success) setFeedback(result.message);
    else setFeedback(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {feedback && <Alert variant="success" message={feedback} />}

      <Input
        label="Email de tu cuenta"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Enviar enlace de recuperación
      </Button>

      <Link
        href="/auth/login"
        className="text-center text-sm text-indigo-600 hover:underline"
      >
        Volver al inicio de sesión
      </Link>
    </form>
  );
}

// ─── New password form ────────────────────────────────────────────────────────

export function NewPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: PasswordResetInput) {
    setError(null);
    const result = await resetPasswordAction(data);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/auth/login?reset=success");
  }

  if (!token) {
    return <Alert variant="error" message="Token inválido. Solicita un nuevo enlace." />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {error && <Alert variant="error" message={error} />}

      <input type="hidden" {...register("token")} />

      <Input
        label="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        hint="Mínimo 8 caracteres, una mayúscula y un número."
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Cambiar contraseña
      </Button>
    </form>
  );
}
