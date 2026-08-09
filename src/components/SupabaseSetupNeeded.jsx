export default function SupabaseSetupNeeded() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="mb-3 font-serif text-xl font-semibold text-ink">Falta configurar Supabase</h1>
      <p className="mb-6 text-sm text-muted">
        Esta app necesita las credenciales de un proyecto Supabase para funcionar (autenticación
        y base de datos).
      </p>
      <ol className="mx-auto max-w-sm list-inside list-decimal space-y-2 text-left text-sm text-ink">
        <li>
          Creá un proyecto en{" "}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:underline"
          >
            Supabase
          </a>
          .
        </li>
        <li>
          Ejecutá el contenido de <code className="rounded bg-cream px-1">supabase/migrations/0001_init.sql</code>{" "}
          en el SQL Editor del proyecto.
        </li>
        <li>
          Copiá <code className="rounded bg-cream px-1">.env.example</code> a{" "}
          <code className="rounded bg-cream px-1">.env.local</code> y completá las credenciales
          (Project Settings → API).
        </li>
        <li>Reiniciá el servidor de desarrollo.</li>
      </ol>
      <p className="mt-6 text-xs text-muted">Ver el README del proyecto para instrucciones completas.</p>
    </div>
  );
}
