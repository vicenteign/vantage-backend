import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Bienvenido a Vantage.ai</h1>
        <p className="mt-4 text-lg">La plataforma que conecta a la industria.</p>
        <div className="mt-8 space-x-4">
          <Link 
            href="/auth/register" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
          >
            Registrarse
          </Link>
          <Link 
            href="/auth/login" 
            className="inline-block px-6 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-md hover:bg-indigo-50 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
