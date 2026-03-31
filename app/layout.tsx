import './globals.css'

export const metadata = {
  title: 'Arquitectura Moderna',
  description: 'Enciclopedia de estilos arquitectónicos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        <header className="bg-white border-b sticky top-0">
          <nav className="max-w-6xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold">🏛️ Arquitectura Moderna</h1>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t mt-16 py-8 text-center text-gray-500 text-sm">
          <p>Contenido open source - Imágenes de dominio público</p>
        </footer>
      </body>
    </html>
  )
}