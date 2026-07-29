export default function FirebaseSetupNeeded() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-4xl">🔧</p>
      <h1 className="mt-3 text-xl font-bold text-gray-900">Falta configurar Firebase</h1>
      <p className="mt-2 text-sm text-gray-600">
        Esta app necesita las credenciales de un proyecto Firebase para funcionar (autenticación, base de datos y
        almacenamiento de imágenes).
      </p>
      <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-left text-sm text-gray-600">
        <li>
          Creá un proyecto en{' '}
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noreferrer"
            className="text-brand-700 hover:underline"
          >
            Firebase Console
          </a>
          .
        </li>
        <li>Habilitá Authentication (Email/Password), Firestore y Storage.</li>
        <li>
          Copiá <code className="rounded bg-gray-100 px-1">.env.example</code> a{' '}
          <code className="rounded bg-gray-100 px-1">.env</code> y completá las credenciales de tu app web.
        </li>
        <li>Reiniciá el servidor de desarrollo.</li>
      </ol>
      <p className="mt-4 text-xs text-gray-400">Ver el README del proyecto para instrucciones completas.</p>
    </div>
  );
}
