# ARQREF — Referencia Arquitectónica para Profesionales

Herramienta de consulta para arquitectos y diseñadores. Estilos arquitectónicos, decoración de interiores, floorplans, paletas de materiales y workspace de proyecto.

**GitHub Pages · Sin backend · Sin dependencias · Sin tracking**

---

## 📁 Estructura del proyecto

```
arqref/
├── index.html                    ← Landing principal
├── workspace.html                ← Centro de trabajo (proyectos, notas, paletas)
├── comparador.html               ← Comparador side-by-side
├── glosario.html                 ← Glosario arquitectónico
├── css/
│   └── main.css                  ← Design system completo
├── js/
│   └── main.js                   ← Lógica global (storage, proyectos, notas)
├── estilos/
│   ├── index.html                ← Galería de estilos arquitectónicos
│   ├── brutalismo.html
│   ├── bauhaus.html
│   ├── modernismo.html
│   ├── art-deco.html
│   ├── gotico.html
│   ├── deconstructivismo.html
│   ├── neoclasico.html
│   ├── organicismo.html
│   └── biofilo-solarpunk.html    ← Eco / Solarpunk 🌱
├── interiores/
│   ├── index.html                ← Galería de estilos de interiores
│   ├── japandi.html
│   ├── solarpunk.html            ← 🌱 Eco
│   ├── dark-academia.html
│   ├── cottagecore.html
│   ├── industrial.html
│   ├── minimalismo.html
│   ├── maximalism.html
│   ├── mid-century.html
│   ├── wabi-sabi.html
│   ├── coastal-grandmother.html
│   ├── grandmillennial.html
│   ├── biophilic.html            ← 🌱 Eco
│   ├── brutalist-interior.html
│   ├── art-deco-interior.html
│   ├── mediterranean.html
│   ├── scandinavian.html
│   ├── bohemian.html
│   ├── french-country.html
│   ├── organic-modern.html
│   ├── earthy.html               ← 🌱 Eco / Natural
│   └── [más micro-estilos...]
└── floorplans/
    ├── index.html                ← Biblioteca de plantas
    ├── unifamiliar-pequena.html  ← < 80 m²
    ├── unifamiliar-media.html    ← 80–150 m²
    ├── unifamiliar-grande.html   ← > 150 m²
    ├── departamento.html
    ├── planta-libre.html
    └── espacio-comercial.html
```

---

## 🚀 Deploy en GitHub Pages

### Paso 1 — Crear el repositorio

1. Ir a [github.com/new](https://github.com/new)
2. Nombre: `arqref` (o el que quieras)
3. Público ✓
4. Sin README (ya tenemos este)
5. Crear repositorio

### Paso 2 — Subir los archivos

**Opción A — Drag & drop (más fácil):**
1. En el repositorio vacío, cliqueá "uploading an existing file"
2. Arrastrá toda la carpeta `arqref/`
3. Commit: "Initial commit"

**Opción B — Git CLI:**
```bash
git init
git add .
git commit -m "Initial commit — ARQREF v2"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/arqref.git
git push -u origin main
```

### Paso 3 — Activar GitHub Pages

1. Settings del repositorio → **Pages** (menú lateral)
2. Source: **Deploy from a branch**
3. Branch: **main** / **/ (root)**
4. Save

Tu sitio va a estar disponible en:
```
https://TU-USUARIO.github.io/arqref/
```

⚠️ El deploy puede tardar 1–3 minutos la primera vez.

### Paso 4 — Actualizar el canonical URL

En `index.html`, reemplazá:
```html
<link rel="canonical" href="https://TU-USUARIO.github.io/arqref/"/>
```

Y en cada ficha de estilo, actualizá el Schema.org:
```json
"item": "https://TU-USUARIO.github.io/arqref"
```

---

## ✏️ Cómo agregar un nuevo estilo

1. Copiá `estilos/brutalismo.html` como base
2. Renombralo: `estilos/NOMBRE-ESTILO.html`
3. Reemplazá todo el contenido con los datos del nuevo estilo
4. Agregá la card en `estilos/index.html` y en `index.html`
5. Subí el archivo a GitHub

---

## 🌱 Estilos eco incluidos

Estos estilos tienen el badge especial `🌱 Eco`:

| Estilo | Sección | Énfasis |
|--------|---------|---------|
| Biofílico / Solarpunk | Arquitectura | Solar, verde vivo, biofilia |
| Solarpunk Interior | Interiores | Materiales reciclados, plantas, solar |
| Biophilic Design | Interiores | Naturaleza adentro, aire, luz |
| Earthy / Natural | Interiores | Arcilla, madera cruda, texturas naturales |
| Orgánico moderno | Interiores | Formas naturales, materiales sostenibles |

### Materiales eco recomendados en las fichas:
- Bambú, corcho, madera certificada FSC
- Adobe, tierra apisonada, hempcrete
- Vidrio reciclado, metal recuperado
- Pinturas naturales (cal, tierra, pigmentos naturales)
- Aislación de lana, celulosa reciclada

---

## 📐 Floorplans — Fuentes de dominio público

Los planos incluidos en `/floorplans/` provienen de:

| Fuente | URL | Licencia |
|--------|-----|---------|
| Wikimedia Commons | commons.wikimedia.org | CC0 / PD |
| Archive.org | archive.org | PD |
| OpenBuildings | openbuildings.com | Varios |
| FlatIcon / Freepik floors | Embebidos como SVG | Ver términos |

Para encontrar más plantas:
- Buscar en Wikimedia: `floor plan architecture CC0`
- Archive.org → buscar por arquitecto + "floor plan"
- Para plantas SVG editables: `openhouseplans.com` (gratuitos)

---

## 🛠️ Tecnologías

- **HTML5 + CSS3 + Vanilla JS** — Sin frameworks, sin build tools
- **Google Fonts** — IBM Plex Sans / Mono + Cormorant Garamond
- **localStorage** — Todos los datos del usuario (proyectos, notas, paletas)
- **Unsplash** — Imágenes de arquitectura (CC0, free to use)
- **Wikimedia Commons** — Imágenes históricas y floorplans (CC0/PD)

---

## 📄 Licencia

- **Código**: MIT
- **Contenido editorial**: CC BY-SA 4.0
- **Imágenes**: Ver créditos en cada ficha (Unsplash CC0 / Wikimedia PD)

---

## 🔮 Roadmap

- [ ] Comparador de 3+ estilos simultáneos
- [ ] Quiz "¿Qué estilo sos?"
- [ ] Export a PDF de ficha completa (usando `window.print()`)
- [ ] Import/export de workspace en JSON
- [ ] Modo offline (Service Worker / PWA)
- [ ] Versión en inglés
