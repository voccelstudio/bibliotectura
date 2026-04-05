/**
 * ARQREF Premium - Core Logic
 */

let state = {
    estilos: [],
    interiores: [],
    materiales: [],
    floorplans: [],
    paisajismo: [],
    glosario: [],
    currentView: 'home'
};

const dom = {
    view: id => document.getElementById(`v-${id}`),
    allViews: () => document.querySelectorAll('.view'),
    navLinks: () => document.querySelectorAll('.nav-link')
};

// --- Initialization ---

async function init() {
    try {
        const [estData, intData, matData, pfData, gloData] = await Promise.all([
            fetch('data/estilos.json').then(r => r.json()),
            fetch('data/interiores.json').then(r => r.json()),
            fetch('data/materiales.json').then(r => r.json()),
            fetch('data/paisajismo-floorplans.json').then(r => r.json()),
            fetch('data/glosario.json').then(r => r.json())
        ]);
        
        state.estilos = estData;
        state.interiores = intData;
        state.materiales = matData;
        state.floorplans = pfData.floorplans || [];
        state.paisajismo = pfData.paisajismo || [];
        state.glosario = gloData;

        populateHomeStats();
        renderCards(state.estilos.slice(0, 4), 'hEGrid', 'estilos');
        renderCards(state.interiores.slice(0, 4), 'hIGrid', 'interiores');

        // Setup routing
        window.addEventListener('hashchange', handleRoute);
        handleRoute(); // initial route
    } catch(e) {
        console.error("Error loading data:", e);
        alert("Failed to load JSON data. Ensure you are running through a local server.");
    }
}

// --- Routing ---

function handleRoute() {
    let hash = window.location.hash.replace('#', '') || 'home';
    let [route, id] = hash.split('/');
    
    // Default to home if route not found
    if(!document.getElementById(`v-${route}`)) route = 'home';
    
    // Hide all, show targeted
    dom.allViews().forEach(v => v.classList.remove('active'));
    dom.view(route).classList.add('active');
    
    // Update Nav
    dom.navLinks().forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${route}`);
    });
    
    // Route logic
    if(route === 'estilos') renderCards(state.estilos, 'eGrid', 'estilos');
    if(route === 'interiores') renderCards(state.interiores, 'iGrid', 'interiores');
    if(route === 'materiales') renderCards(state.materiales, 'mGrid', 'materiales');
    if(route === 'ficha') openFicha(id);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navTo(route) {
    window.location.hash = route;
}

// --- Rendering functions ---

function populateHomeStats() {
    const sE = document.getElementById('stat-estilos');
    const sI = document.getElementById('stat-interiores');
    const sM = document.getElementById('stat-materiales');
    if(sE) sE.innerText = state.estilos.length + ' Estilos';
    if(sI) sI.innerText = state.interiores.length + ' Interiores';
    if(sM) sM.innerText = state.materiales.length + ' Materiales';
}

function renderCards(data, containerId, routeType) {
    const c = document.getElementById(containerId);
    if(!c) return;
    
    c.innerHTML = data.map(item => `
        <div class="ref-card" onclick="navTo('ficha/${routeType}_${item.id}')">
            <div class="ref-img-wrap">
                <img class="ref-img" src="${item.imagen || ''}" alt="${item.nombre}">
                ${item.era ? `<div class="ref-badge">${item.era}</div>` : ''}
            </div>
            <div class="ref-body">
                <h3 class="ref-title">${item.nombre}</h3>
                <p class="ref-desc">${String(item.descripcion).substring(0, 100)}...</p>
                <div class="ref-tags">
                    ${(item.tags || []).slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function openFicha(combinedId) {
    const vFicha = document.getElementById('v-ficha');
    if(!vFicha) return;
    
    if(!combinedId) { navTo('home'); return; }
    const [type, id] = combinedId.split('_');
    
    let item;
    let label = "";
    if(type === 'estilos') { item = state.estilos.find(x => x.id === id); label = "Arquitectura"; }
    else if(type === 'interiores') { item = state.interiores.find(x => x.id === id); label = "Interiores"; }
    else if(type === 'materiales') { item = state.materiales.find(x => x.id === id); label = "Material"; }
    
    if(!item) {
        vFicha.innerHTML = `<div class="container"><h2>Item Not Found</h2><button class="btn btn-primary" onclick="navTo('home')">Go Home</button></div>`;
        return;
    }
    
    // Render Ficha HTML
    vFicha.innerHTML = `
        <div class="ficha-header" data-letter="${item.nombre.substring(0,2).toUpperCase()}">
            <div class="container">
                <div class="breadcrumb">
                    <a href="#home">Home</a> <span>/</span> 
                    <a href="#${type}">${label}</a> <span>/</span> 
                    <span>${item.nombre}</span>
                </div>
                <div class="hero-tag">${label} &bull; ${item.era || 'Contemporáneo'}</div>
                <h1 class="hero-title"><strong>${item.nombre}</strong></h1>
                <p class="hero-subtitle">${item.concepto_clave || ''}</p>
            </div>
        </div>
        
        <div class="container ficha-layout">
            <div class="ficha-main">
                <div class="gallery-grid">
                    <div class="g-item"><img src="${item.imagen || ''}" alt="${item.nombre}"></div>
                    <div class="g-item"><img src="${item.imagen_2 || item.imagen || ''}" alt="Detalle 1"></div>
                    <div class="g-item"><img src="${item.imagen_3 || item.imagen || ''}" alt="Detalle 2"></div>
                </div>
                
                <h2 class="section-title">Descripción Detallada</h2>
                <p style="font-size:1.1rem; line-height: 1.8; color: var(--text-secondary); margin-bottom: 20px;">
                    ${item.descripcion}
                </p>
                
                ${item.quote ? `
                <div class="quote-box">
                    <p>"${item.quote}"</p>
                    <cite>— ${item.quote_autor || 'Autor desconocido'}</cite>
                </div>
                ` : ''}
            </div>
            
            <div class="ficha-sidebar">
                <div class="info-block">
                    <div class="ib-header">Overview</div>
                    <div class="ib-body">
                        <div class="kv-pair"><span class="kv-key">Costo const.</span><span class="kv-val">${item.costo_constructivo || '-'}</span></div>
                        <div class="kv-pair"><span class="kv-key">Mantenimiento</span><span class="kv-val">${item.mantenimiento || '-'}</span></div>
                        <div class="kv-pair"><span class="kv-key">Eco</span><span class="kv-val" style="color:var(--accent-primary)">${item.eco ? 'Sí 🌱' : 'No'}</span></div>
                    </div>
                </div>
                
                ${item.materiales ? `
                <div class="info-block">
                    <div class="ib-header">Paleta de Materiales</div>
                    <div class="ib-body">
                        ${[...(item.materiales.arquitectura || []), ...(item.materiales.interior || [])].map(m => `
                            <div class="m-color">
                                <div class="m-swatch" style="background-color: ${m.hex}"></div>
                                <div class="m-details">
                                    <span class="m-name">${m.nombre}</span>
                                    <span class="m-hex">${m.hex}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${item.caracteristicas ? `
                <div class="info-block">
                    <div class="ib-header">Características (Tags)</div>
                    <div class="ib-body" style="display:flex; flex-wrap:wrap; gap:8px;">
                        ${item.caracteristicas.map(c => `<span class="tag" style="border-color:var(--accent-primary); color:var(--accent-primary);">${c}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// App start
document.addEventListener("DOMContentLoaded", init);
