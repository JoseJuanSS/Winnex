"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInInput) {
    setServerError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Email o contraseña incorrectos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {serverError && <Alert variant="error" message={serverError} />}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="flex flex-col gap-1.5">
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Link
          href="/auth/reset-password"
          className="self-end text-xs text-indigo-600 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/register" className="font-medium text-indigo-600 hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
