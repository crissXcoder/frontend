import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-lg bg-card text-card-foreground border border-border rounded-xl shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-bg text-success font-bold text-xl mb-4">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          ¡Sesión iniciada con éxito!
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Bienvenido a ResDigital. Este es el espacio base para el Dashboard (MOD-04).
        </p>
        <Link
          href="/"
          className="inline-flex py-2 px-4 rounded-md border border-border bg-card text-foreground font-medium text-sm hover:bg-muted transition-colors shadow-sm"
        >
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
}
