import Link from 'next/link'

// Datos en el mismo archivo (simplificado)
const estilos = [
  {
    slug: 'brutalismo',
    nombre: 'Brutalismo',
    era: '1950-1970',
    descripcion: 'Hormigón visto, estructuras monumentales y honestidad material.',
    imagen: '/placeholder.jpg'
  },
  {
    slug: 'modernismo',
    nombre: 'Modernismo',
    era: '1920-1960',
    descripcion: 'Líneas limpias, funcionalidad y "menos es más".',
    imagen: '/placeholder.jpg'
  },
  {
    slug: 'art-deco',
    nombre: 'Art Decó',
    era: '1925-1940',
    descripcion: 'Elegancia geométrica, ornamentación y lujo moderno.',
    imagen: '/placeholder.jpg'
  }
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Arquitectura Moderna</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Descubrí estilos arquitectónicos y encontrá combinaciones de interiorismo y paisajismo.
        </p>
      </div>

      {/* Grid de estilos */}
      <div className="grid md:grid-cols-3 gap-6">
        {estilos.map((estilo) => (
          <Link key={estilo.slug} href={`/estilos/${estilo.slug}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                🏛️
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold">{estilo.nombre}</h2>
                  <span className="text-sm text-gray-500">{estilo.era}</span>
                </div>
                <p className="text-gray-600 mt-2 text-sm">{estilo.descripcion}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}