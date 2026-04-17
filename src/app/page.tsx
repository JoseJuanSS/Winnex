import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">

      {/* Nav */}
      <header className="w-full px-6 py-5 flex items-center justify-between max-w-screen-lg mx-auto">
        <span className="text-2xl font-black text-indigo-600 tracking-tight">Winnex</span>
        <div className="flex gap-3">
          <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">
            Entrar
          </Link>
          <Link href="/auth/register" className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
            Empieza gratis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 gap-8">
        <div className="flex flex-col gap-4 max-w-2xl">
          <span className="text-5xl">🏆</span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
            Participa, gana puntos<br />
            <span className="text-indigo-600">y llévate premios reales.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Winnex es la plataforma donde puedes competir en concursos, acumular puntos
            con cada acción y ganar premios. Gratis, transparente y sin trampa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Link
            href="/auth/register"
            className="flex-1 text-center font-bold text-white bg-indigo-600 px-6 py-4 rounded-2xl text-base hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Crear cuenta gratis ✨
          </Link>
          <Link
            href="/campaigns"
            className="flex-1 text-center font-semibold text-indigo-700 bg-indigo-50 px-6 py-4 rounded-2xl text-base hover:bg-indigo-100 transition-colors"
          >
            Ver campañas 🏆
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-xs text-gray-400">
          Sin tarjeta de crédito · Siempre hay una entrada gratuita · Transparente
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {[
            "⭐ Puntos diarios",
            "🔥 Rachas de streak",
            "🏆 Concursos de habilidad",
            "👥 Invita y gana",
            "🎁 Premios reales",
          ].map((f) => (
            <span
              key={f}
              className="text-sm bg-white border border-gray-100 text-gray-600 px-4 py-1.5 rounded-full shadow-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6 px-4">
        © {new Date().getFullYear()} Winnex · La mecánica de sorteos opera bajo permisos legales vigentes.
      </footer>

    </div>
  );
}
