/* ══════════════════════════════════════
   DATA.JS — Bioclimática Paraguay
══════════════════════════════════════ */

const ZONES = [
  { id:'subtropical', name:'Subtropical húmedo', color:'#3B8BD4', region:'Región Oriental — Asunción, Central, Cordillera',
    temp:'28–38°C', hum:'70–90%', lluvia:'1400 mm/año', viento:'NE predominante',
    desc:'Veranos calurosos y húmedos, inviernos templados. La humedad elevada intensifica la sensación de calor. El principal desafío es el control solar combinado con ventilación efectiva. La orientación N-S de los espacios principales es determinante.',
    reto:'Control solar + ventilación en alta humedad',
    tags:['Ventilación cruzada','Masa térmica moderada','Control solar N y O'], windDeg:45,
    lluviaMensual:[140,145,145,110,90,70,70,70,90,130,140,155],
    estaciones:{
      verano:    { meses:'Dic–Mar', icon:'☀️', tmp:'35–38°C', mm:580, tip:'Ventilación cruzada N→S las 24h. Aleros de 70 cm al norte activos. Cerrar fachada oeste de 13–19h. Evitar ganancias de tarde a toda costa.' },
      otono:     { meses:'Abr–May', icon:'🍂', tmp:'24–30°C', mm:200, tip:'Período de transición ideal. Abrir completamente norte y sur. Airear masa térmica de noche cuando baja de 22°C.' },
      invierno:  { meses:'Jun–Ago', icon:'❄️', tmp:'12–20°C', mm:210, tip:'Captación solar norte obligatoria. Cerrar abertura sur de noche. Riesgo de heladas leves en Asunción: proteger plantas sensibles.' },
      primavera: { meses:'Sep–Nov', icon:'🌸', tmp:'28–36°C', mm:360, tip:'Lluvias tormentosas frecuentes. Activar sombreado vegetal caducifolio antes de diciembre. Ventilación nocturna activa.' },
    }
  },
  { id:'chaco', name:'Semiárido Chaco', color:'#EF9F27', region:'Región Occidental — Boquerón, Alto Paraguay',
    temp:'35–45°C', hum:'30–50%', lluvia:'500–800 mm/año', viento:'Variable, cálido',
    desc:'El Chaco registra las temperaturas más extremas de Sudamérica. Amplitud térmica diaria de 20°C. La baja humedad permite enfriamiento evaporativo. Suelo arcilloso expansivo que condiciona fundaciones.',
    reto:'Extremos térmicos + escasez hídrica',
    tags:['Masa térmica alta','Enfriamiento evaporativo','Patio central'], windDeg:135,
    lluviaMensual:[75,80,65,55,30,20,15,15,20,45,60,70],
    estaciones:{
      verano:    { meses:'Nov–Mar', icon:'☀️', tmp:'38–46°C', mm:355, tip:'Ventilar únicamente de noche (21–6h). Hermetizar de día. Sistema evaporativo activo al máximo. Minimizar actividad diurna en espacios sin protección.' },
      otono:     { meses:'Abr–May', icon:'🍂', tmp:'25–35°C', mm:85,  tip:'Mejor período del año. Ventilación diurna habilitada. Masa térmica en fase de carga óptima. Realizar mantenimiento de equipos.' },
      invierno:  { meses:'Jun–Ago', icon:'❄️', tmp:'8–22°C',  mm:50,  tip:'Amplitud diaria de 20°C aprovechable. Captar sol norte activamente durante el día. Ventilación nocturna para enfriar la masa y acumular frío.' },
      primavera: { meses:'Sep–Oct', icon:'🌸', tmp:'30–40°C', mm:65,  tip:'Inicio del ciclo de calor extremo. Preparar y revisar todo el sistema de sombra, masa y evaporativo antes de noviembre.' },
    }
  },
  { id:'misionero', name:'Subtropical misionero', color:'#1D9E75', region:'Sur — Itapúa, Misiones, Ñeembucú',
    temp:'24–34°C', hum:'65–80%', lluvia:'1600–1900 mm/año', viento:'S y SE',
    desc:'Lluvias abundantes y vegetación subtropical densa. Temperaturas más moderadas que Asunción. Napas freáticas elevadas que condicionan las fundaciones y el diseño de losas.',
    reto:'Lluvias extremas + napas freáticas altas',
    tags:['Techos inclinados','Recolección pluvial','Sombreado vegetal'], windDeg:180,
    lluviaMensual:[165,165,175,150,120,100,95,100,135,160,175,180],
    estaciones:{
      verano:    { meses:'Nov–Mar', icon:'☀️', tmp:'30–36°C', mm:860, tip:'Lluvias intensas y frecuentes. Gestión pluvial crítica — revisar canaletas. Efecto chimenea activo. Evitar condensación en superficies frías.' },
      otono:     { meses:'Abr–May', icon:'🍂', tmp:'22–30°C', mm:270, tip:'Período ideal de confort. Ventilación natural completa. Mantenimiento preventivo de impermeabilización y techo verde.' },
      invierno:  { meses:'Jun–Ago', icon:'❄️', tmp:'12–22°C', mm:295, tip:'Lluvias aún frecuentes. Cubiertas inclinadas al máximo. Proteger de vientos fríos del sur. Priorizar captación solar norte.' },
      primavera: { meses:'Sep–Nov', icon:'🌸', tmp:'26–34°C', mm:295, tip:'Inicio de lluvias intensas. Techo verde en plena actividad de retención. Verificar sistema de drenaje antes de la temporada.' },
    }
  },
  { id:'transicion', name:'Zona de transición', color:'#D85A30', region:'Centro — San Pedro, Caaguazú, Canindeyú',
    temp:'26–36°C', hum:'60–75%', lluvia:'1100–1400 mm/año', viento:'Variable',
    desc:'Zona intermedia entre el subtropical húmedo y el semiárido. Variaciones estacionales marcadas. Gran potencial para estrategias pasivas de doble función.',
    reto:'Variabilidad estacional marcada',
    tags:['Flexibilidad estacional','Ventilación nocturna','Microclima vegetal'], windDeg:90,
    lluviaMensual:[120,120,130,95,75,60,55,55,75,105,120,135],
    estaciones:{
      verano:    { meses:'Nov–Mar', icon:'☀️', tmp:'30–38°C', mm:590, tip:'Modo OR: ventilación cruzada N→S. Sombreado vegetal caducifolio activo. Cerrar fachada oeste en horas pico.' },
      otono:     { meses:'Abr–May', icon:'🍂', tmp:'22–30°C', mm:170, tip:'Ajustar aberturas regulables al modo invierno progresivamente. Aprovechar días templados para airear.' },
      invierno:  { meses:'Jun–Ago', icon:'❄️', tmp:'10–20°C', mm:170, tip:'Modo Chaco: captar sol norte activamente. Posibles heladas. Cortaviento vegetal al sur es esencial.' },
      primavera: { meses:'Sep–Nov', icon:'🌸', tmp:'26–36°C', mm:215, tip:'Abrir al modo verano. Ventilación nocturna activa cuando temperatura baja más de 8°C.' },
    }
  },
];

const STRATS = [
  { icon:'🌬️', name:'Ventilación cruzada', cat:'ventilacion', desc:'Aberturas opuestas N-S generan flujo de aire. Abertura norte = 60%, sur = 40% del área total. Velocidad mínima de confort: 0.5 m/s.', tags:['OR','Transición'] },
  { icon:'☀️', name:'Control solar — aleros', cat:'sombreado', desc:'Alero de 60–80 cm en fachada norte bloquea sol de verano (88°) y permite sol de invierno (41°) para latitud 25°S.', tags:['Todas las zonas'] },
  { icon:'🧱', name:'Masa térmica', cat:'masa', desc:'Muros de 20–30 cm retardan el calor 6–10 horas. En el Chaco, la amplitud de 20°C permite absorber calor de día y liberarlo de noche.', tags:['Chaco','Transición'] },
  { icon:'💧', name:'Enfriamiento evaporativo', cat:'ventilacion', desc:'El aire seco del Chaco (HR 30–50%) puede enfriarse 4–8°C con superficies húmedas. No funciona en la OR (HR >70%).', tags:['Chaco'] },
  { icon:'🌿', name:'Sombreado vegetal', cat:'sombreado', desc:'Árboles caducos al norte: sombra en verano, sol en invierno. Lapacho, timbó, tataré. Enredaderas en fachadas E y O.', tags:['OR','Misionero'] },
  { icon:'🏠', name:'Cubierta fría', cat:'cubierta', desc:'Albedo >0.65 reduce temperatura interior 3–5°C. Chapa blanca, membrana PVC blanca, cámara de aire ventilada de 15 cm.', tags:['Todas las zonas'] },
  { icon:'🌙', name:'Ventilación nocturna', cat:'ventilacion', desc:'Abrir de 21–6 hs en zonas con amplitud >10°C. Cerrar herméticamente de día. Reducción de 4–7°C en temperatura interior.', tags:['Chaco','Transición'] },
  { icon:'🏛️', name:'Patio central', cat:'forma', desc:'Microclima 2–4°C más fresco. Eje N-S. Ancho mínimo = 0.5× la altura de los muros circundantes.', tags:['Todas las zonas'] },
  { icon:'📐', name:'Orientación del edificio', cat:'forma', desc:'Eje largo O-E. Compacto en Chaco, elongado en OR. Relación largo:ancho óptima 1.3–1.7.', tags:['Todas las zonas'] },
  { icon:'🔲', name:'Celosías y parasoles', cat:'sombreado', desc:'Celosías verticales a 20–30° en fachadas E y O. Más efectivas que horizontales para sol bajo. Reducen ganancia hasta 70%.', tags:['OR','MIS','Chaco'] },
  { icon:'💨', name:'Efecto chimenea', cat:'ventilacion', desc:'Diferencia de altura entre aberturas extrae el aire caliente por convección. Mínimo 3 m de altura efectiva.', tags:['Todas las zonas'] },
  { icon:'🌱', name:'Techo verde extensivo', cat:'cubierta', desc:'Sustrato 8–15 cm. Reduce temperatura superficial hasta 20°C. Retención hídrica 40–60%. Peso: 80–150 kg/m².', tags:['Misionero','OR'] },
  { icon:'🕳️', name:'Pozo canadiense (geotermia pasiva)', cat:'ventilacion', desc:'Tubería enterrada a 1.5–3 m de profundidad (temperatura estable ~22°C). El aire precircula por la tubería antes de ingresar. En verano enfría 6–12°C, en invierno precalienta 4–8°C.', tags:['Todas las zonas'] },
  { icon:'🌡️', name:'Invernadero adosado (Trombe)', cat:'masa', desc:'Galería vidriada al norte con masa térmica (muro Trombe de 30–40 cm). Capta sol de invierno (41°) y distribuye calor por convección natural. En verano se ventila al exterior.', tags:['Transición','Misionero'] },
  { icon:'🔆', name:'Brise-soleil regulable', cat:'sombreado', desc:'Paneles verticales orientables en fachada E y O. Ángulo de 0° en verano (bloquea 80% de radiación) y 45° en invierno (permite paso de sol bajo).', tags:['OR','Chaco'] },
  { icon:'🏗️', name:'Pérgola bioclimática', cat:'sombreado', desc:'Pérgola con lamas orientables motorizadas sobre patios o terrazas. Detecta lluvia y cierra automáticamente. Apertura variable según ángulo solar.', tags:['OR','Misionero'] },
  { icon:'🧊', name:'Cubierta reflectiva (cool roof)', cat:'cubierta', desc:'Pintura reflectiva cerámica o membrana blanca con albedo >0.85. Reduce temperatura de cubierta hasta 25°C comparado con chapa oscura. Ideal para naves y galpones.', tags:['Chaco','OR'] },
  { icon:'🪟', name:'Doble fachada ventilada', cat:'forma', desc:'Fachada exterior con cámara de aire de 30–80 cm y segunda piel de vidrio o policarbonato. El efecto chimenea en la cámara extrae el calor antes de que llegue al muro interior.', tags:['OR','Transición'] },
  { icon:'🔥', name:'Horno solar pasivo', cat:'masa', desc:'Acumulador de calor con piedras basálticas debajo del piso, conectado a la fachada norte. El sol calienta las piedras durante el día, irradian calor al interior por la noche en invierno.', tags:['Transición','Chaco'] },
];

const MATS = [
  { name:'Ladrillo cerámico hueco',  lam:'0.41',  masa:'Muy alta',  ais:'Media',     mv:90,  av:50, col:'#D85A30', zon:'OR · MIS' },
  { name:'Ladrillo macizo cocido',   lam:'0.70',  masa:'Muy alta',  ais:'Baja',      mv:95,  av:25, col:'#D85A30', zon:'Chaco' },
  { name:'Hormigón (20 cm)',         lam:'1.63',  masa:'Muy alta',  ais:'Muy baja',  mv:100, av:10, col:'#888780', zon:'Chaco' },
  { name:'Adobe estabilizado',       lam:'0.52',  masa:'Alta',      ais:'Media',     mv:85,  av:45, col:'#BA7517', zon:'Chaco · Trans' },
  { name:'Bloque de hormigón',       lam:'0.79',  masa:'Alta',      ais:'Baja',      mv:82,  av:20, col:'#888780', zon:'OR · Chaco' },
  { name:'Madera nativa (30 mm)',    lam:'0.14',  masa:'Baja',      ais:'Alta',      mv:25,  av:80, col:'#639922', zon:'OR · MIS' },
  { name:'Panel de bambú',           lam:'0.17',  masa:'Baja',      ais:'Alta',      mv:20,  av:78, col:'#1D9E75', zon:'OR · MIS' },
  { name:'Placa yeso-cartón',        lam:'0.25',  masa:'Muy baja',  ais:'Media',     mv:10,  av:55, col:'#C8C6BC', zon:'Interior' },
  { name:'Poliestireno expandido',   lam:'0.04',  masa:'Nula',      ais:'Muy alta',  mv:0,   av:98, col:'#B5D4F4', zon:'Cubiertas' },
  { name:'Lana de roca (50 mm)',     lam:'0.036', masa:'Nula',      ais:'Muy alta',  mv:0,   av:99, col:'#F5C4B3', zon:'Cubiertas' },
  { name:'Chapa zinc prepintada',    lam:'50.0',  masa:'Nula',      ais:'Nula',      mv:2,   av:2,  col:'#C8C6BC', zon:'+aislación' },
  { name:'Membrana asfáltica',       lam:'0.17',  masa:'Nula',      ais:'Media',     mv:0,   av:55, col:'#555',    zon:'Imperme.' },
  { name:'Vidrio simple (6 mm)',     lam:'1.05',  masa:'Nula',      ais:'Muy baja',  mv:0,   av:12, col:'#85B7EB', zon:'Aberturas' },
  { name:'DVH bajo emisivo',         lam:'0.60',  masa:'Nula',      ais:'Media',     mv:0,   av:55, col:'#3B8BD4', zon:'Aberturas' },
  { name:'Bloque suelo-cemento',     lam:'0.52',  masa:'Alta',      ais:'Media',     mv:78,  av:45, col:'#BA7517', zon:'OR · Chaco' },
  { name:'Fardo de paja (40 cm)',    lam:'0.07',  masa:'Baja',      ais:'Muy alta',  mv:15,  av:90, col:'#D4B872', zon:'MIS · Trans' },
  { name:'Tierra compactada (30 cm)',lam:'0.65',  masa:'Muy alta',  ais:'Baja',      mv:92,  av:30, col:'#A0845C', zon:'Chaco · Trans' },
  { name:'Botellas PET rellenas',    lam:'0.15',  masa:'Baja',      ais:'Alta',      mv:10,  av:75, col:'#6AB04C', zon:'OR · MIS' },
  { name:'Piedra basáltica (40 cm)', lam:'1.40',  masa:'Extrema',   ais:'Muy baja',  mv:100, av:5,  col:'#555',    zon:'Cimientos' },
  { name:'Policarbonato alveolar',   lam:'0.22',  masa:'Nula',      ais:'Media',     mv:0,   av:70, col:'#B5D4F4', zon:'Cubiertas' },
];

/* ── SVG HELPERS ── */
function sA(t,c,c2){return`<svg viewBox="0 0 80 80" width="56" height="56"><rect x="37" y="${t}" width="6" height="${80-t}" rx="2" fill="#8B6340" opacity=".85"/><ellipse cx="40" cy="${t}" rx="22" ry="18" fill="${c}" opacity=".9"/><ellipse cx="40" cy="${t-6}" rx="16" ry="12" fill="${c2||c}" opacity=".7"/></svg>`;}
function sB(c,f){return`<svg viewBox="0 0 80 80" width="56" height="56"><rect x="37" y="55" width="6" height="24" rx="2" fill="#8B6340" opacity=".8"/><ellipse cx="40" cy="50" rx="26" ry="20" fill="${c}" opacity=".85"/>${f?`<circle cx="40" cy="42" r="5" fill="${f}" opacity=".9"/>`:''}</svg>`;}
function sE(c,f){return`<svg viewBox="0 0 80 80" width="56" height="56"><rect x="38" y="15" width="4" height="64" rx="2" fill="#8B6340" opacity=".6"/><path d="M40,64 Q24,52 16,40 Q28,46 40,56Z" fill="${c}" opacity=".8"/><path d="M40,52 Q56,40 64,28 Q52,36 40,46Z" fill="${c}" opacity=".8"/><path d="M40,40 Q22,30 17,17 Q30,26 40,36Z" fill="${c}" opacity=".75"/>${f?`<circle cx="16" cy="38" r="4" fill="${f}" opacity=".9"/>`:''}</svg>`;}
function sH(c){return`<svg viewBox="0 0 80 80" width="56" height="56"><path d="M40,72 Q32,56 20,44 Q30,48 40,60Z" fill="${c}" opacity=".85"/><path d="M40,72 Q48,56 60,44 Q50,48 40,60Z" fill="${c}" opacity=".85"/><path d="M40,72 Q34,52 22,38 Q34,44 40,58Z" fill="${c}" opacity=".75"/><path d="M40,72 Q46,52 58,38 Q46,44 40,58Z" fill="${c}" opacity=".75"/></svg>`;}
function sC(c){return`<svg viewBox="0 0 80 80" width="56" height="56"><rect x="34" y="22" width="12" height="58" rx="6" fill="${c}" opacity=".9"/><rect x="19" y="40" width="22" height="8" rx="4" fill="${c}" opacity=".85"/><rect x="19" y="32" width="8" height="20" rx="4" fill="${c}" opacity=".85"/><rect x="39" y="48" width="22" height="8" rx="4" fill="${c}" opacity=".85"/><rect x="53" y="40" width="8" height="20" rx="4" fill="${c}" opacity=".85"/></svg>`;}
function sP(c){return`<svg viewBox="0 0 80 80" width="56" height="56"><rect x="37" y="32" width="6" height="48" rx="3" fill="#8B6340" opacity=".85"/><path d="M40,32 Q24,20 12,24 Q24,26 40,32Z" fill="${c}" opacity=".9"/><path d="M40,32 Q56,20 68,24 Q56,26 40,32Z" fill="${c}" opacity=".9"/><path d="M40,32 Q28,16 30,6 Q36,18 40,30Z" fill="${c}" opacity=".85"/><path d="M40,32 Q52,16 50,6 Q44,18 40,30Z" fill="${c}" opacity=".85"/></svg>`;}

const PLANTAS = [
  { nombre:'Lapacho rosado',    ci:'Handroanthus impetiginosus',  uso:'exterior', cat:'arbol',      il:()=>sA(28,'#E879A0','#C0578A'), bg:'#fdf0f5', desc:'Emblema paraguayo. Caducifolio: sombra en verano, sol en invierno. Floración espectacular en agosto-septiembre.', at:[{i:'📏',t:'8–12 m'},{i:'☀️',t:'Pleno sol'},{i:'🍂',t:'Caducifolio — ideal lat. 25°S'}], us:['Sombreado estival','Barrera visual'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Lapacho amarillo',  ci:'Handroanthus chrysotrichus',  uso:'exterior', cat:'arbol',      il:()=>sA(28,'#F5C842','#D4A820'), bg:'#fffbea', desc:'Variante amarilla. Caducifolio. Madera dura para estructuras y pisos exteriores.', at:[{i:'📏',t:'6–10 m'},{i:'☀️',t:'Pleno sol'},{i:'🍂',t:'Caducifolio'}], us:['Sombreado','Madera local'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Timbó',             ci:'Enterolobium contortisiliquum',uso:'exterior', cat:'arbol',     il:()=>sA(22,'#52A853','#3B8240'), bg:'#f0f9f0', desc:'Gran porte con copa horizontal extensa. Crecimiento rápido. Microclima en patios amplios.', at:[{i:'📏',t:'12–20 m'},{i:'☀️',t:'Pleno sol'},{i:'💧',t:'Moderada resistencia'}], us:['Sombra amplia','Microclima'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Palo borracho',     ci:'Ceiba speciosa',             uso:'exterior', cat:'arbol',      il:()=>sA(30,'#E8A0C8','#D070A0'), bg:'#fdf0f8', desc:'Flores rosas vistosas. Raíces poco invasivas. Apto para veredas urbanas y lotes pequeños.', at:[{i:'📏',t:'10–15 m'},{i:'☀️',t:'Pleno sol'},{i:'💧',t:'Alta tolerancia a sequía'}], us:['Sombreado urbano','Veredas'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Ñandubay',          ci:'Prosopis affinis',           uso:'exterior', cat:'arbol',      il:()=>sA(38,'#8BBF70','#6A9E52'), bg:'#f2f8ec', desc:'Xerófito extremo. Resistencia máxima a calor y sequía. Madera muy dura. Ideal para el Chaco.', at:[{i:'📏',t:'4–8 m'},{i:'☀️',t:'Xerófito'},{i:'💧',t:'Muy alta resistencia'}], us:['Sombra Chaco','Cortaviento'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Mbokaja',           ci:'Acrocomia aculeata',         uso:'exterior', cat:'palmera',    il:()=>sP('#52A048'),              bg:'#f0f8ec', desc:'Palmera nativa. Frutos comestibles. Sombreado vertical. Resistente a heladas leves.', at:[{i:'📏',t:'8–15 m'},{i:'☀️',t:'Pleno sol'},{i:'💧',t:'Resistente'}], us:['Sombreado vertical','Eje acceso'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Jazmín del Paraguay',ci:'Brunfelsia australis',      uso:'exterior', cat:'arbusto',    il:()=>sB('#5A8FC8','#D8A0E8'),    bg:'#eef4fc', desc:'Flores que cambian del violeta al blanco. Aromático. Para patios con sombra parcial.', at:[{i:'📏',t:'1.5–3 m'},{i:'☀️',t:'Sol parcial'},{i:'💧',t:'Riego regular'}], us:['Patios','Aromático'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Mburukuja',         ci:'Passiflora caerulea',        uso:'exterior', cat:'enredadera', il:()=>sE('#4A8C6A','#7EB87A'),    bg:'#edf6f2', desc:'Enredadera nativa rápida. Para pérgolas y celosías. Bloquea hasta 70% de la radiación solar.', at:[{i:'📏',t:'4–8 m²/año'},{i:'☀️',t:'Sol a semisombra'},{i:'💧',t:'Poco riego'}], us:['Pérgolas','Control solar'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Pitanga / Ñangapiry',ci:'Eugenia uniflora',          uso:'ambos',    cat:'arbusto',    il:()=>sB('#3E9E60','#E84040'),    bg:'#edf6f0', desc:'Versátil: seto exterior o maceta interior luminosa. Frutos comestibles. Hojas repelen insectos.', at:[{i:'📏',t:'Int: 1–2 m · Ext: 3–5 m'},{i:'☀️',t:'Luz intensa'},{i:'💧',t:'Moderado'}], us:['Seto exterior','Interior luminoso'], bdg:'ambos', bt:'Int. y Ext.' },
  { nombre:'Helecho de palo',   ci:'Blechnum brasiliense',       uso:'interior', cat:'helecho',    il:()=>sH('#3DAB60'),              bg:'#edf7f1', desc:'Helecho nativo de la selva misionera. Mejora la humedad relativa del aire interior activamente.', at:[{i:'📏',t:'60–120 cm'},{i:'☀️',t:'Luz indirecta'},{i:'💧',t:'Sustrato siempre húmedo'}], us:['Humidificador natural','Oficinas'], bdg:'interior', bt:'Interior' },
  { nombre:'Cactus cardón',     ci:'Cereus peruvianus',          uso:'interior', cat:'cactus',     il:()=>sC('#5A9E5A'),              bg:'#f0f8f0', desc:'Cactus columnar del Chaco. Mínimo riego. Requiere máxima luz disponible. Planta longeva.', at:[{i:'📏',t:'50 cm – 2 m'},{i:'☀️',t:'Máxima luz'},{i:'💧',t:'Cada 2–3 semanas'}], us:['Espacios luminosos','Bajo mantenimiento'], bdg:'interior', bt:'Interior' },
  { nombre:'Stevia / Kaa he',   ci:'Stevia rebaudiana',          uso:'ambos',    cat:'arbusto',    il:()=>sB('#70B858',null),         bg:'#f2f8ec', desc:'Hierba medicinal nativa del Amambay. Endulzante natural. Maceta interior luminosa o cantero exterior.', at:[{i:'📏',t:'50–90 cm'},{i:'☀️',t:'Mínimo 4h sol'},{i:'💧',t:'Moderado'}], us:['Cocinas','Huerto','Balcones'], bdg:'ambos', bt:'Int. y Ext.' },
  { nombre:'Cedro paraguay',    ci:'Cedrela fissilis',           uso:'exterior', cat:'arbol',      il:()=>sA(26,'#8BB860','#6A9840'), bg:'#f0f7ea', desc:'Árbol maderable nativo de gran porte. Copa densa para sombra estival. Madera preciosa resistente a termitas.', at:[{i:'📏',t:'15–25 m'},{i:'☀️',t:'Pleno sol'},{i:'💧',t:'Moderada'}], us:['Sombra amplia','Madera local'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Tataré',            ci:'Chloroleucon tenuiflorum',   uso:'exterior', cat:'arbol',      il:()=>sA(34,'#A0C070','#80A050'), bg:'#f2f8ec', desc:'Árbol chaqueño de copa redondeada. Resiste calor extremo y heladas. Madera muy dura, ideal para postes y estructuras.', at:[{i:'📏',t:'6–12 m'},{i:'☀️',t:'Xerófito'},{i:'💧',t:'Alta resistencia'}], us:['Sombra Chaco','Estructuras'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Guatambú',          ci:'Balfourodendron riedelianum',uso:'exterior', cat:'arbol',      il:()=>sA(28,'#C8D080','#A0B060'), bg:'#f8f9e8', desc:'Árbol de selva misionera. Copa densa y perennifolia. Ideal para cortinas de sombra permanente en el sur.', at:[{i:'📏',t:'10–20 m'},{i:'☀️',t:'Sol a semisombra'},{i:'💧',t:'Requiere humedad'}], us:['Sombra permanente','Sur Paraguay'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Yerba mate',        ci:'Ilex paraguariensis',        uso:'ambos',    cat:'arbol',      il:()=>sA(38,'#3A8040','#285530'), bg:'#e8f5e8', desc:'Árbol emblema paraguayo. Puede cultivarse en maceta grande o jardín. Requiere sombra parcial. Hojas para mate y tereré.', at:[{i:'📏',t:'Int: 1–2 m · Ext: 6–15 m'},{i:'☀️',t:'Semisombra'},{i:'💧',t:'Suelo húmedo'}], us:['Consumo local','Semisombra'], bdg:'ambos', bt:'Int. y Ext.' },
  { nombre:'Guembé',            ci:'Philodendron bipinnatifidum',uso:'interior', cat:'arbusto',    il:()=>sH('#2A9E60'),              bg:'#eaf5f0', desc:'Planta nativa de la selva paraguaya. Purifica el aire activamente. Hojas grandes para humidificación natural de ambientes.', at:[{i:'📏',t:'1–3 m'},{i:'☀️',t:'Luz indirecta brillante'},{i:'💧',t:'Riego frecuente en verano'}], us:['Purificación aire','Humidificación'], bdg:'interior', bt:'Interior' },
  { nombre:'Jacarandá',         ci:'Jacaranda mimosifolia',      uso:'exterior', cat:'arbol',      il:()=>sA(28,'#9080D8','#7060B8'), bg:'#f5f0fc', desc:'Caducifolio de floración morada espectacular en primavera. Permite sol invernal. Raíces moderadas, apto para veredas amplias.', at:[{i:'📏',t:'8–14 m'},{i:'☀️',t:'Pleno sol'},{i:'🍂',t:'Caducifolio'}], us:['Sombreado estival','Estética'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Bromelia',          ci:'Bromelia balansae',          uso:'exterior', cat:'arbusto',    il:()=>sB('#C84040','#E06020'),    bg:'#fdf0ec', desc:'Planta nativa del Chaco. Crece en grupos formando barreras naturales. Frutos comestibles. Muy resistente a calor y sequía.', at:[{i:'📏',t:'80–120 cm'},{i:'☀️',t:'Pleno sol'},{i:'💧',t:'Xerófita — riego mínimo'}], us:['Barrera natural','Chaco'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Teyucuá / Guabiroba',ci:'Campomanesia xanthocarpa',  uso:'ambos',    cat:'arbol',      il:()=>sA(36,'#70B850','#50983A'), bg:'#ecf7e8', desc:'Árbol frutale nativo de mediano porte. Frutos aromáticos comestibles. Copa semidensa ideal para sombra parcial en jardines.', at:[{i:'📏',t:'4–10 m'},{i:'☀️',t:'Sol a semisombra'},{i:'💧',t:'Moderada'}], us:['Frutal nativo','Sombra parcial'], bdg:'ambos', bt:'Int. y Ext.' },
  { nombre:'Pino Paraná',         ci:'Araucaria angustifolia',   uso:'exterior', cat:'arbol',      il:()=>sA(40,'#3D7A3A','#2A5A28'), bg:'#eaf5ea', desc:'Conífera nativa de la selva misionera. Porte majestuoso de 20–35 m. Madera de excelente calidad para estructura y carpintería.', at:[{i:'📏',t:'20–35 m'},{i:'☀️',t:'Pleno sol'},{i:'💧',t:'Suelos profundos'}], us:['Madera noble','Bosque nativo'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Mango',               ci:'Mangifera indica',         uso:'exterior', cat:'arbol',      il:()=>sA(30,'#5DB854','#3D9834'), bg:'#edf7ea', desc:'Árbol frutal ampliamente adaptado en Paraguay. Copa densa y redondeada ideal para sombra de patios. Frutos de verano.', at:[{i:'📏',t:'8–15 m'},{i:'☀️',t:'Pleno sol'},{i:'🍂',t:'Perennifolio'}], us:['Sombra densa','Frutal'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Ka\'a ovetĩ',         ci:'Heliconia rostrata',       uso:'exterior', cat:'arbusto',    il:()=>sB('#D83030','#E87030'),    bg:'#fdf0ec', desc:'Heliconia nativa de las selvas del este. Inflorescencia colgante roja y amarilla. Ideal para jardines húmedos de sombra parcial en la OR y Misiones.', at:[{i:'📏',t:'1–2 m'},{i:'☀️',t:'Semisombra'},{i:'💧',t:'Alta humedad'}], us:['Jardín húmedo','Ornamental'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Yvyra pytã / Ibirá pitá',ci:'Peltophorum dubium',    uso:'exterior', cat:'arbol',      il:()=>sA(26,'#E8C840','#C8A820'), bg:'#fffbea', desc:'Árbol emblemático de floración amarilla. Caducifolio de crecimiento rápido (1–1.5 m/año). Copa extensa para sombra estival.', at:[{i:'📏',t:'15–25 m'},{i:'☀️',t:'Pleno sol'},{i:'🍂',t:'Caducifolio'}], us:['Sombra rápida','Ornamental'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Seibo de sombra',     ci:'Erythrina falcata',         uso:'exterior', cat:'arbol',      il:()=>sA(30,'#E04040','#C03030'), bg:'#fdf0f0', desc:'Eritrina de crecimiento rápido. Copa amplia para sombra. Flores rojas en invierno. Tolerante a suelos pobres y compactados.', at:[{i:'📏',t:'12–20 m'},{i:'☀️',t:'Pleno sol'},{i:'💧',t:'Resistente sequía'}], us:['Sombra rápida','Suelos pobres'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Kurupika\'y / Guajayvi',ci:'Patagonula americana',   uso:'exterior', cat:'arbol',      il:()=>sA(34,'#80A860','#609040'), bg:'#f0f7ea', desc:'Árbol nativo de madera durísima. Copa redondeada e ideal para sombra. Resistente a termitas y hongos, apto para postes y tirantes.', at:[{i:'📏',t:'10–18 m'},{i:'☀️',t:'Pleno sol'},{i:'💧',t:'Moderada'}], us:['Madera dura','Sombra'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Victoria regia',      ci:'Victoria cruziana',        uso:'exterior', cat:'acuatica',   il:()=>sC('#6AB84A'),              bg:'#eaf7ee', desc:'Planta acuática nativa del Paraguay. Hojas flotantes de hasta 1.5 m de diámetro. Ideal para espejos de agua ornamentales en jardines.', at:[{i:'📏',t:'Hojas 1–1.5 m'},{i:'☀️',t:'Pleno sol'},{i:'💧',t:'Permanente en agua'}], us:['Espejos de agua','Ornamental'], bdg:'exterior', bt:'Exterior' },
  { nombre:'Albahaca silvestre',  ci:'Ocimum campechianum',      uso:'ambos',    cat:'hierba',     il:()=>sB('#70B850',null),         bg:'#f2f8ec', desc:'Hierba aromática nativa. Repelente natural de mosquitos. Maceta interior luminosa o cantero. Hojas para té e infusiones medicinales.', at:[{i:'📏',t:'40–80 cm'},{i:'☀️',t:'Luz intensa'},{i:'💧',t:'Moderado'}], us:['Repelente natural','Aromática'], bdg:'ambos', bt:'Int. y Ext.' },
];

/* ══════════════════════════════════════
   CIUDADES — Climate data by city
══════════════════════════════════════ */
const CITIES = {
  subtropical: [
    { name:'Asunción', temp:'28–38°C', hum:'70–85%', lluvia:'1400 mm', alt:'65 m', viento:'NE 3–5 m/s' },
    { name:'San Lorenzo', temp:'27–37°C', hum:'72–86%', lluvia:'1380 mm', alt:'125 m', viento:'NE 3 m/s' },
    { name:'Caacupé', temp:'25–35°C', hum:'68–82%', lluvia:'1450 mm', alt:'180 m', viento:'NE 2–4 m/s' },
  ],
  chaco: [
    { name:'Filadelfia', temp:'28–42°C', hum:'30–50%', lluvia:'800 mm', alt:'160 m', viento:'Variable 2–4 m/s' },
    { name:'Mariscal Estigarribia', temp:'28–44°C', hum:'28–48%', lluvia:'750 mm', alt:'180 m', viento:'N 3–5 m/s' },
    { name:'Pozo Colorado', temp:'27–40°C', hum:'35–55%', lluvia:'850 mm', alt:'120 m', viento:'NE 2–4 m/s' },
  ],
  misionero: [
    { name:'Encarnación', temp:'24–34°C', hum:'65–80%', lluvia:'1850 mm', alt:'85 m', viento:'S 3–5 m/s' },
    { name:'Hoenau', temp:'23–33°C', hum:'68–82%', lluvia:'1900 mm', alt:'120 m', viento:'S 2–4 m/s' },
    { name:'San Pedro del Paraná', temp:'24–34°C', hum:'65–80%', lluvia:'1800 mm', alt:'90 m', viento:'SE 3 m/s' },
  ],
  transicion: [
    { name:'San Estanislao', temp:'26–36°C', hum:'60–75%', lluvia:'1300 mm', alt:'140 m', viento:'Variable 2–4 m/s' },
    { name:'Coronel Oviedo', temp:'25–35°C', hum:'62–76%', lluvia:'1350 mm', alt:'150 m', viento:'NE 2–3 m/s' },
    { name:'Caaguazú', temp:'25–35°C', hum:'60–74%', lluvia:'1280 mm', alt:'200 m', viento:'Variable 2–3 m/s' },
  ],
};

/* ══════════════════════════════════════
   GLOSARIO
══════════════════════════════════════ */
const GLOSSARY = [
  { term:'Alero / Voladizo', def:'Proyección horizontal del techo que bloquea el sol de verano (ángulo alto) y permite el sol de invierno (ángulo bajo). La profundidad óptima depende de la latitud y la altura de la ventana.' },
  { term:'Albedo', def:'Porcentaje de radiación solar reflejada por una superficie. Un albedo alto (>0.65) reduce la absorción de calor en cubiertas y muros. Chapa blanca: ~0.70. Chapa oscura: ~0.15.' },
  { term:'Brise-Soleil', def:'Sistema de protección solar compuesto por lamas o aletas verticales u horizontales. Las verticales son más efectivas en fachadas E y O (sol bajo), las horizontales en fachada N (sol alto).' },
  { term:'Carga térmica', def:'Cantidad de energía calorífica que debe agregarse o extraerse de un espacio para mantener el confort. Se expresa en W/m² o BTU/h.' },
  { term:'Confort adaptativo', def:'Modelo que relaciona la temperatura interior aceptable con la temperatura exterior media. En climas cálidos, las personas toleran temperaturas más altas si hay ventilación natural.' },
  { term:'Conductividad térmica (λ)', def:'Capacidad de un material de conducir el calor. Se mide en W/mK. A menor λ, mejor aislante térmico.' },
  { term:'Efecto chimenea', def:'Movimiento natural del aire por diferencia de densidad: el aire caliente asciende y escapa por aberturas altas, mientras el aire fresco ingresa por aberturas bajas.' },
  { term:'Estrategia pasiva', def:'Técnica de acondicionamiento ambiental que no consume energía mecánica. Ej: orientación, masa térmica, ventilación cruzada, sombreado vegetal.' },
  { term:'Factor solar (g)', def:'Fracción de la radiación solar que atraviesa un vidrio. DVH bajo emisivo: g=0.3–0.4. Vidrio simple: g=0.85. A menor g, menor ganancia solar.' },
  { term:'Higroscópico', def:'Capacidad de un material de absorber y liberar humedad del aire, regulando pasivamente la humedad relativa interior. Ej: barro, madera, adobe.' },
  { term:'Inercia térmica', def:'Capacidad de un material de almacenar calor y retardar su transmisión. Depende de la masa, el calor específico y la conductividad.' },
  { term:'Masa térmica', def:'Material denso (ladrillo, hormigón, tierra) que absorbe calor durante el día y lo libera durante la noche. Reduce los picos de temperatura interior.' },
  { term:'Puente térmico', def:'Zona de la envolvente donde la resistencia térmica es significativamente menor que en el resto. Causa pérdidas de calor y condensación.' },
  { term:'Resistencia térmica (R)', def:'Medida de la oposición de un material al paso del calor. R = espesor / λ. m²K/W. A mayor R, mejor aislación.' },
  { term:'Retardo térmico', def:'Tiempo que tarda el calor en atravesar un muro. Con masa adecuada (25–30 cm), se logran retardos de 6–10 horas.' },
  { term:'Transmitancia térmica (U)', def:'Flujo de calor que pasa por un muro o ventana por cada grado de diferencia. U = 1 / R_total. W/m²K. A menor U, mejor aislación.' },
  { term:'Ventilación cruzada', def:'Flujo de aire por aberturas en lados opuestos. Funciona por diferencia de presión del viento. 60% barlovento, 40% sotavento.' },
  { term:'Zona de confort', def:'Rango de temperatura y humedad para confort sin climatización activa. Paraguay: 23–27°C y 40–70% HR con ventilación.' },
  { term:'Cámara de aire ventilada', def:'Espacio de aire (mín. 10–15 cm) entre cubierta y cielorraso con ventilación. Extrae calor acumulado antes de que llegue al interior.' },
  { term:'Enfriamiento evaporativo', def:'El agua al evaporarse absorbe calor del aire. Efectivo solo en climas secos (HR <50%). Enfría 5–8°C en el Chaco.' },
  { term:'Vegetación caducifolia', def:'Plantas que pierden hojas en invierno. Clave en lat. 25°S: sombra en verano, sol en invierno.' },
];

/* ══════════════════════════════════════
   PRINCIPIOS DE DISEÑO — Cheat Sheet
══════════════════════════════════════ */
const DESIGN_PRINCIPLES = [
  { icon:'🧭', title:'Orientación', desc:'Eje longitudinal del edificio en dirección O-E. Fachadas principales al N y S.', why:'En lat. 25°S, la fachada norte recibe sol controlable con aleros. E y O reciben sol bajo todo el año.' },
  { icon:'🪟', title:'Aberturas', desc:'Norte: 40–60% del área vidriada. Sur: 15–25%. Este: <15%. Oeste: <10% con protección obligatoria.', why:'Cada m² de vidrio al oeste sin proteger aporta 500–800 W de ganancia solar en hora pico.' },
  { icon:'🏠', title:'Cubierta', desc:'Albedo >0.65 + cámara de aire 15 cm + aislación (EPS o lana de roca 5 cm).', why:'La cubierta recibe 1.200–1.400 W/m² en enero. Sin protección transmite 250–400 W/m².' },
  { icon:'🧱', title:'Envolvente', desc:'Muros con masa: Chaco >25 cm ladrillo macizo, OR 20 cm hueco, MIS 20 cm + revoque hidrófugo.', why:'La masa retarda el pico de calor 6–10 h, desplazándolo a la noche.' },
  { icon:'🌬️', title:'Ventilación', desc:'Mínimo 0.5 m/s. Aberturas en 2 niveles (40 cm y 2.5 m) para efecto chimenea.', why:'Con 1 m/s la sensación térmica mejora 3–4°C. Elimina el A/A en 60–70% del año en la OR.' },
  { icon:'🌿', title:'Vegetación', desc:'Caducifolios al norte, enredaderas al oeste, perennes al sur para cortaviento.', why:'Un árbol adulto al norte reduce ganancia solar de la fachada hasta 80% en verano.' },
  { icon:'💧', title:'Agua', desc:'Cisterna de 5.000–10.000 L para recolección pluvial.', why:'Techo de 80 m² con 1.400 mm/año recolecta ~84.000 L. Suficiente para 4 personas 5–6 meses.' },
  { icon:'☀️', title:'Control solar', desc:'Alero de 60–80 cm al norte. Celosías verticales al E y O. Protección móvil o vegetal.', why:'Sol de verano (88°) vs invierno (41°): un alero bien diseñado deja pasar el que necesitamos.' },
];

/* ══════════════════════════════════════
   SISTEMAS CONSTRUCTIVOS
══════════════════════════════════════ */
const CONSTRUCTION_SYSTEMS = [
  { icon:'🧱', name:'Ladrillo cerámico hueco', tipo:'albañilería', desc:'El sistema más usado en Paraguay. Muros de 15–20 cm con ladrillos huecos de 6, 8 o 12 huecos. Revoque exterior e interior. Rápido, económico, mano de obra disponible.', pros:['Costo bajo','Mano de obra local','Rápido de ejecutar','Buena masa térmica'], cons:['Puentes térmicos en juntas','Requiere revoque','Aislación baja sin cámara'], region:'OR, Transición, Chaco', costo:'$', lambda:'0.41 W/mK', masa:'Alta' },
  { icon:'🏛️', name:'Adobe', tipo:'tierra', desc:'Bloques de barro y fibra vegetal secados al sol. Muros de 25–40 cm. Tradición constructiva paraguaya. Regula temperatura y humedad pasivamente. Sin cemento ni cocción.', pros:['Cero emisiones','Regula HR','Materia prima local','Alta inercia'], cons:['Requiere mantenimiento','Vulnerable a humedad','Lenta ejecución','No resiste sismos sin refuerzo'], region:'Chaco, Transición', costo:'$', lambda:'0.52 W/mK', masa:'Muy alta' },
  { icon:'🌍', name:'Tierra compactada (tapia)', tipo:'tierra', desc:'Muros monolíticos de tierra húmeda compactada en encofrados. Espesor 30–50 cm. Resistente, durable, alta masa térmica. Sin cocción ni aditivos. Acabado natural.', pros:['Masa térmica extrema','Durable siglos','Sin mantenimiento','Acabado estético'], cons:['Mano de obra especializada','Encofrado costoso','Lento','Pesado — requiere buena fundación'], region:'Chaco', costo:'$$', lambda:'0.65 W/mK', masa:'Extrema' },
  { icon:'🧊', name:'Bloque suelo-cemento (BTC)', tipo:'tierra', desc:'Bloques de tierra + 5–8% cemento comprimidos en prensa manual o hidráulica. Medida modular estable. Sin cocción. Resistencia similar al ladrillo hueco.', pros:['Ecológico','Resistente','Modular','Aprobado por norma'], cons:['Requiere prensa','Cemento necesario','Mayor costo que adobe','Mano de obra capacitada'], region:'OR, Transición', costo:'$$', lambda:'0.52 W/mK', masa:'Alta' },
  { icon:'🪵', name:'Madera nativa', tipo:'madera', desc:'Entramado de madera dura paraguaya (lapacho, cedro, kurupika\'y) con cerramiento de madera o panel. Tradicional en la región misionera. Excelente aislación natural.', pros:['Aislación natural','Ligero','Rápido','Renovable'], cons:['Mantenimiento periódico','Termitas en zonas húmedas','Disponibilidad variable','Costo medio-alto'], region:'Misionero, OR', costo:'$$$', lambda:'0.14 W/mK', masa:'Baja' },
  { icon:'🏗️', name:'Steel Frame', tipo:'industrial', desc:'Estructura de perfiles de acero galvanizado con paneles de OSB y aislación (lana de roca o EPS). Cerramiento con placas de yeso y revestimiento exterior. Creciente en Paraguay.', pros:['Rápido','Preciso','Aislación continua','No hay puentes térmicos'], cons:['Mano de obra especializada','Costo mayor','Baja masa térmica','Requiere diseño previo completo'], region:'OR, Asunción', costo:'$$$', lambda:'0.04 (aislante)', masa:'Muy baja' },
  { icon:'🎋', name:'Bambú', tipo:'natural', desc:'Estructura de bambú guadua tratado con cerramientos livianos. Tradicional en el norte y este de Paraguay. Crecimiento rápido (3–5 años). Sismorresistente.', pros:['Crecimiento rápido','Sismorresistente','Bajo costo','Biodegradable'], cons:['Durabilidad limitada sin tratamiento','Percepción de provisional','Disponible solo en zonas','Requiere mantenimiento'], region:'OR, Misionero', costo:'$', lambda:'0.17 W/mK', masa:'Baja' },
  { icon:'🔩', name:'Hormigón armado + bloque', tipo:'industrial', desc:'Estructura aporticada de H°A° con cerramiento de bloque de hormigón. El sistema dominante en construcción formal paraguaya. Alta resistencia y durabilidad.', pros:['Muy resistente','Durable','Conocido por todos','Disponible en todo PY'], cons:['Alta huella de carbono','Puentes térmicos','Lento','Caro en acabados'], region:'Todas', costo:'$$$', lambda:'1.63 W/mK', masa:'Muy alta' },
];

/* ══════════════════════════════════════
   FAQ — Preguntas Frecuentes
══════════════════════════════════════ */
const FAQ = [
  { q:'¿Qué es el diseño bioclimático?', a:'Es una arquitectura que aprovecha las condiciones del clima y el entorno para lograr confort térmico con mínimo consumo energético. No es un estilo, es una metodología de diseño basada en la orientación, la masa térmica, la ventilación natural y el control solar.' },
  { q:'¿Por qué orientar el eje largo del edificio O-E?', a:'Porque en latitud 25°S (Paraguay), las fachadas norte y sur reciben sol controlable: el norte recibe sol de invierno (necesario) y se protege con aleros en verano. Las fachadas este y oeste reciben sol bajo que penetra profundamente y es difícil de controlar.' },
  { q:'¿Qué diferencia hay entre masa térmica y aislación?', a:'La masa térmica (ladrillo, hormigón, tierra) almacena calor y lo libera horas después, retardando el pico térmico. La aislación (EPS, lana de roca) frena el paso del calor. En el Chaco se necesita mucha masa; en la OR, un equilibrio de masa + aislación.' },
  { q:'¿Sirve el enfriamiento evaporativo en todo Paraguay?', a:'No. Solo funciona donde la humedad relativa es baja (<50%), principalmente en el Chaco. En la OR y Misiones, con HR de 70–90%, el enfriamiento evaporativo no es efectivo y puede empeorar el confort.' },
  { q:'¿Cuánto alero necesito en una ventana norte?', a:'Depende de la altura de la ventana. Para una ventana de 2 m de alto con antepecho de 20 cm, necesitás ~60–80 cm de voladizo. Usá la calculadora de alero en Herramientas para el cálculo exacto según tus medidas.' },
  { q:'¿El techo verde es viable en Paraguay?', a:'Sí, especialmente en la zona misionera (lluvias abundantes) y la OR. El techo verde extensivo (sustrato 10 cm) reduce la temperatura superficial hasta 20°C, retiene 40–60% de la lluvia y alarga la vida de la membrana impermeable.' },
  { q:'¿Qué árbol plantar al norte de mi casa?', a:'Lapacho rosado o timbó. Ambos son caducifolios: pierden las hojas en invierno (dejando pasar el sol) y tienen copa densa en verano (dando sombra). También son nativos, de bajo mantenimiento y alto valor ornamental.' },
  { q:'¿Cuánta agua de lluvia puedo recolectar?', a:'Con un techo de 80 m² en la OR (1.400 mm/año), podés recolectar ~84.000 litros por año. Suficiente para cubrir las necesidades de 4 personas durante 5–6 meses. Usá la calculadora de captación en Herramientas.' },
  { q:'¿Vale la pena el DVH bajo emisivo en Paraguay?', a:'En la OR y Chaco, sí. La inversión se recupera en 5–7 años por la reducción de carga térmica. En la zona misionera, puede tardar 8–12 años. Priorizá DVH en ventanas al norte y oeste.' },
  { q:'¿Qué es el efecto chimenea y cómo se diseña?', a:'Es la ventilación natural por diferencia de temperatura: el aire caliente sube y escapa por aberturas altas (2.5–3 m), mientras el aire fresco entra por aberturas bajas (40 cm del piso). Diseñalo con aberturas en dos niveles en la misma pared o en paredes opuestas.' },
];
