import type { HTMLAttributes } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  message: string;
}

const variantStyles: Record<AlertVariant, { wrapper: string; icon: string }> = {
  success: {
    wrapper: "bg-green-50 border-green-200 text-green-800",
    icon: "✅",
  },
  error: {
    wrapper: "bg-red-50 border-red-200 text-red-800",
    icon: "❌",
  },
  warning: {
    wrapper: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: "⚠️",
  },
  info: {
    wrapper: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "ℹ️",
  },
};

export function Alert({ variant = "info", title, message, className = "" }: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={[
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        styles.wrapper,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="alert"
    >
      <span>{styles.icon}</span>
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p>{message}</p>
      </div>
    </div>
  );
}
