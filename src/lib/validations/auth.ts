import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(100)
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[0-9]/, "Debe tener al menos un número"),
  displayName: z.string().min(2, "Mínimo 2 caracteres").max(50).optional(),
  referralCode: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const passwordResetSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
      .regex(/[0-9]/, "Debe tener al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
