export default function SupabaseSetupNeeded() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="mb-3 text-xl font-bold text-gray-900">Falta configurar Supabase</h1>
      <p className="mb-6 text-sm text-gray-500">
        Esta app necesita las credenciales de un proyecto Supabase para funcionar (autenticación
        y base de datos).
      </p>
      <ol className="mx-auto max-w-sm list-inside list-decimal space-y-2 text-left text-sm text-gray-600">
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
          Ejecutá el contenido de <code className="rounded bg-gray-100 px-1">supabase/migrations/0001_init.sql</code>{" "}
          en el SQL Editor del proyecto.
        </li>
        <li>
          Copiá <code className="rounded bg-gray-100 px-1">.env.example</code> a{" "}
          <code className="rounded bg-gray-100 px-1">.env.local</code> y completá las credenciales
          (Project Settings → API).
        </li>
        <li>Reiniciá el servidor de desarrollo.</li>
      </ol>
      <p className="mt-6 text-xs text-gray-400">Ver el README del proyecto para instrucciones completas.</p>
    </div>
  );
}
