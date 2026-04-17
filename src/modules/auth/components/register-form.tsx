"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { signUpAction } from "@/modules/auth/actions/sign-up";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get("ref") ?? "";
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { referralCode: prefillCode },
  });

  async function onSubmit(data: SignUpInput) {
    setFeedback(null);
    const result = await signUpAction(data);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      return;
    }

    setFeedback({ type: "success", message: result.message });
    setTimeout(() => router.push("/auth/login"), 3000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "error"}
          message={feedback.message}
        />
      )}

      <Input
        label="Nombre de usuario"
        type="text"
        autoComplete="username"
        placeholder="winnero123"
        hint="Solo letras, números y guiones bajos. 3–20 caracteres."
        error={errors.username?.message}
        {...register("username")}
      />

      <Input
        label="Nombre para mostrar"
        type="text"
        autoComplete="name"
        placeholder="Tu nombre"
        error={errors.displayName?.message}
        {...register("displayName")}
      />

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        hint="Mínimo 8 caracteres, una mayúscula y un número."
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Código de referido (opcional)"
        type="text"
        placeholder="WINXYZ"
        error={errors.referralCode?.message}
        {...register("referralCode")}
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isSubmitting}
        disabled={feedback?.type === "success"}
        className="mt-1"
      >
        Crear cuenta gratis
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="font-medium text-indigo-600 hover:underline">
          Inicia sesión
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400">
        Al registrarte aceptas los{" "}
        <Link href="/legal/terms" className="underline">Términos de uso</Link>
        {" "}y la{" "}
        <Link href="/legal/privacy" className="underline">Política de privacidad</Link>.
      </p>
    </form>
  );
}
