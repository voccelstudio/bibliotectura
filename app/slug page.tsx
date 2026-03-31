import { notFound } from 'next/navigation'

// Base de datos de estilos con recomendaciones
const estilosData: Record<string, any> = {
  brutalismo: {
    nombre: 'Brutalismo',
    era: '1950-1970',
    origen: 'Reino Unido',
    descripcion: 'Movimiento arquitectónico que celebra el hormigón visto, las estructuras monumentales y la honestidad material. El término proviene del francés "béton brut" (hormigón en bruto), acuñado por Le Corbusier.',
    caracteristicas: ['Hormigón visto', 'Estructuras monumentales', 'Geometría repetitiva', 'Materialidad honesta'],
    figuras: ['Le Corbusier', 'Alison Smithson', 'Peter Smithson', 'Paul Rudolph'],
    interiorismo: [
      { nombre: 'Industrial', score: 95, descripcion: 'Estructuras metálicas expuestas, tuberías vistas, mobiliario de acero.' },
      { nombre: 'Wabi-Sabi', score: 85, descripcion: 'Imperfección y textura, celebración de lo natural y las marcas del tiempo.' },
      { nombre: 'Minimalista', score: 80, descripcion: 'Menos es más, dejar que el material hable por sí mismo.' }
    ],
    paisajismo: [
      { nombre: 'Xeriscape', score: 92, descripcion: 'Bajo consumo hídrico, texturas áridas, cactus y agaves.' },
      { nombre: 'Rústico controlado', score: 78, descripcion: 'Vegetación contenida, macetas de hormigón, grava y piedras.' }
    ],
    materiales: {
      arquitectura: ['Hormigón visto', 'Acero corten', 'Vidrio industrial'],
      interior: ['Metal negro', 'Madera recuperada', 'Cuero envejecido'],
      exterior: ['Grava', 'Piedra volcánica', 'Hormigón texturado']
    }
  },
  modernismo: {
    nombre: 'Modernismo',
    era: '1920-1960',
    origen: 'Europa',
    descripcion: 'Movimiento que rompió con las tradiciones históricas, priorizando la función sobre la forma, líneas limpias y la integración con la naturaleza.',
    caracteristicas: ['Líneas limpias', 'Plantas libres', 'Ventanas corridas', 'Integración naturaleza'],
    figuras: ['Le Corbusier', 'Mies van der Rohe', 'Frank Lloyd Wright', 'Walter Gropius'],
    interiorismo: [
      { nombre: 'Mid-Century', score: 95, descripcion: 'Muebles orgánicos, madera, formas curvas y funcionalidad.' },
      { nombre: 'Minimalista', score: 90, descripcion: 'Espacios despejados, mobiliario escultórico, luz natural.' }
    ],
    paisajismo: [
      { nombre: 'Jardín moderno', score: 88, descripcion: 'Geometría, líneas limpias, integración interior-exterior.' }
    ],
    materiales: {
      arquitectura: ['Hormigón blanco', 'Acero', 'Vidrio', 'Piedra'],
      interior: ['Madera noble', 'Cuero', 'Mármol', 'Acero cromado'],
      exterior: ['Piedra laja', 'Jardineras integradas', 'Espejos de agua']
    }
  },
  'art-deco': {
    nombre: 'Art Decó',
    era: '1925-1940',
    origen: 'Francia',
    descripcion: 'Estilo elegante que combina geometría, ornamentación moderna y materiales lujosos. Simboliza el glamour y la modernidad de los años 20 y 30.',
    caracteristicas: ['Geometría', 'Ornamentación', 'Materiales lujosos', 'Verticalidad'],
    figuras: ['Émile-Jacques Ruhlmann', 'William Van Alen', 'Tamara de Lempicka'],
    interiorismo: [
      { nombre: 'Glamour', score: 95, descripcion: 'Espejos, dorados, formas geométricas, lujo y sofisticación.' },
      { nombre: 'Streamline', score: 85, descripcion: 'Formas aerodinámicas, líneas curvas, cromo y vidrio.' }
    ],
    paisajismo: [
      { nombre: 'Jardín formal', score: 75, descripcion: 'Geometría, simetría, fuentes ornamentales.' }
    ],
    materiales: {
      arquitectura: ['Piedra caliza', 'Acero', 'Terracota', 'Vidrio decorado'],
      interior: ['Marfil', 'Ébano', 'Cromo', 'Vidrio tallado', 'Espejos'],
      exterior: ['Piedra', 'Bronce', 'Jardineras geométricas']
    }
  }
}

export default function EstiloPage({ params }: { params: { slug: string } }) {
  const estilo = estilosData[params.slug]
  
  if (!estilo) {
    notFound()
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Título */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{estilo.nombre}</h1>
        <p className="text-gray-600">{estilo.era} · {estilo.origen}</p>
      </div>
      
      {/* Descripción */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
        <p className="text-gray-700 leading-relaxed">{estilo.descripcion}</p>
      </div>
      
      {/* Características */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3">Características</h2>
        <div className="flex flex-wrap gap-2">
          {estilo.caracteristicas.map((c: string) => (
            <span key={c} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {c}
            </span>
          ))}
        </div>
      </div>
      
      {/* Figuras clave */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3">Figuras clave</h2>
        <div className="flex flex-wrap gap-2">
          {estilo.figuras.map((f: string) => (
            <span key={f} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {f}
            </span>
          ))}
        </div>
      </div>
      
      {/* Interiorismo */}
      {estilo.interiorismo && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🪑 Interiorismo que combina</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {estilo.interiorismo.map((item: any) => (
              <div key={item.nombre} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">{item.nombre}</h3>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {item.score}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Paisajismo */}
      {estilo.paisajismo && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🌿 Paisajismo que complementa</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {estilo.paisajismo.map((item: any) => (
              <div key={item.nombre} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">{item.nombre}</h3>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {item.score}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Materiales */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🎨 Paleta de materiales</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-bold mb-2">Arquitectura</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {estilo.materiales.arquitectura.map((m: string) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-bold mb-2">Interior</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {estilo.materiales.interior.map((m: string) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-bold mb-2">Exterior</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {estilo.materiales.exterior.map((m: string) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}