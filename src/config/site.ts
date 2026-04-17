export const siteConfig = {
  name: "Winnex",
  description:
    "Plataforma de sorteos, concursos y recompensas. Participa, gana puntos y desbloquea premios.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/winnex",
  },
  supportEmail: "soporte@winnex.app",
} as const;
