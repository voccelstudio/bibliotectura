/* ══════════════════════════════════════
   APP.JS — Bioclimática Paraguay
══════════════════════════════════════ */

/* ── ESTADO ── */
let selZ = 0, sfil = 'todos', mfil = 'todos', ufil = 'todos', pcfil = 'todos';
const fd = { lat:null, lng:null, zona:'', frente:'', tipo:'', entorno:'' };
let MAP = null, MARKER = null;

/* ── MAPA ── */
function initMap() {
  if (MAP) return;
  const el = document.getElementById('map');
  if (!el) return;
  try {
    MAP = L.map('map', { zoomControl:true, scrollWheelZoom:false }).setView([-23.4, -58.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18, minZoom: 5
    }).addTo(MAP);
    MAP.on('click', function(e) {
      const la = e.latlng.lat, lo = e.latlng.lng;
      fd.lat = la; fd.lng = lo;
      if (MARKER) MAP.removeLayer(MARKER);
      MARKER = L.marker([la, lo]).addTo(MAP);
      const zid = detZona(la, lo);
      document.getElementById('sel-zona').value = zid;
      fd.zona = zid;
      const zname = ZONES.find(x => x.id === zid).name;
      document.getElementById('minfo').textContent =
        'Lat ' + la.toFixed(3) + '° · Lon ' + lo.toFixed(3) + '°  →  ' + zname;
    });
  } catch(e) {
    document.getElementById('minfo').textContent =
      'No se pudo cargar el mapa. Seleccioná la zona manualmente.';
  }
}

function detZona(la, lo) {
  if (lo < -58.1)  return 'chaco';
  if (la < -26.2)  return 'misionero';
  if (la > -21.8 || (lo > -56.5 && la > -23)) return 'transicion';
  return 'subtropical';
}

/* ── CHIPS ── */
function selChip(campo, val, el) {
  document.querySelectorAll('#ch-' + campo + ' .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  fd[campo] = val;
}

/* ══════════════════════════════════════
   GENERAR RECOMENDACIONES
══════════════════════════════════════ */
function generar() {
  const zona = fd.zona || document.getElementById('sel-zona').value;
  if (!zona) { alert('Por favor seleccioná una zona climática.'); return; }
  fd.zona = zona;
  const frente  = fd.frente  || 'N';
  const tipo    = fd.tipo    || 'vivienda';
  const entorno = fd.entorno || 'suburbano';
  const Z = ZONES.find(z => z.id === zona);
  if (!Z) { alert('Zona no encontrada.'); return; }

  const r = document.getElementById('resultado');
  if (!r) return;
  r.innerHTML = '';

  /* ── DIAGRAMA ── */
  const dDiv = document.createElement('div');
  dDiv.className = 'rsec';
  dDiv.innerHTML = `
    <div class="rsec-hdr">🏗️ &nbsp; Diagrama del lote — frente al ${frente} · ${Z.name}</div>
    <div class="diagram-wrap">
      <canvas id="lote-cvs" width="900" height="560"></canvas>
    </div>`;
  r.appendChild(dDiv);
  setTimeout(() => drawLote('lote-cvs', frente, Z, tipo), 60);

  /* ── SECCIONES ── */
  buildRecs(Z, frente, tipo, entorno).forEach(sec => {
    const d = document.createElement('div');
    d.className = 'rsec';
    d.innerHTML = `
      <div class="rsec-hdr">${sec.icon} &nbsp; ${sec.titulo}</div>
      <div class="rsec-body">
        ${sec.items.map(it => `
          <div class="ritem${it.cls?' '+it.cls:''}">
            <span class="ritem-ico">${it.icon}</span>
            <div>
              <h5>${it.titulo}</h5>
              <p>${it.desc}</p>
              <div class="why">💡 ${it.why}</div>
            </div>
          </div>`).join('')}
        ${sec.plantas ? `<div class="precs">${sec.plantas.map(p => `
          <div class="prec">
            <h5>${p.nombre}</h5>
            <div class="sci">${p.sci}</div>
            <div class="pwhy">${p.why}</div>
            <span class="pbadge ${p.cls}">${p.pos}</span>
          </div>`).join('')}</div>` : ''}
      </div>`;
    r.appendChild(d);
  });
}

/* ════════════════════════════════════════════
   DIAGRAMA AXONOMÉTRICO — Lote, volumen edilicio,
   vientos dominantes y trayectoria solar
════════════════════════════════════════════ */
function drawLote(id, frente, Z, tipo) {
  const cvs = document.getElementById(id);
  if (!cvs) return;
  const W = 900, H = 560;
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  
  // Clean architectural background with a very soft grid
  ctx.fillStyle = '#fbfbfa'; ctx.fillRect(0, 0, W, H);

  const A = Math.PI / 6, S = 10.5;
  const cx = W / 2 + 45, cy = 130; // Centered vertically and horizontally for the isometric lot
  function ix(x, y)   { return cx + (x - y) * Math.cos(A) * S; }
  function iy(x, y, z){ return cy + (x + y) * Math.sin(A) * S - z * S; }
  function ip(x, y, z){ return { x: ix(x, y), y: iy(x, y, z) }; }

  const lotW = 20, lotD = 30;

  function poly(pts, fill, stroke, lw, dash = []) {
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw || 1;
      if (dash.length) ctx.setLineDash(dash);
      ctx.stroke();
    }
    ctx.restore();
  }

  const edgeIdx = { N:0, NE:0, E:1, SE:1, S:2, SO:2, O:3, NO:3 }[frente] || 0;
  const lotEdge = [
    { x1:0, y1:0,   x2:lotW, y2:0,    lo:{x:0, y:-2.5} },
    { x1:lotW, y1:0, x2:lotW, y2:lotD, lo:{x:2.5, y:0} },
    { x1:lotW, y1:lotD, x2:0, y2:lotD, lo:{x:0, y:2.5} },
    { x1:0, y1:lotD, x2:0, y2:0,       lo:{x:-2.5, y:0} },
  ];
  const edge = lotEdge[edgeIdx];
  const stP = [ip(edge.x1, edge.y1, 0), ip(edge.x2, edge.y2, 0)];

  /* ── RETÍCULA PERSPECTIVA (Faded & elegant) ── */
  ctx.save();
  ctx.strokeStyle = 'rgba(44, 62, 80, 0.04)';
  ctx.lineWidth = 0.5;
  for (let i = -40; i < 70; i += 4) {
    const a = ip(i, -10, 0), b = ip(i, lotD + 10, 0);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    const c = ip(-10, i, 0), d = ip(lotW + 10, i, 0);
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
  }
  ctx.restore();

  const bx = 3, by = 4, bw = 14, bh = 20, bz = 3.2;

  /* ── SHADOWS (Realistic transparent grey-blue) ── */
  // Shadow of building footprint shifted opposite to sun direction
  const sh = { x: 3.5, y: 1.8 }; // Sun from rear-right casts shadow to front-left
  const shC = [
    ip(bx + sh.x, by + sh.y, 0), ip(bx + bw + sh.x, by + sh.y, 0),
    ip(bx + bw + sh.x, by + bh + sh.y, 0), ip(bx + sh.x, by + bh + sh.y, 0),
  ];
  poly(shC, 'rgba(28, 38, 48, 0.08)');

  /* ── LOTE (Clean green-grey ground) ── */
  const lP = [ip(0, 0, 0), ip(lotW, 0, 0), ip(lotW, lotD, 0), ip(0, lotD, 0)];
  poly(lP, '#f1f2eb', '#2c3e50', 1.2);

  /* ── CALLE (Modern asphalt color) ── */
  ctx.save();
  ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(stP[0].x, stP[0].y); ctx.lineTo(stP[1].x, stP[1].y); ctx.stroke();
  const lp = ip((edge.x1 + edge.x2) / 2 + edge.lo.x, (edge.y1 + edge.y2) / 2 + edge.lo.y, 0);
  ctx.font = 'italic 600 10px "JetBrains Mono",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText('CALLE').width + 16;
  const rx = lp.x - tw / 2, ry = lp.y - 8;
  ctx.fillStyle = 'rgba(251,251,250,.92)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(rx, ry, tw, 16, 8); else ctx.rect(rx, ry, tw, 16);
  ctx.fill();
  ctx.fillStyle = '#7f8c8d'; ctx.fillText('CALLE', lp.x, lp.y);
  ctx.restore();

  /* ── ROOMS UNDERLAY (Beautiful subtle color zones) ── */
  const roomZones = [
    { name: 'ESTAR', x1: bx, y1: by, x2: bx + bw * 0.48, y2: by + bh * 0.55, col: 'rgba(239, 159, 39, 0.07)' },
    { name: 'DORM.', x1: bx, y1: by + bh * 0.55, x2: bx + bw * 0.48, y2: by + bh, col: 'rgba(59, 139, 212, 0.07)' },
    { name: 'COCINA', x1: bx + bw * 0.48, y1: by, x2: bx + bw, y2: by + bh * 0.55, col: 'rgba(216, 90, 48, 0.06)' },
    { name: 'GALERÍA', x1: bx + bw * 0.48, y1: by + bh * 0.55, x2: bx + bw, y2: by + bh, col: 'rgba(76, 175, 80, 0.08)' }
  ];
  roomZones.forEach(z => {
    const pts = [ip(z.x1, z.y1, 0), ip(z.x2, z.y1, 0), ip(z.x2, z.y2, 0), ip(z.x1, z.y2, 0)];
    poly(pts, z.col);
  });

  /* ── VOLUMEN EDIFICIO (Semi-transparent architectural model) ── */
  const e = [ip(bx, by, 0), ip(bx + bw, by, 0), ip(bx + bw, by + bh, 0), ip(bx, by + bh, 0)];
  const eT = [ip(bx, by, bz), ip(bx + bw, by, bz), ip(bx + bw, by + bh, bz), ip(bx, by + bh, bz)];

  // Draw exterior walls (back faces first, then front faces)
  // Left wall (West/South-West)
  poly([e[0], e[1], eT[1], eT[0]], 'rgba(247, 245, 240, 0.85)', '#2c3e50', 1.2);
  // Right wall (South/South-East)
  poly([e[1], e[2], eT[2], eT[1]], 'rgba(242, 240, 234, 0.85)', '#2c3e50', 1.2);
  // Roof top (semi-transparent glasshouse look)
  poly([eT[0], eT[1], eT[2], eT[3]], 'rgba(230, 232, 235, 0.5)', '#2c3e50', 0.8);

  /* ── CABALLETE (Ridge line) ── */
  const ry_ = by + bh * 0.5;
  const rL = ip(bx, ry_, bz + 0.4), rR = ip(bx + bw, ry_, bz + 0.4);
  const rM = ip(bx + bw * 0.5, ry_, bz + 0.8);
  ctx.strokeStyle = 'rgba(44, 62, 80, 0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(rL.x, rL.y); ctx.lineTo(rR.x, rR.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rL.x, rL.y); ctx.lineTo(rM.x, rM.y); ctx.lineTo(rR.x, rR.y); ctx.stroke();
  ctx.fillStyle = 'rgba(44, 62, 80, 0.6)'; ctx.font = '600 7px "JetBrains Mono",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('caballete', rM.x, rM.y - 7);

  /* ── DIVISIONES INTERIORES (Partition walls inside the model) ── */
  ctx.strokeStyle = 'rgba(44, 62, 80, 0.25)'; ctx.lineWidth = 0.8; ctx.setLineDash([3, 3]);
  const dx = bx + bw * 0.48;
  const d1 = ip(dx, by, bz), d2 = ip(dx, by + bh, bz);
  ctx.beginPath(); ctx.moveTo(d1.x, d1.y); ctx.lineTo(d2.x, d2.y); ctx.stroke();
  const dY = by + bh * 0.55;
  const d3 = ip(bx, dY, bz), d4 = ip(dx, dY, bz);
  ctx.beginPath(); ctx.moveTo(d3.x, d3.y); ctx.lineTo(d4.x, d4.y); ctx.stroke();
  ctx.setLineDash([]);

  /* ── AMBIENTES LABELS ── */
  ctx.fillStyle = '#2c3e50'; ctx.font = '700 9px "JetBrains Mono",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const labs = [
    ['ESTAR',   bx + bw * 0.22, by + bh * 0.22],
    ['DORM.',   bx + bw * 0.22, by + bh * 0.78],
    ['COCINA',  bx + bw * 0.78, by + bh * 0.22],
    ['GALERÍA', bx + bw * 0.78, by + bh * 0.78],
  ];
  labs.forEach(([t, x_, y_]) => {
    const p = ip(x_, y_, bz + 0.3); 
    // Small background label container
    ctx.save();
    ctx.font = '700 9px "JetBrains Mono",sans-serif';
    const lw = ctx.measureText(t).width + 8;
    ctx.fillStyle = 'rgba(251,251,250,0.85)';
    ctx.fillRect(p.x - lw/2, p.y - 7, lw, 14);
    ctx.fillStyle = '#2c3e50';
    ctx.fillText(t, p.x, p.y);
    ctx.restore();
  });

  /* ── VENTANAS (Detailed frames & glass reflection) ── */
  function drawDetailedWindow(p1, p2, p3, p4, glassCol, borderCol) {
    // Glass base
    poly([p1, p2, p3, p4], glassCol, borderCol, 1);
    // Frame details
    ctx.save();
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 1.2;
    // Outer border
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    // Glass reflection diagonal lines
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 0.8;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    ctx.beginPath();
    ctx.moveTo(p1.x + (p2.x-p1.x)*0.3, p1.y + (p2.y-p1.y)*0.3 + 2);
    ctx.lineTo(p4.x + (p3.x-p4.x)*0.5, p4.y + (p3.y-p4.y)*0.5 - 2);
    ctx.stroke();
    ctx.restore();
  }

  const ww = 1.8, wh = 0.5;
  // North Windows
  [0.18, 0.45, 0.72].forEach(px => {
    const xo = bx + bw * px, yo = by;
    const a = ip(xo, yo, 0), b = ip(xo + ww, yo, 0);
    const c = ip(xo + ww, yo, wh), d = ip(xo, yo, wh);
    drawDetailedWindow(a, b, c, d, 'rgba(59, 139, 212, 0.25)', '#3a7abf');
    const lb = ip(xo + ww / 2, yo, wh + 0.4);
    ctx.fillStyle = '#3a7abf'; ctx.font = 'bold 7px "JetBrains Mono",sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('V.N.', lb.x, lb.y);
  });
  // East/South Windows
  [0.25, 0.65].forEach(py => {
    const xo = bx + bw, yo = by + bh * py;
    const a = ip(xo, yo, 0), b = ip(xo, yo + ww, 0);
    const c = ip(xo, yo + ww, wh), d = ip(xo, yo, wh);
    drawDetailedWindow(a, b, c, d, 'rgba(76, 175, 80, 0.25)', '#3a8a3a');
  });

  /* ── ALERO ── */
  ctx.strokeStyle = 'rgba(44, 62, 80, 0.35)'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 3]);
  const ea = ip(bx - 0.6, by - 0.6, bz), eb = ip(bx + bw + 0.6, by - 0.6, bz);
  ctx.beginPath(); ctx.moveTo(ea.x, ea.y); ctx.lineTo(eb.x, eb.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(44, 62, 80, 0.6)'; ctx.font = '600 7px "JetBrains Mono",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('alero', (ea.x + eb.x) / 2, ea.y - 7);

  /* ── PERGOLA ── */
  const pp = { x: bx + bw + 1.8, y: by + bh * 0.50, w: 4.5, h: 3.0 };
  const ppC = [ip(pp.x, pp.y, 0), ip(pp.x + pp.w, pp.y, 0),
    ip(pp.x + pp.w, pp.y + pp.h, 0), ip(pp.x, pp.y + pp.h, 0)];
  ctx.strokeStyle = 'rgba(44, 62, 80, 0.25)'; ctx.lineWidth = 0.8; ctx.setLineDash([3, 4]);
  poly(ppC, null, 'rgba(44, 62, 80, 0.3)'); ctx.setLineDash([]);
  
  // Pergola columns & rafters
  for (let i = 0; i < 4; i++) {
    const cPos = ip(pp.x + (i + 0.5) * pp.w / 4, pp.y + pp.h * 0.5, 2.4);
    ctx.fillStyle = 'rgba(44, 62, 80, 0.2)'; ctx.beginPath(); ctx.arc(cPos.x, cPos.y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  const ppM = ip(pp.x + pp.w / 2, pp.y + pp.h + 0.8, 0);
  ctx.fillStyle = 'rgba(44, 62, 80, 0.6)'; ctx.font = 'bold 8px "JetBrains Mono",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PÉRGOLA', ppM.x, ppM.y);

  /* ── ÁRBOLES NATIVOS (Architectural tree representation) ── */
  function arbolIso(ctx, x, y, r, col, lbl) {
    const base = ip(x, y, 0), copa = ip(x, y, r * 0.85);
    // Tree Shadow (ground ellipse)
    ctx.fillStyle = 'rgba(44, 62, 80, 0.06)';
    ctx.beginPath(); ctx.ellipse(base.x + 4, base.y + 3, r * 0.85, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    
    // Trunk
    ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(copa.x, copa.y); ctx.stroke();
    
    // Foliage layers for volumetric look
    const layers = [
      { dx: 0, dy: 0, r: r, alpha: 0.8 },
      { dx: -r*0.15, dy: -r*0.15, r: r*0.8, alpha: 0.25 },
      { dx: r*0.1, dy: -r*0.1, r: r*0.7, alpha: 0.2 }
    ];
    layers.forEach((l, idx) => {
      const cx_ = copa.x + l.dx;
      const cy_ = copa.y + l.dy;
      const grd = ctx.createRadialGradient(cx_ - l.r * 0.2, cy_ - l.r * 0.2, 1, cx_, cy_, l.r);
      grd.addColorStop(0, idx === 0 ? col : '#ffffff');
      grd.addColorStop(0.7, col);
      grd.addColorStop(1, 'rgba(44, 62, 80, 0.15)');
      
      ctx.save();
      ctx.globalAlpha = l.alpha;
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx_, cy_, l.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // Thin elegant outline
    ctx.strokeStyle = 'rgba(44, 62, 80, 0.35)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(copa.x, copa.y, r, 0, Math.PI * 2); ctx.stroke();
    
    if (lbl) {
      ctx.fillStyle = '#2c3e50'; ctx.font = 'italic bold 7px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(lbl, copa.x, copa.y + r + 5);
    }
  }

  const isCh = Z.id === 'chaco';
  const c1 = isCh ? '#a3cb71' : '#6ab04c', c2 = isCh ? '#8cb860' : '#4bae4f';
  const n1 = isCh ? 'Ñandubay' : 'Lapacho', n2 = isCh ? 'Ñandubay' : 'Timbó';
  const r0 = S * 0.95;
  [
    [bx + bw * 0.12, by - 1.8, r0,      c1, n1],
    [bx + bw * 0.48, by - 2.6, r0 * 1.25, c2, n2],
    [bx + bw * 0.85, by - 1.8, r0 * 0.95, c1, ''],
    [bx - 2.8,       by + bh * 0.30, r0 * 0.75, '#78c281', 'Arbusto'],
    [bx - 2.8,       by + bh * 0.65, r0 * 0.65, '#78c281', ''],
  ].forEach(a => arbolIso(ctx, a[0], a[1], a[2], a[3], a[4]));

  /* ── ACCESO ── */
  const accX = bx + bw * 0.5, accY = by + bh;
  const aE = ip(accX, accY + 1.5, 0), aS = ip(accX, accY, 0);
  ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(aE.x, aE.y); ctx.lineTo(aS.x, aS.y); ctx.stroke(); ctx.setLineDash([]);
  const aA = Math.atan2(aE.y - aS.y, aE.x - aS.x);
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath(); ctx.moveTo(aE.x, aE.y);
  ctx.lineTo(aE.x - 8 * Math.cos(aA - 0.5), aE.y - 8 * Math.sin(aA - 0.5));
  ctx.lineTo(aE.x - 8 * Math.cos(aA + 0.5), aE.y - 8 * Math.sin(aA + 0.5));
  ctx.closePath(); ctx.fill();
  const aM = ip(accX, accY + 0.5, 0);
  ctx.save(); ctx.font = '700 8px "JetBrains Mono",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const aT = 'ACCESO'; const aW = ctx.measureText(aT).width + 8;
  ctx.fillStyle = 'rgba(251,251,250,.92)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(aM.x - aW / 2, aM.y - 6, aW, 12, 4); else ctx.rect(aM.x - aW / 2, aM.y - 6, aW, 12);
  ctx.fill(); ctx.fillStyle = '#2c3e50'; ctx.fillText(aT, aM.x, aM.y);
  ctx.restore();

  /* ── VIENTO (Elegant aerodynamic flow lines) ── */
  const wDeg = Z.windDeg || 45, wRad = wDeg * Math.PI / 180;
  const wLen = 8, wOff = 2;
  const wS = {
    x: bx + bw / 2 - Math.cos(wRad) * wLen * 0.6 + wOff,
    y: by + bh / 2 - Math.sin(wRad) * wLen * 0.6,
  };
  const wE = { x: wS.x + Math.cos(wRad) * wLen * 1.8, y: wS.y + Math.sin(wRad) * wLen * 1.8 };
  const wCol = '#3a7abf';
  
  for (let i = -2; i <= 2; i++) {
    const oX = i * 0.65, oY = i * 0.32;
    const s = ip(wS.x + oX + 2, wS.y + oY, 1.2), e = ip(wE.x + oX, wE.y + oY, 1.2);
    
    ctx.save();
    ctx.strokeStyle = wCol; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.globalAlpha = 0.55 - Math.abs(i) * 0.11;
    
    // Aerodynamic curve path
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    const cp1x = s.x + (e.x - s.x) * 0.3;
    const cp1y = s.y - 12;
    const cp2x = s.x + (e.x - s.x) * 0.7;
    const cp2y = e.y + 12;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, e.x, e.y);
    ctx.stroke();
    
    // Flow arrow heads
    const wa = Math.atan2(e.y - (s.y+e.y)/2, e.x - (s.x+e.x)/2);
    ctx.fillStyle = wCol;
    ctx.beginPath(); ctx.moveTo(e.x, e.y);
    ctx.lineTo(e.x - 7 * Math.cos(wa - 0.5), e.y - 7 * Math.sin(wa - 0.5));
    ctx.lineTo(e.x - 7 * Math.cos(wa + 0.5), e.y - 7 * Math.sin(wa + 0.5));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  
  const wM = ip(wS.x + wLen * 0.7, wS.y + wLen * 0.3, 2.0);
  ctx.fillStyle = wCol; ctx.font = '700 9px "JetBrains Mono",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('VIENTO → ' + (Z.viento || ''), wM.x, wM.y);

  /* ── SOL (Glowing architectural overlay) ── */
  ctx.strokeStyle = 'rgba(239, 159, 39, 0.12)'; ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    const t = ip(bx + bw * (0.15 + i * 0.18), by + bh * 0.1, bz);
    const s = ip(bx + bw + 2 + i * 1.5, by - 2 - i * 1.5, bz + 2.5 + i * 0.5);
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke();
  }
  const sp = ip(bx + bw + 3.5, by - 2, 4);
  
  // Sun glow ring
  ctx.fillStyle = 'rgba(239, 159, 39, 0.08)'; ctx.beginPath(); ctx.arc(sp.x, sp.y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(239, 159, 39, 0.45)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(sp.x, sp.y, 12, 0, Math.PI * 2); ctx.stroke();
  // Radial rays
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(sp.x + 14 * Math.cos(a), sp.y + 14 * Math.sin(a));
    ctx.lineTo(sp.x + 18 * Math.cos(a), sp.y + 18 * Math.sin(a));
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(216, 90, 48, 0.75)'; ctx.font = '700 8px "JetBrains Mono",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SOL', sp.x, sp.y + 24);

  /* ── BRÚJULA (Minimalist) ── */
  const bcX = W - 150, bcY = 45;
  ctx.save(); ctx.strokeStyle = 'rgba(44, 62, 80, 0.15)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.arc(bcX, bcY, 20, 0, Math.PI * 2); ctx.stroke();
  const dirM = { N: -30, E: 30, S: 150, O: 210 };
  Object.entries(dirM).forEach(([l, deg]) => {
    const a = deg * Math.PI / 180;
    const x = bcX + 18 * Math.cos(a), y = bcY + 18 * Math.sin(a);
    ctx.strokeStyle = l === 'N' ? '#e74c3c' : 'rgba(44, 62, 80, 0.25)';
    ctx.lineWidth = l === 'N' ? 1.5 : 0.6;
    ctx.beginPath(); ctx.moveTo(bcX, bcY); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = l === 'N' ? '#e74c3c' : '#7f8c8d';
    ctx.font = l === 'N' ? '700 9px "JetBrains Mono",sans-serif' : '500 8px "JetBrains Mono",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(l, bcX + 26 * Math.cos(a), bcY + 26 * Math.sin(a));
  });
  ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(bcX, bcY, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const dirL = { N:'NORTE', S:'SUR', E:'ESTE', O:'OESTE',
    NE:'NORESTE', NO:'NOROESTE', SE:'SURESTE', SO:'SUROESTE' };
  ctx.fillStyle = 'rgba(44, 62, 80, 0.55)'; ctx.font = '500 8px "JetBrains Mono",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Frente: ' + (dirL[frente] || frente), bcX, bcY + 34);

  /* ── LEYENDA (Sleek minimalist table) ── */
  let legY = H - 40;
  const legI = [
    { col: 'rgba(59, 139, 212, 0.25)', border: '#3a7abf', lbl: 'Ventana N (Principal)', sw: 16 },
    { col: 'rgba(76, 175, 80, 0.25)', border: '#3a8a3a', lbl: 'Ventana E/S (Secundaria)', sw: 16 },
    { dr: (x, y) => { ctx.fillStyle='#6ab04c'; ctx.beginPath(); ctx.arc(x+7, y+5, 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(44,62,80,0.3)'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.arc(x+7, y+5, 5, 0, Math.PI*2); ctx.stroke(); }, lbl: 'Árbol nativo' },
    { dr: (x, y) => { ctx.strokeStyle='#2c3e50'; ctx.lineWidth=1.2; ctx.setLineDash([3,2]);
      ctx.beginPath(); ctx.moveTo(x, y+5); ctx.lineTo(x+16, y+5); ctx.stroke(); ctx.setLineDash([]); }, lbl: 'Acceso' },
    { dr: (x, y) => { ctx.strokeStyle='#3a7abf'; ctx.lineWidth=1.5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x, y+3); ctx.lineTo(x+8, y+3); ctx.lineTo(x+14, y+6); ctx.stroke(); }, lbl: 'Viento' },
    { dr: (x, y) => { ctx.fillStyle='rgba(239, 159, 39, 0.08)'; ctx.beginPath(); ctx.arc(x+8, y+5, 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(239, 159, 39, 0.55)'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.arc(x+8, y+5, 5, 0, Math.PI*2); ctx.stroke(); }, lbl: 'Radiación solar' },
  ];
  let legX = 12;
  legI.forEach((it, i) => {
    if (i > 0 && i % 3 === 0) { legY += 18; legX = 12; }
    if (it.dr) it.dr(legX, legY);
    else { 
      ctx.fillStyle = it.col; ctx.fillRect(legX, legY - 3, it.sw, 8);
      ctx.strokeStyle = it.border; ctx.lineWidth = 0.8; ctx.strokeRect(legX, legY - 3, it.sw, 8); 
    }
    ctx.fillStyle = '#555'; ctx.font = '500 9px "JetBrains Mono",sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(it.lbl, legX + 22, legY + 2);
    legX += ctx.measureText(it.lbl).width + 36;
    if (legX > W - 120) { legY += 18; legX = 12; }
  });

  /* ── CARTELA / DATA PANEL ── */
  ctx.fillStyle = '#2c3e50'; ctx.font = '700 13px "JetBrains Mono",sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('DIAGRAMA AXONOMÉTRICO — Lote y vivienda', 12, 10);
  ctx.fillStyle = 'rgba(44, 62, 80, 0.55)'; ctx.font = '500 10px "JetBrains Mono",sans-serif';
  ctx.fillText(Z.name + '  ·  Frente: ' + (dirL[frente] || frente) + '  ·  Viento: ' + (Z.viento || '') + '  ·  Escala aprox.', 12, 26);

  const boxX = 12, boxY = 42, boxW = 220, boxH = 46;
  ctx.fillStyle = 'rgba(44, 62, 80, 0.03)'; ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxW, boxH, 4); else ctx.rect(boxX, boxY, boxW, boxH);
  ctx.fill(); ctx.strokeStyle = 'rgba(44, 62, 80, 0.08)'; ctx.lineWidth = 0.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxW, boxH, 4); else ctx.rect(boxX, boxY, boxW, boxH);
  ctx.stroke();
  ctx.fillStyle = 'rgba(44, 62, 80, 0.6)'; ctx.font = '500 9px "JetBrains Mono",sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Lote: ' + lotW + '×' + lotD + ' m  |  Edificio: ' + bw + '×' + bh + '×' + bz + ' m', boxX + 6, boxY + 4);
  ctx.fillText('Frente al ' + (dirL[frente] || frente) + '  |  Tipo: ' + tipo, boxX + 6, boxY + 17);
  ctx.fillText('Viento: ' + (Z.viento || '') + ' (' + wDeg + '°)  |  ' + (Z.tags ? Z.tags[0] : ''), boxX + 6, boxY + 30);

  /* ── ESCALA GRÁFICA ── */
  ctx.save();
  const sbY = boxY + boxH + 12;
  ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(boxX, sbY); ctx.lineTo(boxX + 120, sbY);
  ctx.moveTo(boxX, sbY - 5); ctx.lineTo(boxX, sbY + 5);
  ctx.moveTo(boxX + 120, sbY - 5); ctx.lineTo(boxX + 120, sbY + 5);
  ctx.stroke();
  ctx.fillStyle = '#1a1a1a'; ctx.font = '400 7px "Inter",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('5 m', boxX + 60, sbY + 10);
  ctx.fillStyle = '#1a1a1a';
  for (let i = 0; i < 5; i++) { if (i % 2 === 0) ctx.fillRect(boxX + i * 24, sbY - 4, 24, 4); }
  ctx.restore();
}



/* ══════════════════════════════════════
   RECOMENDACIONES
══════════════════════════════════════ */
function buildRecs(Z, frente, tipo, entorno) {
  const ch = Z.id==='chaco', mis=Z.id==='misionero', or=Z.id==='subtropical';
  const fN = ['N','NE','NO'].includes(frente);

  return [
    /* 1. VENTANAS */
    { icon:'🪟', titulo:'Orientación de ventanas y aberturas', items:[
      { icon:'⬆️', titulo:'Ventanas principales al norte (40–60% del área vidriada)',
        desc:`Concentrá la mayor superficie vidriada al norte. Alero de ${ch?'50–60':'60–80'} cm bloquea el sol de verano (88°) y permite el sol de invierno (41°) en lat. 25°S. Usá DVH bajo emisivo en aberturas grandes.`,
        why:`Con frente al ${frente}, la fachada norte ${fN ? 'da a la calle — aprovechás apertura generosa al norte con diseño visible desde la vía pública' : 'queda hacia el interior — el corredor de acceso no debe bloquear esta fachada clave'}.` },
      { icon:'⬇️', titulo:'Ventanas secundarias al sur (15–25%)',
        desc:`La fachada sur nunca recibe sol directo. Usala para ventilación cruzada con aberturas altas y regulables. ${or||mis ? 'Esencial para el flujo N→S en clima húmedo.' : 'Minimizá el área para reducir pérdidas en invierno.'}`,
        why:`El par norte-sur genera ventilación cruzada con el viento ${Z.viento}. Abertura alta en sur extrae el aire caliente por estratificación sin equipos mecánicos.` },
      { icon:'↔️', titulo:`Fachadas este y oeste — ${ch?'protección máxima':'control obligatorio'}`,
        desc:`Este: celosías verticales a 25° o alero de 40 cm. Oeste: celosías o enredaderas densas — el sol de tarde es el más crítico. ${ch ? 'En el Chaco ninguna ventana al oeste sin 100% de protección.' : 'Minimizá aberturas al oeste o usá DVH con factor solar <0.3.'}`,
        why:'El sol de tarde (15–19 hs) en Paraguay tiene ángulo bajo (20–35°) y penetra profundamente. Es el mayor aportante de calor no deseado en la OR y el Chaco.' },
    ]},

    /* 2. ENTRADA */
    { icon:'🚪', titulo:'Entrada principal y acceso', items:[
      { icon:'🏠', titulo:`Acceso desde fachada ${frente} con espacio de transición`,
        desc:`Con frente al ${frente}: ${ fN ? 'La entrada al norte es ideal — incorporá una galería cubierta de 1.5–2 m de profundidad que actúe como transición entre exterior soleado e interior.' : ['S','SE','SO'].includes(frente) ? 'Fachada sur sin sol directo — el acceso es fresco. Diseñá un porche cerrado o galería acristalada hacia el norte.' : `Fachada ${frente} — protegé la entrada con alero profundo (>1.2 m) o pérgola con enredadera.`}`,
        why:`El espacio de transición reduce el intercambio de calor con el exterior en cada apertura de puerta. Disminuye la carga de climatización hasta un 15%.` },
      { icon:'🌀', titulo:'Vestíbulo de doble puerta interior',
        desc:`Vestíbulo mínimo 1.5 × 2 m antes del espacio principal. ${or||mis ? 'En clima húmedo frena insectos y regula humedad.' : ch ? 'En el Chaco reduce el choque térmico al entrar desde 42°C exterior.' : 'Regula la transición térmica entre exterior e interior.'}`,
        why:`Una diferencia de 8–12°C entre exterior e interior genera intercambio de 0.5–1 m³ de aire en cada apertura de puerta. El vestíbulo reduce ese impacto en un 70%.` },
    ]},

    /* 3. ESTRATEGIAS */
    { icon:'🌡️', titulo:'Estrategias bioclimáticas — ' + Z.name, items:
      ch ? [
        { icon:'📐', titulo:'Orientación compacta — eje O-E',
          desc:'Edificio compacto con relación largo:ancho de 1.2–1.4. Minimizá la superficie expuesta al sol en fachadas E y O.',
          why:'En el Chaco, cada m² de fachada E-O sin proteger equivale a una ganancia de calor de 300–500 W en horas pico.' },
        { icon:'🧱', titulo:'Masa térmica máxima — 25–30 cm de muro',
          desc:'Ladrillo macizo 25 cm + revoque barro 3 cm = retardo térmico de 9–11 horas. Combinar con ventilación nocturna total (21–6 hs).',
          why:'Amplitud de 20°C en el Chaco: con masa adecuada el interior puede mantenerse 8–12°C por debajo de la temperatura exterior pico.' },
        { icon:'💧', titulo:'Patio central + enfriamiento evaporativo',
          desc:'Patio central con fuente o vegetación húmeda. El evaporativo enfría el aire 5–8°C antes de ingresar. Relación patio: ancho ≥ 0.5× altura muros.',
          why:'El enfriamiento evaporativo es el único sistema pasivo viable en el Chaco por su baja humedad (30–50%). No funciona en la OR (HR >70%).' },
      ] : or ? [
        { icon:'🌬️', titulo:'Ventilación cruzada N-S como sistema principal',
          desc:'Abertura norte = 60% del total vidriado, sur = 40%. Para 80 m², necesitás 4–5 m² de abertura norte. Usá puertas-ventana de piso a techo.',
          why:'Con viento NE a 3 m/s (habitual en Asunción), 2 m² de abertura generan 6 m³/s de circulación — suficiente para 100 m² sin aire acondicionado.' },
        { icon:'🏠', titulo:'Cubierta con cámara de aire ventilada',
          desc:'Chapa prepintada blanca (albedo 0.70) + cámara de aire de 15 cm + cielorraso flotante. Temperatura interior del cielorraso: 35°C vs 60°C de cubierta convencional.',
          why:'La cubierta recibe radiación pico de 1.200 W/m² en enero. Cámara + albedo alto reduce transmisión al interior en 65–70%.' },
        { icon:'🌿', titulo:'Sombreado vegetal caducifolio sincronizado',
          desc:'Lapacho o timbó al norte: sin hojas en jun–ago (sol invernal necesario a 41°), copa densa en nov–mar (bloquea sol a 88°). Distancia = radio copa adulta.',
          why:'Un árbol caducifolio adulto bien posicionado reduce la ganancia solar de la fachada norte hasta un 80% en verano, sin costo operativo.' },
      ] : mis ? [
        { icon:'🌧️', titulo:'Gestión del agua pluvial — prioridad',
          desc:'Techo inclinado mínimo 30%. Canaletas sobredimensionadas para >100 mm/día. Cisterna de 5.000–10.000 L para recolección pluvial.',
          why:'La zona misionera recibe hasta 200 mm en 24 horas. Sin gestión adecuada, el agua penetra cubiertas y muros en pocos años.' },
        { icon:'🌿', titulo:'Techo verde extensivo — solución integral',
          desc:'Membrana + geotextil + sustrato 10 cm + vegetación local. Reduce temperatura superficial 20°C y retiene el 40–60% de la lluvia. Carga: 100–130 kg/m².',
          why:'El techo verde resuelve simultáneamente: aislación térmica (= 5 cm EPS), impermeabilización y gestión de escorrentía.' },
        { icon:'💨', titulo:'Ventilación elevada por efecto chimenea',
          desc:'Aberturas bajas (40 cm del piso) + aberturas altas (2.5–3 m). La diferencia de temperatura genera convección de 0.5–1 m/s sin viento exterior.',
          why:'Con HR 65–80% y ventilación de 1 m/s, el confort percibido mejora 3–4°C equivalentes. Puede eliminar el A/A en el 60–70% de los días del año.' },
      ] : [
        { icon:'📐', titulo:'Diseño flexible — dos modos estacionales',
          desc:'Aberturas regulables grandes (norte) + celosías orientables (E, O). Dos modos: verano (ventilación + sombra) e invierno (captación solar + masa).',
          why:'La zona de transición tiene veranos similares a la OR e inviernos con heladas ocasionales. Un diseño fijo subutiliza el potencial de confort pasivo.' },
        { icon:'🌙', titulo:'Masa térmica + ventilación nocturna',
          desc:'Muros de 20–25 cm de ladrillo cerámico. Ventilación nocturna de 21–6 hs cuando baja >8°C. Cerrar herméticamente de día.',
          why:'La amplitud de 12–15°C en esta zona permite enfriamiento nocturno pasivo. Con masa adecuada, el interior se mantiene 5–8°C bajo la máxima diaria.' },
        { icon:'🌿', titulo:'Microclima vegetal — cortaviento',
          desc:'Arbolado denso al norte y oeste (caducos) para verano. Cerca viva al sur-este para protección de vientos fríos en invierno.',
          why:'Los frentes polares en junio-agosto bajan la sensación térmica hasta 3–4°C equivalentes. Un cortaviento vegetal al sur mitiga ese efecto.' },
      ]
    },

    /* 4. MATERIALES */
    { icon:'🧱', titulo:'Materiales recomendados para esta zona', items:
      ch ? [
        { icon:'🧱', titulo:'Muros: ladrillo macizo 25 cm + revoque barro',
          desc:'λ = 0.70 W/mK. Retardo térmico 8–10 h. El barro agrega masa y regulación higroscópica. Disponibilidad y costo bajos en el Chaco.',
          why:'En el Chaco: priorizar masa sobre aislación. Mayor masa → mayor retardo → menor temperatura interior en el pico de 42°C.' },
        { icon:'🏠', titulo:'Cubierta: chapa blanca + cámara 15 cm + cielorraso',
          desc:'Albedo chapa blanca: 0.70–0.75. Cámara ventilada 15 cm reduce transmisión un 60% adicional. Temperatura interior cubierta: 38°C vs 65°C sin protección.',
          why:'Sin aislación, la cubierta transmite 400 W/m² al interior en el Chaco. Con este sistema baja a 60–80 W/m².' },
        { icon:'🪟', titulo:'Aberturas: DVH bajo emisivo, mínimas al E-O',
          desc:'E y O: máximo 8% de la fachada. Norte y sur: DVH Low-E, factor solar 0.3–0.4. Reduce ganancia solar de aberturas en un 65% vs vidrio simple.',
          why:'1 m² de vidrio simple en el Chaco transmite hasta 800 W en horas pico. DVH bajo emisivo: solo 240 W.' },
      ] : mis ? [
        { icon:'🧱', titulo:'Muros: ladrillo cerámico hueco 20 cm + revoque hidrófugo',
          desc:'λ = 0.41 W/mK. Retardo 6–8 h. Revoque hidrófugo exterior obligatorio por alta humedad. Disponibilidad excelente en Itapúa y Encarnación.',
          why:'En zona misionera la resistencia a la humedad es más importante que la masa extrema. El revoque hidrófugo previene patologías en 10–15 años.' },
        { icon:'🏠', titulo:'Cubierta: membrana PVC blanca + techo verde extensivo',
          desc:'Membrana PVC termosoldada (albedo 0.75) + sustrato 10 cm + vegetación. Pendiente mínima 30%. Canaletas sobredimensionadas.',
          why:'El techo verde retiene 40–60% de lluvia y reduce picos de escorrentía. Con 1.900 mm/año, es la cubierta más adecuada para la zona.' },
        { icon:'🪟', titulo:'Aberturas: vidrio simple con protección exterior',
          desc:'Vidrio simple 6 mm + celosías exteriores + aleros 70 cm. DVH solo si hay aire acondicionado. Priorizar protección solar exterior.',
          why:'En zona misionera el DVH se recupera en 8–12 años vs 5–7 en la OR. La protección exterior es más efectiva y barata.' },
      ] : [
        { icon:'🧱', titulo:'Muros: ladrillo cerámico hueco 20 cm',
          desc:'λ = 0.41 W/mK. Retardo 6–8 h. Equilibrio óptimo entre masa, disponibilidad y costo. Material más costo-efectivo para la OR.',
          why:'El ladrillo hueco retarda el pico de temperatura 6–8 h, llevando el máximo interior de las 12 hs a las 18–20 hs cuando ya comenzó a bajar afuera.' },
        { icon:'🏠', titulo:'Cubierta: chapa blanca + cámara de aire 15 cm',
          desc:'Albedo objetivo >0.65. Cámara ventilada de 15 cm + cielorraso yeso-cartón. Temperatura cielorraso: 35–38°C vs 60°C sin protección.',
          why:'En enero en Asunción la cubierta recibe 1.200–1.400 W/m². Con cubierta oscura se transmiten 250–350 W/m² al interior. Con este sistema: 60–90 W/m².' },
        { icon:'🪟', titulo:'Aberturas: DVH bajo emisivo en norte y oeste',
          desc:'Norte: DVH Low-E, U = 1.1–1.4 W/m²K, factor solar 0.3–0.4. Oeste: factor solar <0.25. Este y sur: vidrio simple + protección exterior.',
          why:'La inversión en DVH en la OR se recupera en 5–7 años. La fachada norte con gran superficie vidriada es la que más se beneficia.' },
      ]
    },

    /* 5. ESTACIONES */
    { icon:'🗓️', titulo:'Estrategias por estación del año', items:[
      { icon: Z.estaciones.verano.icon,
        titulo:`Verano · ${Z.estaciones.verano.meses} · ${Z.estaciones.verano.tmp}`,
        desc: Z.estaciones.verano.tip,
        why:`Precipitaciones en este período: ~${Z.estaciones.verano.mm} mm. ${ch?'La escasa lluvia concentrada en pocas tormentas exige cisternas.':'Aprovechar las lluvias para recarga de cisternas y vegetación.'}`,
        cls:'season-verano' },
      { icon: Z.estaciones.otono.icon,
        titulo:`Otoño · ${Z.estaciones.otono.meses} · ${Z.estaciones.otono.tmp}`,
        desc: Z.estaciones.otono.tip,
        why:`Precipitaciones en este período: ~${Z.estaciones.otono.mm} mm. ${mis?'Aún con lluvias moderadas, el confort térmico mejora notablemente.':'Período de menor demanda energética del año.'}`,
        cls:'season-otono' },
      { icon: Z.estaciones.invierno.icon,
        titulo:`Invierno · ${Z.estaciones.invierno.meses} · ${Z.estaciones.invierno.tmp}`,
        desc: Z.estaciones.invierno.tip,
        why:`Precipitaciones en este período: ~${Z.estaciones.invierno.mm} mm. El sol de invierno (ángulo 41° a lat. 25°S) penetra profundamente por fachada norte — diseñá aleros que lo permitan.`,
        cls:'season-invierno' },
      { icon: Z.estaciones.primavera.icon,
        titulo:`Primavera · ${Z.estaciones.primavera.meses} · ${Z.estaciones.primavera.tmp}`,
        desc: Z.estaciones.primavera.tip,
        why:`Precipitaciones en este período: ~${Z.estaciones.primavera.mm} mm. La primavera en Paraguay puede alcanzar picos de calor similares al verano antes de diciembre.`,
        cls:'season-primavera' },
    ]},

    /* 6. PLANTAS */
    { icon:'🌿', titulo:'Árboles y plantas recomendados por posición',
      items:[{ icon:'📋', titulo:'Selección para ' + Z.name + ' — frente al ' + frente,
        desc:`Especies nativas seleccionadas por función bioclimática específica en el lote. Todas son autóctonas del Paraguay, adaptadas al clima local, de bajo mantenimiento una vez establecidas.`,
        why:'Especies nativas requieren 40–60% menos agua que exóticas, no necesitan fertilizantes especiales y su comportamiento estacional está sincronizado con el clima local.' }],
      plantas: getPlantas(Z, frente)
    },
  ];
}

function getPlantas(Z, frente) {
  const ch = Z.id==='chaco', mis=Z.id==='misionero';
  if (ch) return [
    { nombre:'Ñandubay',      sci:'Prosopis affinis',         why:'Tolerancia extrema a calor y sequía. Copa abierta que tamiza sin bloquear completamente. Raíces profundas no invasivas.',     pos:'Fachada Norte', cls:'pn' },
    { nombre:'Palo borracho', sci:'Ceiba speciosa',           why:'Caducifolio: permite sol invernal valioso en el Chaco. Copa densa en verano. Raíces que no dañan veredas ni cimientos.',      pos:'Fachada NO',    cls:'po' },
    { nombre:'Guayacán',      sci:'Bulnesia sarmientoi',      why:'Árbol chaqueño de gran resistencia. Flores amarillas ornamentales. Sombreado puntual en patios centrales.',                   pos:'Patio central', cls:'pper' },
    { nombre:'Cactus cardón', sci:'Cereus peruvianus',        why:'Interior luminoso: riego mínimo, purifica el aire. Exterior en patio: elemento ornamental vernáculo chaqueño.',               pos:'Interior / Patio', cls:'pint' },
    { nombre:'Stevia / Kaa he',sci:'Stevia rebaudiana',       why:'Medicinal nativa. En ventana con luz intensa. 4h de sol filtrado es suficiente. Endulzante natural en cocina.',               pos:'Interior Norte', cls:'pint' },
  ];
  if (mis) return [
    { nombre:'Lapacho rosado', sci:'Handroanthus impetiginosus', why:'Caducifolio: sin hojas en jun–ago (sol invernal), sombra máxima en dic–mar. Floración en agosto de alto valor.',          pos:'Fachada Norte', cls:'pn' },
    { nombre:'Ingá / Pacay',   sci:'Inga vera',                 why:'Árbol de ribera perennifolio. Ideal para napas freáticas altas o anegamiento temporal. Sombra continua.',                  pos:'Fachada E / jardín', cls:'pe' },
    { nombre:'Ceibo',          sci:'Erythrina crista-galli',    why:'Tolera suelos anegados. Flores rojas ornamentales. Ubicar en zona de mayor acumulación de agua pluvial del lote.',          pos:'Zona húmeda',   cls:'pper' },
    { nombre:'Mburukuja',      sci:'Passiflora caerulea',       why:'Enredadera nativa. Cubre pérgolas o celosías al oeste en 1–2 temporadas. Bloquea hasta 70% de radiación de tarde.',        pos:'Fachada Oeste', cls:'po' },
    { nombre:'Helecho de palo',sci:'Blechnum brasiliense',      why:'Interior en baños o cocinas húmedas. Transpira mejorando la HR interior. En zona misionera equilibra el microclima.',       pos:'Interior húmedo', cls:'pint' },
  ];
  return [
    { nombre:'Lapacho rosado',  sci:'Handroanthus impetiginosus', why:'Principal árbol bioclimático de la OR. Caducidad sincronizada: sombra en verano (nov–mar), sol en invierno (jun–ago). Plantarlo a 4–5 m del edificio.', pos:'Fachada Norte',    cls:'pn' },
    { nombre:'Timbó',           sci:'Enterolobium contortisiliquum', why:'Copa horizontal 10–15 m. Para lotes amplios, 1 timbó al norte crea microclima 3–4°C más fresco. Sombra efectiva en 4–5 años.',                      pos:'Norte — lote amplio', cls:'pn' },
    { nombre:'Mbokaja',         sci:'Acrocomia aculeata',         why:'Palmera nativa de sombreado vertical. No bloquea el sol bajo invernal. Excelente eje visual de acceso. Frutos comestibles.',                           pos:'Acceso / borde',   cls:'pe' },
    { nombre:'Mburukuja',       sci:'Passiflora caerulea',        why:'Enredadera para fachada oeste. Con celosía simple cubre 4–6 m² por temporada y bloquea hasta 70% de radiación solar de tarde.',                       pos:'Fachada Oeste',    cls:'po' },
    { nombre:'Jazmín Paraguay', sci:'Brunfelsia australis',       why:'Arbusto aromático para patio o jardín de sombra. Floración prolongada. Plantarlo a >1.5 m del edificio para no bloquear ventilación sur.',             pos:'Patio / Sur',      cls:'ps' },
    { nombre:'Pitanga',         sci:'Eugenia uniflora',           why:'Seto vivo exterior (barrera visual, cortaviento) o planta interior en ventana norte. Frutos comestibles. Hojas repelen insectos.',                     pos:'Seto / Interior',  cls:'pint' },
  ];
}

/* ══════════════════════════════════════
   ZONAS
══════════════════════════════════════ */
function renderZones() {
  document.getElementById('zgrid').innerHTML = ZONES.map((z,i) => `
    <div class="zcard${selZ===i?' on':''}" onclick="selZone(${i})"
         style="${selZ===i?`border-color:${z.color};border-width:1.5px`:''};
                background:${selZ===i?z.color+'10':''}">
      <div class="zdot" style="background:${z.color}"></div>
      <h3>${z.name}</h3><p>${z.region}</p>
      <div style="margin-top:8px;font-size:10px;color:${z.color};font-weight:600">${z.reto}</div>
    </div>`).join('');
}

function selZone(i) {
  selZ = i; renderZones();
  const z = ZONES[i];
  document.getElementById('zdet').innerHTML = `
    <div class="zdet">
      <h2 style="color:${z.color}">${z.name}</h2>
      <p style="font-size:12px;color:var(--on-surface-variant,#44474a);margin-bottom:8px">📍 ${z.region}</p>
      <div class="zdesc">${z.desc}</div>
      <div class="stats">
        <div class="sbox"><div class="v">${z.temp}</div><div class="l">Temperatura</div></div>
        <div class="sbox"><div class="v">${z.hum}</div><div class="l">Humedad</div></div>
        <div class="sbox"><div class="v" style="font-size:13px">${z.lluvia}</div><div class="l">Lluvia</div></div>
        <div class="sbox"><div class="v" style="font-size:11px">${z.viento}</div><div class="l">Viento</div></div>
      </div>
      <div style="font-size:13px;margin-bottom:12px"><strong>Reto:</strong> ${z.reto}</div>
      ${renderCities(z.id)}
      <div class="dgrid">
        <div class="dbox"><h4>Rosa de vientos</h4>${wrose(z)}</div>
        <div class="dbox"><h4>Trayectoria solar — Perfil E→O</h4>${sunpath()}</div>
        ${solarMap()}
        ${lluviaChart(z)}
        <div class="dbox"><h4>Estaciones del año</h4>${seasonBadges(z)}</div>
      </div>
    </div>`;
}

function lluviaChart(z) {
  if (!z.lluviaMensual) return '';
  const meses = ['E','F','M','A','M','J','J','A','S','O','N','D'];
  const max = Math.max(...z.lluviaMensual);
  const total = z.lluviaMensual.reduce((a,b)=>a+b,0);
  const W=190, H=82, padX=12, padY=10;
  const barW = (W-padX*2)/12;
  let bars='';
  z.lluviaMensual.forEach((mm,i)=>{
    const x=padX+i*barW;
    const h=Math.max(2,(mm/max)*(H-padY*2));
    const y=H-padY-h;
    const isMax=mm===max;
    bars+=`<rect x="${x+1}" y="${y}" width="${barW-2}" height="${h}" fill="${z.color}" opacity="${isMax?'0.85':'0.5'}" rx="1.5"/>`;
    bars+=`<text x="${x+barW/2}" y="${H-1}" text-anchor="middle" style="font-size:6.5px;fill:var(--on-surface-variant,#aaa)">${meses[i]}</text>`;
    if(isMax) bars+=`<text x="${x+barW/2}" y="${y-3}" text-anchor="middle" style="font-size:7px;fill:${z.color};font-weight:600">${mm}</text>`;
  });
  return `<div class="dbox"><h4>Precipitaciones mensuales · ${total} mm/año</h4><svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${bars}</svg></div>`;
}

function seasonBadges(z) {
  if (!z.estaciones) return '';
  const s=z.estaciones;
  const colors={verano:'#EF9F27',otono:'#D85A30',invierno:'#3B8BD4',primavera:'#1D9E75'};
  return `<div style="display:flex;flex-direction:column;gap:6px;font-size:11px">
    ${['verano','otono','invierno','primavera'].map(k=>`
    <div style="display:flex;align-items:baseline;gap:7px">
      <span style="font-size:13px">${s[k].icon}</span>
      <div>
        <span style="font-weight:600;color:${colors[k]}">${s[k].meses}</span>
        <span style="color:var(--on-surface-variant,#44474a);margin-left:5px;font-size:10px">${s[k].tmp} · ~${s[k].mm} mm</span>
      </div>
    </div>`).join('')}
  </div>`;
}

function wrose(z) {
  const dirs=['N','NE','E','SE','S','SO','O','NO'], base=[30,55,20,15,25,20,18,22];
  const sh = Math.round(z.windDeg/45)%8;
  const vals = [...base.slice(sh),...base.slice(0,sh)];
  const mx = Math.max(...vals), cx=95, cy=95, r=68;
  let p='', l='';
  dirs.forEach((d,i) => {
    const an=(i*45-90)*Math.PI/180, len=(vals[i]/mx)*r, w=14;
    const a1=((i*45-90-w/2))*Math.PI/180, a2=((i*45-90+w/2))*Math.PI/180;
    const isDom=vals[i]===mx;
    p += `<path d="M${cx+10*Math.cos(a1)},${cy+10*Math.sin(a1)} L${cx+len*Math.cos(a1)},${cy+len*Math.sin(a1)} L${cx+len*Math.cos(a2)},${cy+len*Math.sin(a2)} L${cx+10*Math.cos(a2)},${cy+10*Math.sin(a2)}Z" fill="${isDom?z.color:'#999'}" opacity="${isDom ? .9 : .45}"/>`;
    const lx=cx+(r+17)*Math.cos(an), ly=cy+(r+17)*Math.sin(an);
    l += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" style="font-size:${d==='N'?'13':'10'}px;font-weight:${d==='N'?'700':'500'};fill:${d==='N'?'var(--on-surface,#191c1d)':'var(--on-surface-variant,#44474a)'}">${d}</text>`;
  });
  return `<svg viewBox="0 0 190 190" width="100%" style="display:block"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--outline-variant,#c5c6ca)" stroke-width="0.5"/><circle cx="${cx}" cy="${cy}" r="${r*.6}" fill="none" stroke="var(--outline-variant,#c5c6ca)" stroke-width="0.5" stroke-dasharray="3,3"/>${p}${l}</svg>`;
}

function sunpath() {
  const W=240, H=150, padX=20, hz=118;
  const arcs = [
    {lbl:'Jun · 41°', col:'#3B8BD4', alt:41, r1:-110, r2:110, dash:'5,3'},
    {lbl:'Sep · 65°', col:'#5a5a5a', alt:65, r1:-90,  r2:90,  dash:'3,2'},
    {lbl:'Dic · 88°', col:'#EF9F27', alt:88, r1:-70,  r2:70,  dash:''},
  ];
  const xScale = (W-padX*2)/220;
  let svg = '';

  [30,60].forEach(a => {
    const yy = hz - (a/90)*(hz-10);
    svg += `<line x1="${padX}" y1="${yy}" x2="${W-padX}" y2="${yy}" stroke="var(--outline-variant,#c5c6ca)" stroke-width="0.5" stroke-dasharray="3,2"/>`;
    svg += `<text x="${padX-2}" y="${yy}" text-anchor="end" dominant-baseline="middle" style="font-size:9px;fill:var(--on-surface-variant,#44474a)">${a}°</text>`;
  });

  svg += `<line x1="${padX}" y1="${hz}" x2="${W-padX}" y2="${hz}" stroke="var(--outline,#75777a)" stroke-width="0.8"/>`;
  svg += `<text x="${padX}" y="${hz+12}" style="font-size:10px;fill:var(--on-surface,#191c1d);font-weight:600">E</text>`;
  svg += `<text x="${W-padX-8}" y="${hz+12}" style="font-size:10px;fill:var(--on-surface,#191c1d);font-weight:600">O</text>`;
  svg += `<text x="${W/2}" y="${hz+12}" text-anchor="middle" style="font-size:10px;fill:var(--on-surface-variant,#44474a)">N (cenit solar)</text>`;

  arcs.forEach(a => {
    const pts = [];
    for (let az=a.r1; az<=a.r2; az+=3) {
      const t = (az-a.r1)/(a.r2-a.r1);
      const x = padX + (az - a.r1) / (a.r2 - a.r1) * (W - padX*2);
      const y = hz - Math.sin(t*Math.PI) * a.alt * (hz-10)/90;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const dashAttr = a.dash ? `stroke-dasharray="${a.dash}"` : '';
    svg += `<polyline points="${pts.join(' ')}" fill="none" stroke="${a.col}" stroke-width="2.5" stroke-linecap="round" ${dashAttr}/>`;
    // Label at peak (t=0.5 = noon)
    const peakX = W/2;
    const peakY = hz - a.alt * (hz-10)/90 - 6;
    svg += `<text x="${peakX}" y="${peakY}" text-anchor="middle" style="font-size:8.5px;fill:${a.col};font-weight:600">${a.lbl}</text>`;
  });

  // Noon line
  svg += `<line x1="${W/2}" y1="${hz}" x2="${W/2}" y2="8" stroke="rgba(128,128,128,0.15)" stroke-width="0.5" stroke-dasharray="3,2"/>`;
  svg += `<text x="${W/2}" y="6" text-anchor="middle" style="font-size:9px;fill:var(--on-surface-variant,#44474a);font-weight:500">Mediodía</text>`;

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${svg}</svg>`;
}

function solarMap() {
  const lat = -25 * Math.PI / 180;
  const R = 100, cx = 150, cy = 150, W = 300, H = 300;

  function toRad(d) { return d * Math.PI / 180; }

  function sunXY(dec_deg, ha_deg) {
    const dec = toRad(dec_deg);
    const ha = toRad(ha_deg);
    const sinAlt = Math.sin(lat)*Math.sin(dec) + Math.cos(lat)*Math.cos(dec)*Math.cos(ha);
    const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
    if (alt < 0.001) return null;
    const cosAz = (Math.sin(dec) - Math.sin(alt)*Math.sin(lat)) / (Math.cos(alt)*Math.cos(lat));
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
    if (ha_deg > 0) az = 2*Math.PI - az;
    const r = R * (1 - alt/(Math.PI/2));
    return { x: cx + r*Math.sin(az), y: cy - r*Math.cos(az), alt: alt*180/Math.PI };
  }

  const months = [
    {name:'Jun', dec:23.5,  col:'#3B8BD4', dash:'5,3', season:'Invierno'},
    {name:'Sep', dec:0,     col:'#888888', dash:'3,2', season:'Equinoccio'},
    {name:'Dic', dec:-23.5, col:'#EF9F27', dash:'',    season:'Verano'},
  ];

  let svg = '';

  [0,30,60,80].forEach(alt => {
    const r = R * (1 - alt/90);
    const op = alt===0 ? '0.5' : '0.2';
    svg += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="rgba(128,128,128,${op})" stroke-width="${alt===0?1:'0.5'}"/>`;
    if (alt > 0 && alt < 80) svg += `<text x="${(cx+4).toFixed(1)}" y="${(cy-r-3).toFixed(1)}" style="font-size:8px;fill:var(--on-surface-variant,#44474a)">${alt}°</text>`;
  });

  for (let a=0; a<360; a+=30) {
    const ar = toRad(a);
    svg += `<line x1="${cx}" y1="${cy}" x2="${(cx+R*Math.sin(ar)).toFixed(1)}" y2="${(cy-R*Math.cos(ar)).toFixed(1)}" stroke="var(--outline-variant,#c5c6ca)" stroke-width="0.5"/>`;
  }

  [{l:'N',a:0},{l:'S',a:180},{l:'E',a:90},{l:'O',a:270}].forEach(d => {
    const ar = toRad(d.a);
    svg += `<text x="${(cx+(R+14)*Math.sin(ar)).toFixed(1)}" y="${(cy-(R+14)*Math.cos(ar)+3).toFixed(1)}" text-anchor="middle" style="font-size:11px;fill:var(--on-surface,#191c1d);font-weight:700">${d.l}</text>`;
  });

  [6,8,10,12,14,16,18].forEach(h => {
    const ha = (h-12)*15;
    const pos = sunXY(0, ha);
    if (pos) {
      svg += `<circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="2" fill="var(--on-surface-variant,#44474a)" opacity="0.6"/>`;
      const offX = ha < 0 ? -10 : ha > 0 ? 4 : 0;
      const offY = ha === 0 ? -7 : -4;
      svg += `<text x="${(pos.x+offX).toFixed(1)}" y="${(pos.y+offY).toFixed(1)}" text-anchor="${ha<0?'end':ha>0?'start':'middle'}" style="font-size:7.5px;fill:var(--on-surface-variant,#44474a)">${h}h</text>`;
    }
  });

  // Sun paths
  months.forEach(m => {
    const pts = [];
    for (let ha=-120; ha<=120; ha+=2) {
      const pos = sunXY(m.dec, ha);
      if (pos) pts.push(`${pos.x.toFixed(1)},${pos.y.toFixed(1)}`);
    }
    if (pts.length > 1) {
      const da = m.dash ? `stroke-dasharray="${m.dash}"` : '';
      svg += `<polyline points="${pts.join(' ')}" fill="none" stroke="${m.col}" stroke-width="2.5" stroke-linecap="round" ${da}/>`;
    }
    // Peak label at noon (ha=0)
    const peak = sunXY(m.dec, 0);
    if (peak) {
      svg += `<circle cx="${peak.x.toFixed(1)}" cy="${peak.y.toFixed(1)}" r="4" fill="${m.col}" opacity="0.85"/>`;
      const lx = peak.x > cx+5 ? peak.x + 7 : peak.x - 7;
      const ta = peak.x > cx+5 ? 'start' : 'end';
      svg += `<text x="${lx.toFixed(1)}" y="${(peak.y-2).toFixed(1)}" text-anchor="${ta}" style="font-size:8.5px;fill:${m.col};font-weight:700">${m.name}</text>`;
      svg += `<text x="${lx.toFixed(1)}" y="${(peak.y+8).toFixed(1)}" text-anchor="${ta}" style="font-size:7.5px;fill:${m.col}">${peak.alt.toFixed(0)}° alt.</text>`;
    }
    // Sunrise/sunset markers
    const rise = sunXY(m.dec, -120);
    const set_ = sunXY(m.dec, 120);
    if (rise) svg += `<circle cx="${rise.x.toFixed(1)}" cy="${rise.y.toFixed(1)}" r="3" fill="${m.col}" opacity="0.5"/>`;
    if (set_) svg += `<circle cx="${set_.x.toFixed(1)}" cy="${set_.y.toFixed(1)}" r="3" fill="${m.col}" opacity="0.5"/>`;
  });

  const legend = months.map(m =>
    `<span><svg width="18" height="4" style="vertical-align:middle"><line x1="0" y1="2" x2="18" y2="2" stroke="${m.col}" stroke-width="2.5" stroke-dasharray="${m.dash||''}"/></svg> ${m.name} (${m.season})</span>`
  ).join('');

  return `<div class="dbox solar-map-box">
    <h4>Mapa solar anual — Lat. 25°S · Punto = altitud al mediodía</h4>
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;max-height:260px">${svg}</svg>
    <div class="solar-legend">${legend}</div>
  </div>`;
}

/* ══════════════════════════════════════
   ESTRATEGIAS
══════════════════════════════════════ */
function renderStrats() {
  const cats = ['todos','ventilacion','sombreado','masa','cubierta','forma'];
  const cl = {todos:'Todas',ventilacion:'Ventilación',sombreado:'Sombreado',masa:'Masa térmica',cubierta:'Cubiertas',forma:'Forma'};
  const co = {ventilacion:'#3B8BD4',sombreado:'#EF9F27',masa:'#D85A30',cubierta:'#1D9E75',forma:'#888780'};
  document.getElementById('sfilt').innerHTML = cats.map(c =>
    `<button class="fb${sfil===c?' on':''}" onclick="setSF('${c}')">${cl[c]}</button>`).join('');
  const list = sfil==='todos' ? STRATS : STRATS.filter(s => s.cat===sfil);
  document.getElementById('sgrid').innerHTML = list.map(s => `
    <div class="sc">
      <div class="sc-hdr" style="background:${(co[s.cat]||'#888888')}22">${s.icon}</div>
      <div class="sc-body"><h3>${s.name}</h3><p>${s.desc}</p>${s.tags.map(t=>`<span class="stag">${t}</span>`).join('')}</div>
    </div>`).join('');
}
function setSF(c) { sfil=c; renderStrats(); }

/* ══════════════════════════════════════
   MATERIALES
══════════════════════════════════════ */
function renderMats() {
  const fl=['todos','muros','cubiertas','aberturas'];
  const fl2={todos:'Todos',muros:'Muros',cubiertas:'Cubiertas',aberturas:'Aberturas'};
  // Info box (only insert once)
  if (!document.getElementById('mat-info-box')) {
    const box = document.createElement('div');
    box.id = 'mat-info-box';
    box.className = 'mat-info';
    box.innerHTML = `<strong>Masa térmica:</strong> capacidad de absorber y almacenar calor (retarda el pico térmico 6–10 hs). Alta en ladrillo, hormigón, adobe. &nbsp;|&nbsp; <strong>Aislamiento:</strong> resistencia a la transmisión de calor (λ bajo = mejor aislante). Un buen diseño combina <em>masa + aislación</em> según la zona.`;
    document.getElementById('mfilt').before(box);
  }
  document.getElementById('mfilt').innerHTML = fl.map(f =>
    `<button class="fb${mfil===f?' on':''}" onclick="setMF('${f}')">${fl2[f]}</button>`).join('');
  const kw = {muros:['Ladrillo','Adobe','Bloque','Madera','bambú','yeso','fardo','paja','Tierra','PET','suelo'],cubiertas:['Chapa','Membrana','Poliestireno','Lana','verde','policarbonato'],aberturas:['Vidrio','DVH']};
  const list = mfil==='todos' ? MATS : MATS.filter(m => kw[mfil]?.some(k => m.name.toLowerCase().includes(k.toLowerCase())));
  document.getElementById('mbody').innerHTML = list.map(m => `
    <tr>
      <td style="font-weight:500">${m.name}</td>
      <td>${m.lam}</td>
      <td><div class="brow"><div class="btr"><div class="bfill" style="width:${m.mv}%;background:${m.col}"></div></div><span class="blbl">${m.masa}</span></div></td>
      <td><div class="brow"><div class="btr"><div class="bfill" style="width:${m.av}%;background:#3B8BD4"></div></div><span class="blbl">${m.ais}</span></div></td>
      <td style="font-size:11px;color:#888">${m.zon}</td>
    </tr>`).join('');
}
function setMF(f) { mfil=f; renderMats(); }

/* ══════════════════════════════════════
   PLANTAS
══════════════════════════════════════ */
function renderPlantas() {
  const cats = ['todos','arbol','arbusto','palmera','enredadera','helecho','cactus','hierba','acuatica'];
  const cl = {todos:'Todas',arbol:'Árboles',arbusto:'Arbustos',palmera:'Palmeras',enredadera:'Enredaderas',helecho:'Helechos',cactus:'Cactus',hierba:'Hierbas',acuatica:'Acuáticas'};
  document.getElementById('pcfilt').innerHTML = cats.map(c =>
    `<button class="fb${pcfil===c?' on':''}" onclick="setPC('${c}')">${cl[c]}</button>`).join('');
  let list = ufil==='todos' ? PLANTAS : ufil==='ambos' ? PLANTAS.filter(p=>p.uso==='ambos') : PLANTAS.filter(p=>p.uso===ufil||p.uso==='ambos');
  if (pcfil !== 'todos') list = list.filter(p => p.cat===pcfil);
  const bc = {exterior:'bext', interior:'bint', ambos:'bamb'};
  document.getElementById('pgrid').innerHTML = list.map(p => `
    <div class="pc">
      <div class="pc-ilus" style="background:${p.bg}">${p.il()}<span class="pbdg ${bc[p.uso]}">${p.bt}</span></div>
      <div class="pc-info">
        <h3>${p.nombre}</h3>
        <div class="pci">${p.ci}</div>
        <p>${p.desc}</p>
        ${p.at.map(a=>`<div class="arow"><span class="aico">${a.i}</span><span class="atxt">${a.t}</span></div>`).join('')}
        <div style="margin-top:6px">${p.us.map(u=>`<span class="uchip">${u}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}
function setPC(c) { pcfil=c; renderPlantas(); }
function setUso(v, btn) {
  ufil=v;
  document.querySelectorAll('.ub').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderPlantas();
}

/* ══════════════════════════════════════
   HERRAMIENTAS
══════════════════════════════════════ */

/* ── MATERIAL CONSTANTS for TC ── */
const TC_MATS = [
  { name:'Ladrillo cerámico hueco',   lam:0.41 },
  { name:'Ladrillo macizo cocido',    lam:0.70 },
  { name:'Hormigón armado',           lam:1.63 },
  { name:'Adobe estabilizado',        lam:0.52 },
  { name:'Bloque de hormigón',        lam:0.79 },
  { name:'Madera nativa',             lam:0.14 },
  { name:'Panel de bambú',            lam:0.17 },
  { name:'Placa yeso-cartón',         lam:0.25 },
  { name:'Poliestireno expandido EPS',lam:0.04 },
  { name:'Lana de roca',              lam:0.036},
  { name:'Chapa zinc',                lam:50.0 },
  { name:'Membrana asfáltica',        lam:0.17 },
  { name:'Mortero de cemento',        lam:0.72 },
  { name:'Fardo de paja',             lam:0.07 },
  { name:'Tierra compactada',         lam:0.65 },
  { name:'Piedra basáltica',          lam:1.40 },
  { name:'Policarbonato alveolar',    lam:0.22 },
  { name:'Revoque de barro',          lam:0.52 },
  { name:'Aire (cámara 5+ cm)',       lam:0.17 },
];

function tcInit() {
  const container = document.getElementById('tc-layers');
  if (!container) return;
  container.innerHTML = '';
  tcAddLayer();
  tcAddLayer();
}

function tcAddLayer() {
  const container = document.getElementById('tc-layers');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'tc-capa';
  const idx = container.children.length;
  div.innerHTML = `
    <select onchange="tcCalc()">
      ${TC_MATS.map(m => `<option value="${m.lam}">${m.name}</option>`).join('')}
    </select>
    <input type="number" value="${idx===0?15:idx===1?5:5}" min="1" max="80" oninput="tcCalc()">
    <span class="tc-esp">cm</span>
    <span class="tc-del" onclick="this.parentElement.remove();tcCalc()">×</span>`;
  container.appendChild(div);
  tcCalc();
}

function tcCalc() {
  const capas = document.querySelectorAll('.tc-capa');
  let rTotal = 0.13 + 0.04; // Rsi + Rse
  capas.forEach(c => {
    const lam = parseFloat(c.querySelector('select').value);
    const esp = parseFloat(c.querySelector('input').value) / 100;
    rTotal += esp / lam;
  });
  const u = rTotal > 0 ? (1 / rTotal).toFixed(3) : '—';
  document.getElementById('tc-r').textContent = rTotal.toFixed(2);
  document.getElementById('tc-u').textContent = u;

  const v = document.getElementById('tc-veredict');
  if (rTotal < 0.5) {
    v.innerHTML = '⚠️ <strong>Muy baja resistencia.</strong> Sin aislar. Transmite demasiado calor.';
    v.style.background = '#fde8e8'; v.style.color = '#7a0000';
  } else if (rTotal < 1.5) {
    v.innerHTML = '🔶 <strong>Aislación insuficiente.</strong> Necesitás más capa aislante o cambiar materiales.';
    v.style.background = '#fff0d6'; v.style.color = '#7a4000';
  } else if (rTotal < 3.0) {
    v.innerHTML = '✅ <strong>Aislación aceptable.</strong> Cumple estándares básicos para la zona.';
    v.style.background = '#e2f0d6'; v.style.color = '#2a5e0a';
  } else {
    v.innerHTML = '🌟 <strong>Excelente aislación térmica.</strong> Ideal para cubiertas o muros en Chaco.';
    v.style.background = '#d6eaf8'; v.style.color = '#0d4480';
  }
}

/* ── RAINWATER ── */
function calcRainwater() {
  const zona = document.getElementById('hc-zona').value;
  const area = parseFloat(document.getElementById('hc-area').value) || 0;
  const coef = parseFloat(document.getElementById('hc-coef').value) || 0;
  const lluviaAnual = { subtropical:1400, chaco:800, misionero:1900, transicion:1400 };
  const mm = lluviaAnual[zona] || 1400;
  const litros = area * mm * coef;
  const m3 = litros / 1000;
  const famSize = 4;
  const consumoDiario = famSize * 150; // L/día para 4 personas
  const diasCobertura = litros / consumoDiario;
  const el = document.getElementById('hc-result');
  el.innerHTML = `
    <strong>${litros.toLocaleString()}</strong> L/año <span style="color:var(--on-surface-variant,#44474a)">≈ ${m3.toFixed(1)} m³</span><br>
    <span style="font-size:11px">Precipitación: ${mm} mm/año · Coeficiente: ${coef} · Superficie: ${area} m²</span><br>
    <span style="font-size:11px">🚿 Cobertura para ${famSize} personas: <strong>${diasCobertura.toFixed(0)} días/año</strong> (${(diasCobertura/365*100).toFixed(0)}% del año)</span>
    ${diasCobertura > 300 ? '<br><span style="color:#2a5e0a;font-size:11px">💧 Podés ser autosuficiente en agua con este sistema.</span>' : ''}
    ${diasCobertura < 60 ? '<br><span style="color:#7a4000;font-size:11px">☀️ Usá para riego de jardín o como respaldo.</span>' : ''}
  `;
}

/* ── COMPARADOR ── */
function zcInit() {
  const body = document.getElementById('zc-body');
  if (!body) return;
  body.innerHTML = `
    <div class="zc-picker">
      <select id="zc-a" onchange="zcRender()">
        ${ZONES.map((z,i) => `<option value="${i}">${z.name}</option>`).join('')}
      </select>
      <select id="zc-b" onchange="zcRender()">
        ${ZONES.map((z,i) => `<option value="${i}" ${i===1?'selected':''}>${z.name}</option>`).join('')}
      </select>
    </div>
    <div class="zc-col" id="zc-cola"></div>
    <div class="zc-col" id="zc-colb"></div>
    <div class="zc-diff" id="zc-diff"></div>
    <div class="zc-season" id="zc-season"></div>`;
  zcRender();
}

function zcRender() {
  const ia = parseInt(document.getElementById('zc-a').value);
  const ib = parseInt(document.getElementById('zc-b').value);
  if (ia === ib) {
    document.getElementById('zc-diff').textContent = '📌 Seleccioná dos zonas diferentes para comparar.';
    document.getElementById('zc-cola').innerHTML = renderZcCol(ZONES[ia]);
    document.getElementById('zc-colb').innerHTML = '';
    document.getElementById('zc-season').innerHTML = '';
    return;
  }
  const a = ZONES[ia], b = ZONES[ib];
  document.getElementById('zc-cola').innerHTML = renderZcCol(a);
  document.getElementById('zc-colb').innerHTML = renderZcCol(b);
  document.getElementById('zc-diff').innerHTML = `↔ ${a.name} vs ${b.name} — ${a.reto.split('+')[0].trim()} · ${b.reto.split('+')[0].trim()}`;
  document.getElementById('zc-season').innerHTML = `
    <h5>Estaciones comparadas</h5>
    <div class="zc-sgrid">
      ${['verano','otono','invierno','primavera'].map(k => `
        <div class="zc-sitem">
          <span>${a.estaciones[k].icon}</span>
          <div><strong>${a.estaciones[k].meses}</strong>: ${a.estaciones[k].tmp} / ${b.estaciones[k].tmp}</div>
        </div>`).join('')}
    </div>`;
}

function renderZcCol(z) {
  return `
    <h4 style="color:${z.color};border-color:${z.color}">${z.name}</h4>
    <div class="zc-stat"><span class="lbl">Región</span><span class="val">${z.region}</span></div>
    <div class="zc-stat"><span class="lbl">Temperatura</span><span class="val">${z.temp}</span></div>
    <div class="zc-stat"><span class="lbl">Humedad</span><span class="val">${z.hum}</span></div>
    <div class="zc-stat"><span class="lbl">Lluvia</span><span class="val">${z.lluvia}</span></div>
    <div class="zc-stat"><span class="lbl">Viento</span><span class="val">${z.viento}</span></div>
    <div class="zc-stat"><span class="lbl">Reto</span><span class="val">${z.reto}</span></div>
    <div class="zc-tags">${(z.tags||[]).map(t => `<span class="zc-tag">${t}</span>`).join('')}</div>`;
}

/* ── HERRAMIENTAS INIT ── */
function initHerramientas() {
  tcInit();
  calcRainwater();
  zcInit();
  eaveInit();
  renderStratMatrix();
  achInit();
  dewInit();
}
function initGuia() {
  renderDesignPrinciples();
  renderFAQ();
}

/* ══════════════════════════════════════
   CALCULADORA DE ALERO
══════════════════════════════════════ */
function calcEave() {
  const lat = -25;
  const wh = parseFloat(document.getElementById('eave-wh').value) || 200;
  const sh = parseFloat(document.getElementById('eave-sh').value) || 20;
  const wd = parseFloat(document.getElementById('eave-wd').value) || 15;
  const latRad = lat * Math.PI / 180;

  const decSummer = -23.5 * Math.PI / 180;
  const decWinter = 23.5 * Math.PI / 180;

  function noonAlt(dec) {
    return Math.PI/2 - Math.abs(latRad - dec);
  }

  const altSummer = noonAlt(decSummer) * 180 / Math.PI;
  const altWinter = noonAlt(decWinter) * 180 / Math.PI;

  const tanS = Math.tan(altSummer * Math.PI / 180);
  const tanW = Math.tan(altWinter * Math.PI / 180);

  const eaveOpt = (wh - sh) / tanS;
  const eaveMax = (wh - sh) / tanW;
  const eaveMin = wh / tanS;

  const eaveRec = Math.round(Math.max(eaveOpt, Math.min(eaveMin, 80)));

  const el = document.getElementById('eave-result');
  el.innerHTML = `
    <div class="eave-numbers">
      <div class="eave-num">
        <span class="eave-val">${eaveRec} cm</span>
        <span class="eave-lbl">Voladizo recomendado</span>
      </div>
      <div class="eave-num">
        <span class="eave-val">${eaveOpt.toFixed(0)} cm</span>
        <span class="eave-lbl">Mín. para sombra jul</span>
      </div>
      <div class="eave-num">
        <span class="eave-val">${eaveMin.toFixed(0)} cm</span>
        <span class="eave-lbl">Máx. para sol jun</span>
      </div>
    </div>
    <div class="eave-chart">
      <svg viewBox="0 0 280 140" style="width:100%;max-width:280px;height:auto;display:block;margin:0 auto">
        <rect x="100" y="20" width="140" height="100" fill="var(--surface-container-low, #f3f4f5)" stroke="var(--outline-variant, #c5c6ca)" stroke-width="0.8"/>
        <rect x="100" y="20" width="140" height="10" fill="#D85A30"/>
        <line x1="100" y1="60" x2="240" y2="60" stroke="var(--outline, #75777a)" stroke-width="0.5" stroke-dasharray="3,2"/>
        <text x="155" y="58" style="font-size:7px;fill:var(--on-surface-variant, #44474a);text-anchor:middle">Ventana ${wh} cm</text>
        <line x1="100" y1="30" x2="100" y2="120" stroke="var(--outline-variant, #c5c6ca)" stroke-width="0.8"/>
        <line x1="145" y1="50" x2="145" y2="120" stroke="var(--primary, #000101)" stroke-width="1.5"/>
        <text x="122" y="130" style="font-size:8px;fill:var(--primary, #000101);text-anchor:middle;font-weight:600">Alero ${eaveRec} cm</text>
        <text x="250" y="90" style="font-size:8px;fill:#EF9F27;text-anchor:start">Verano ${altSummer.toFixed(0)}°</text>
        <text x="250" y="105" style="font-size:8px;fill:#3B8BD4;text-anchor:start">Invierno ${altWinter.toFixed(0)}°</text>
        <line x1="100" y1="120" x2="100" y2="128" stroke="var(--outline-variant, #c5c6ca)" stroke-width="0.8"/>
        <line x1="145" y1="120" x2="145" y2="128" stroke="var(--primary, #000101)" stroke-width="1.5"/>
      </svg>
    </div>
    <div class="eave-tip">
      💡 Para ventana de ${wh} cm de alto con antepecho de ${sh} cm en latitud 25°S:
      un voladizo de <strong>${eaveRec} cm</strong> bloquea el sol de verano (${altSummer.toFixed(0)}°)
      y permite el de invierno (${altWinter.toFixed(0)}°).
      ${eaveRec < 40 ? ' Considerá aumentar la altura de la ventana o usar protección vegetal adicional.' : ''}
      ${eaveRec > 100 ? ' El voladizo es muy largo — usá pérgola o celosía horizontal como complemento.' : ''}
    </div>`;
}

function eaveInit() {
  calcEave();
}

/* ══════════════════════════════════════
   GLOSARIO
══════════════════════════════════════ */
function toggleGlossary() {
  const panel = document.getElementById('glossary-panel');
  const overlay = document.getElementById('glossary-overlay');
  if (!panel) return;
  const open = panel.classList.toggle('open');
  overlay.classList.toggle('visible', open);
  if (open) renderGlossary();
}
function closeGlossary() {
  const panel = document.getElementById('glossary-panel');
  const overlay = document.getElementById('glossary-overlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
}
function renderGlossary() {
  const el = document.getElementById('glossary-list');
  if (!el) return;
  el.innerHTML = GLOSSARY.map(g => `
    <div class="gl-item">
      <div class="gl-term">${g.term}</div>
      <div class="gl-def">${g.def}</div>
    </div>`).join('');
}

/* ══════════════════════════════════════
   MATRIZ ESTRATEGIAS × ZONAS
══════════════════════════════════════ */
function renderStratMatrix() {
  const el = document.getElementById('strat-matrix');
  if (!el) return;
  const zoneIds = ZONES.map(z => z.id);
  const zoneNames = ZONES.map(z => z.name);
  const strategies = STRATS;
  const compat = {
    subtropical: ['ventilacion','sombreado','masa','cubierta','forma'],
    chaco: ['masa','ventilacion','cubierta','forma','sombreado'],
    misionero: ['ventilacion','cubierta','sombreado','forma','masa'],
    transicion: ['ventilacion','masa','sombreado','cubierta','forma'],
  };

  const catIcons = { ventilacion:'🌬️', sombreado:'☀️', masa:'🧱', cubierta:'🏠', forma:'📐' };

  let html = `<table class="sm-table"><thead><tr><th>Estrategia</th>${zoneNames.map(n => `<th>${n}</th>`).join('')}</tr></thead><tbody>`;
  strategies.forEach(s => {
    const cat = s.cat;
    html += `<tr><td><span class="sm-icon">${s.icon}</span> ${s.name}</td>`;
    zoneIds.forEach((zid, zi) => {
      const applicable = s.tags.some(t => t === 'Todas las zonas' || t === ZONES[zi].name || t === ZONES[zi].id || t.slice(0,3).toLowerCase() === zid.slice(0,3).toLowerCase());
      html += applicable
        ? `<td class="sm-yes" title="Aplicable en ${ZONES[zi].name}">✅</td>`
        : `<td class="sm-no" title="No prioritario en ${ZONES[zi].name}">—</td>`;
    });
    html += `</tr>`;
  });
  html += '</tbody></table>';
  html += `<div class="sm-legend">✅ Aplicable · — No prioritario · Evalúa según condiciones específicas del lote</div>`;
  el.innerHTML = html;
}

/* ══════════════════════════════════════
   PRINCIPIOS DE DISEÑO
══════════════════════════════════════ */
function renderDesignPrinciples() {
  const el = document.getElementById('principles-grid');
  if (!el) return;
  const vbx=800,vby=440;
  const gx=260,gx2=540,gy=340,py=90,px=400;
  const eveX=180,wwY=265,wH=55;
  let S = `<svg viewBox="0 0 ${vbx} ${vby}" style="width:100%;max-width:800px;height:auto;display:block;margin:0 auto 20px;border:1px solid var(--outline-variant,#c5c6ca);background:linear-gradient(to bottom, #f9fbfd, #ffffff)">
  <defs>
    <marker id="arrS" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#EF9F27"/></marker>
    <marker id="arrW" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#3B8BD4"/></marker>
    <marker id="arrV" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#2ecc71"/></marker>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ebf4fa" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#eae6df"/>
      <stop offset="100%" stop-color="#fdfcf7"/>
    </linearGradient>
    <pattern id="roofTiles" width="20" height="10" patternUnits="userSpaceOnUse">
      <path d="M 0 10 Q 10 5 20 10" fill="none" stroke="#a03020" stroke-width="0.8"/>
    </pattern>
    <style>
      @keyframes windflow { to { stroke-dashoffset: -20; } }
      .wind-line { stroke-dasharray: 6, 4; animation: windflow 1.2s linear infinite; }
      .wind-line-slow { stroke-dasharray: 5, 5; animation: windflow 2s linear infinite; }
      .g-el { transition: all 0.3s ease; }
      .g-el:hover { filter: drop-shadow(0 2px 4px rgba(44,62,80,0.15)); }
      .g-interactive { transition: all 0.2s ease; cursor: pointer; }
      .g-interactive:hover { filter: saturate(1.4) drop-shadow(0 0 5px rgba(239,159,39,0.5)); opacity: 1 !important; }
    </style>
  </defs>

  <!-- Sky gradient -->
  <rect x="0" y="0" width="800" height="${gy}" fill="url(#skyGrad)"/>

  <!-- Ground -->
  <rect x="0" y="${gy}" width="800" height="100" fill="#e2dacc" stroke="#cbbca6" stroke-width="0.5"/>
  <rect x="0" y="${gy+4}" width="800" height="96" fill="#d0c4b2"/>
  <path d="M0 ${gy} Q200 ${gy-4} 400 ${gy} Q600 ${gy+4} 800 ${gy}" fill="none" stroke="#b2a490" stroke-width="1.5"/>

  <!-- Foundations (underground structural concrete detail) -->
  <g class="g-el" opacity="0.85">
    <rect x="${gx-10}" y="${gy}" width="20" height="22" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="0.8"/>
    <rect x="${gx2-10}" y="${gy}" width="20" height="22" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="0.8"/>
    <line x1="${gx-10}" y1="${gy+8}" x2="${gx+10}" y2="${gy+8}" stroke="#7f8c8d" stroke-width="0.5"/>
    <line x1="${gx2-10}" y1="${gy+8}" x2="${gx2+10}" y2="${gy+8}" stroke="#7f8c8d" stroke-width="0.5"/>
  </g>

  <!-- House Wall & Slab Fill -->
  <polygon class="g-el" points="${gx},${gy} ${gx},${py} ${gx2},${py} ${gx2},${gy}" fill="url(#wallGrad)" stroke="#2c3e50" stroke-width="1.2"/>

  <!-- Roof structure with tile pattern -->
  <polygon class="g-el" points="${gx-10},${py} ${px},${py-50} ${gx2+10},${py}" fill="#d35400" stroke="#a03020" stroke-width="1.2"/>
  <polygon class="g-el" points="${gx-8},${py} ${px},${py-47} ${gx2+8},${py}" fill="url(#roofTiles)" opacity="0.35"/>

  <!-- Roof Beam/Truss structure -->
  <line x1="${gx}" y1="${py}" x2="${gx2}" y2="${py}" stroke="#2c3e50" stroke-width="1.5"/>
  <line x1="${px}" y1="${py-50}" x2="${px}" y2="${py}" stroke="#2c3e50" stroke-width="0.8" stroke-dasharray="2,2"/>

  <!-- Eave (Alero) -->
  <g class="g-interactive" opacity="0.95">
    <polygon points="${gx},${py} ${eveX},${py+10} ${eveX},${py+18} ${gx},${py+8}" fill="#d35400" stroke="#a03020" stroke-width="1"/>
    <line x1="${eveX}" y1="${py+10}" x2="${eveX}" y2="${py+18}" stroke="#a03020" stroke-width="1"/>
    <text x="${eveX+6}" y="${py+32}" style="font-size:10px;font-family:'JetBrains Mono';fill:#a03020;font-weight:700">Alero</text>
  </g>

  <!-- Floor slab (Concrete base) -->
  <rect x="${gx}" y="${gy-8}" width="${gx2-gx}" height="8" fill="#bdc3c7" stroke="#2c3e50" stroke-width="1"/>

  <!-- Insulation indicators (Yellow/orange layered texture in the North wall) -->
  <g class="g-interactive" opacity="0.9">
    <rect x="${gx+8}" y="${py+10}" width="6" height="235" rx="3" fill="#f39c12" stroke="#d35400" stroke-width="0.5"/>
    <text x="${gx+18}" y="${py+60}" style="font-size:8px;font-family:'JetBrains Mono';fill:#d35400;font-weight:700">Aislación Térmica</text>
  </g>

  <!-- Thermal Mass Indicator (floor text/icon) -->
  <g class="g-interactive" opacity="0.85">
    <text x="${px}" y="${gy-14}" style="font-size:10px;font-family:'Hanken Grotesk';fill:#2c3e50;font-weight:700;text-anchor:middle">🧱 Masa Térmica (Suelo y Cimientos)</text>
  </g>

  <!-- North window detail -->
  <g class="g-interactive" opacity="0.95">
    <rect x="${gx-4}" y="${wwY}" width="8" height="${wH}" rx="1" fill="#ebf5fb" stroke="#2980b9" stroke-width="1"/>
    <line x1="${gx}" y1="${wwY}" x2="${gx}" y2="${wwY+wH}" stroke="#2980b9" stroke-width="0.8"/>
    <line x1="${gx-4}" y1="${wwY+wH/2}" x2="${gx+4}" y2="${wwY+wH/2}" stroke="#2980b9" stroke-width="0.8"/>
    <text x="${gx+14}" y="${wwY+wH/2}" style="font-size:9px;font-family:'JetBrains Mono';fill:#2980b9;font-weight:700;text-anchor:start">Ventana Norte (Captación)</text>
  </g>

  <!-- South window detail -->
  <g class="g-interactive" opacity="0.9">
    <rect x="${gx2-4}" y="${wwY+10}" width="8" height="34" rx="1" fill="#ebf5fb" stroke="#2980b9" stroke-width="1"/>
    <line x1="${gx2}" y1="${wwY+10}" x2="${gx2}" y2="${wwY+44}" stroke="#2980b9" stroke-width="0.8"/>
    <text x="${gx2-14}" y="${wwY+27}" style="font-size:9px;font-family:'JetBrains Mono';fill:#2980b9;font-weight:700;text-anchor:end">Ventana Sur</text>
  </g>

  <!-- Summer sun radiation -->
  <g class="g-interactive" opacity="0.9">
    <line x1="${eveX-60}" y1="30" x2="${eveX}" y2="${py+10}" stroke="#EF9F27" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrS)"/>
    <line x1="${eveX-50}" y1="20" x2="${eveX+10}" y2="${py+5}" stroke="#EF9F27" stroke-width="1" stroke-dasharray="4,4" opacity=".5"/>
    <line x1="${eveX-70}" y1="40" x2="${eveX-10}" y2="${py+15}" stroke="#EF9F27" stroke-width="1" stroke-dasharray="4,4" opacity=".4"/>
    <text x="${eveX-75}" y="18" style="font-size:11px;font-family:'JetBrains Mono';fill:#EF9F27;font-weight:700">Verano 88° (Bloqueado)</text>
  </g>

  <!-- Winter sun radiation -->
  <g class="g-interactive" opacity="0.9">
    <line x1="10" y1="${py+100}" x2="${gx}" y2="${wwY+25}" stroke="#3B8BD4" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrW)"/>
    <line x1="22" y1="${py+88}" x2="${gx}" y2="${wwY+15}" stroke="#3B8BD4" stroke-width="1" stroke-dasharray="4,4" opacity=".5"/>
    <line x1="-2" y1="${py+112}" x2="${gx-8}" y2="${wwY+35}" stroke="#3B8BD4" stroke-width="1" stroke-dasharray="4,4" opacity=".4"/>
    <text x="14" y="${py+120}" style="font-size:11px;font-family:'JetBrains Mono';fill:#3B8BD4;font-weight:700">Invierno 41° (Ingresa)</text>
  </g>

  <!-- Ventilation arrows (ANIMATED SVG LINES) -->
  <g class="g-interactive" opacity="0.9">
    <!-- Main flow -->
    <path d="M ${gx-30} ${wwY+25} Q ${gx+40} ${wwY-15} ${px} ${wwY+15} T ${gx2+30} ${wwY+25}" stroke="#2ecc71" stroke-width="2.2" fill="none" class="wind-line" marker-end="url(#arrV)"/>
    <!-- Secondary flow -->
    <path d="M ${gx-35} ${wwY+35} Q ${gx+30} ${gy-20} ${px} ${gy-30} T ${gx2+35} ${wwY+30}" stroke="#2ecc71" stroke-width="1.5" fill="none" class="wind-line-slow" opacity="0.6" marker-end="url(#arrV)"/>
    
    <text x="${px}" y="${wwY-3}" style="font-size:10px;font-family:'Hanken Grotesk';fill:#27ae60;font-weight:700;text-anchor:middle">🌬️ Ventilación Cruzada Natural</text>
  </g>

  <!-- Tree (deciduous north side) -->
  <g class="g-interactive" opacity="0.95">
    <rect x="140" y="${gy-20}" width="8" height="20" fill="#78341a"/>
    <circle cx="144" cy="${gy-42}" r="22" fill="#27ae60" opacity=".8"/>
    <circle cx="132" cy="${gy-34}" r="16" fill="#2ecc71" opacity=".7"/>
    <circle cx="156" cy="${gy-34}" r="16" fill="#1e824c" opacity=".7"/>
    <text x="144" y="${gy-70}" style="font-size:9px;font-family:'JetBrains Mono';fill:#27ae60;font-weight:700;text-anchor:middle">Caducifolio</text>
    <text x="144" y="${gy-60}" style="font-size:7.5px;font-family:'Hanken Grotesk';fill:#7f8c8d;text-anchor:middle">Sombra en verano / Sol en invierno</text>
  </g>

  <!-- North indicator -->
  <text x="20" y="32" style="font-size:11px;font-family:'JetBrains Mono';fill:#2c3e50;font-weight:700">Norte ←</text>
</svg>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;padding:0 2px">`;
  DESIGN_PRINCIPLES.forEach(p => {
    S += `<div style="display:flex;gap:6px;padding:8px;background:var(--surface-container-low,#f3f4f5);border:1px solid var(--outline-variant,#c5c6ca);align-items:flex-start">
      <span style="font-size:16px;flex-shrink:0;margin-top:1px">${p.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:10px;font-weight:600;margin-bottom:2px;color:var(--on-surface,#191c1d)">${p.title}</div>
        <div style="font-size:9px;color:var(--on-surface-variant,#44474a);line-height:1.5">${p.desc}</div>
        <div style="font-size:8px;color:var(--outline,#75777a);margin-top:3px;padding-top:3px;border-top:1px solid var(--outline-variant,#c5c6ca);font-style:italic;line-height:1.4">💡 ${p.why}</div>
      </div>
    </div>`;
  });
  S += '</div>';
  el.innerHTML = S;
}

/* ══════════════════════════════════════
   CIUDADES (in zona detail)
══════════════════════════════════════ */
function renderCities(zid) {
  const cities = CITIES[zid];
  if (!cities) return '';
  return `<div class="zcities" style="margin-top:12px">
    <h4 style="font-size:10px;font-weight:600;margin-bottom:6px;color:var(--on-surface-variant,#44474a);text-transform:uppercase;letter-spacing:0.3px">🌆 Datos por ciudad</h4>
    <div class="zcities-grid">
      ${cities.map(c => `
        <div class="zcities-card">
          <strong>${c.name}</strong>
          <span style="display:block;font-size:10px;color:var(--on-surface-variant,#44474a);margin:4px 0">${c.temp} · ${c.hum}</span>
          <span style="display:block;font-size:10px;color:var(--on-surface-variant,#44474a)">💧 ${c.lluvia} · 🏔️ ${c.alt} · 💨 ${c.viento}</span>
        </div>`).join('')}
    </div>
  </div>`;
}

/* ══════════════════════════════════════
   ACH — VENTILACIÓN NATURAL
══════════════════════════════════════ */
function calcACH() {
  const area = parseFloat(document.getElementById('ach-area').value) || 80;
  const height = parseFloat(document.getElementById('ach-height').value) || 2.7;
  const winArea = parseFloat(document.getElementById('ach-win').value) || 2;
  const winCount = parseFloat(document.getElementById('ach-win-n').value) || 2;
  const windSpeed = parseFloat(document.getElementById('ach-wind').value) || 2;
  const cd = 0.61;
  const volume = area * height;
  const totalOpening = winArea * winCount;
  const flow = cd * totalOpening * windSpeed;
  const ach = flow * 3600 / volume;
  const el = document.getElementById('ach-result');
  el.innerHTML = `
    <div class="ach-nums">
      <div class="ach-num"><span class="ach-val">${ach.toFixed(1)}</span><span class="ach-lbl">ACH</span></div>
      <div class="ach-num"><span class="ach-val">${flow.toFixed(1)}</span><span class="ach-lbl">m³/s</span></div>
      <div class="ach-num"><span class="ach-val">${volume.toFixed(0)}</span><span class="ach-lbl">m³ (vol.)</span></div>
    </div>
    ${ach < 5 ? '<div class="ach-ver" style="background:#fde8e8;color:#7a0000;padding:8px;border-radius:6px;margin-top:6px;font-size:11px">⚠️ Ventilación <strong>insuficiente</strong>. Necesitás más superficie de abertura o mayor exposición al viento. Mínimo recomendado: 5–10 ACH para clima cálido-húmedo.</div>' :
      ach < 10 ? '<div class="ach-ver" style="background:#fff0d6;color:#7a4000;padding:8px;border-radius:6px;margin-top:6px;font-size:11px">🔶 Ventilación <strong>básica</strong>. Aceptable para espacios secundarios. Para espacios principales buscá 10–15 ACH.</div>' :
      ach < 20 ? '<div class="ach-ver" style="background:#e2f0d6;color:#2a5e0a;padding:8px;border-radius:6px;margin-top:6px;font-size:11px">✅ <strong>Buena ventilación.</strong> Adecuada para clima cálido-húmedo. Renueva el aire cada 3–6 minutos.</div>' :
      '<div class="ach-ver" style="background:#d6eaf8;color:#0d4480;padding:8px;border-radius:6px;margin-top:6px;font-size:11px">🌟 <strong>Excelente ventilación.</strong> Ideal para climas húmedos. Renovación completa cada 1–3 minutos.</div>'}
    <div style="font-size:10px;color:var(--on-surface-variant,#44474a);margin-top:6px;line-height:1.5">
      💡 Fórmula: Q = C<sub>d</sub> × A × v &rarr; ACH = Q × 3600 / V. Coeficiente de descarga C<sub>d</sub> = 0.61 (abertura tipo ventana). Velocidad del viento: ${windSpeed} m/s (${windSpeed < 1 ? 'calma' : windSpeed < 3 ? 'brisa suave' : windSpeed < 5 ? 'brisa moderada' : 'viento fuerte'}).
    </div>`;
}

function achInit() { calcACH(); }

/* ══════════════════════════════════════
   PUNTO DE ROCÍO
══════════════════════════════════════ */
function calcDew() {
  const temp = parseFloat(document.getElementById('dew-temp').value) || 30;
  const rh = parseFloat(document.getElementById('dew-rh').value) || 70;
  const a = 17.27, b = 237.7;
  const f = (a * temp) / (b + temp) + Math.log(rh / 100);
  const dp = (b * f) / (a - f);
  const diff = temp - dp;
  const el = document.getElementById('dew-result');
  let risk, color;
  if (diff < 3) { risk = '⚠️ Alto riesgo de condensación — aislá y ventilá'; color = '#fde8e8'; }
  else if (diff < 6) { risk = '🔶 Riesgo moderado — monitorear en invierno'; color = '#fff0d6'; }
  else { risk = '✅ Bajo riesgo de condensación'; color = '#e2f0d6'; }
  el.innerHTML = `
    <div class="dewnums">
      <div class="dewnum"><span class="dewv">${temp.toFixed(1)}°C</span><span class="dewl">Temperatura</span></div>
      <div class="dewnum"><span class="dewv" style="color:#3B8BD4">${dp.toFixed(1)}°C</span><span class="dewl">Punto de rocío</span></div>
      <div class="dewnum"><span class="dewv">${rh.toFixed(0)}%</span><span class="dewl">Humedad</span></div>
    </div>
    <div style="background:${color};color:var(--on-surface);padding:8px;border-radius:6px;margin-top:6px;font-size:11px">${risk}<br><span style="font-size:10px;opacity:.7">Diferencia temp - punto rocío: <strong>${diff.toFixed(1)}°C</strong>. Si la superficie está por debajo del punto de rocío, se forma condensación.</span></div>
    <div class="dew-bar">
      <div class="dew-fill" style="width:${Math.min(100, diff*10)}%;background:${diff < 3 ? '#e33' : diff < 6 ? '#f90' : '#3B8BD4'}"></div>
    </div>`;
}
function dewInit() { calcDew(); }

/* ══════════════════════════════════════
   SISTEMAS CONSTRUCTIVOS
══════════════════════════════════════ */
let scFil = 'todos';
function renderConstSystems() {
  const cats = ['todos','tierra','albañilería','madera','industrial','natural'];
  const cl = {todos:'Todos',tierra:'Tierra',albañilería:'Albañilería',madera:'Madera',industrial:'Industrial',natural:'Natural'};
  const el = document.getElementById('sc-filt');
  if (el) el.innerHTML = cats.map(c => `<button class="fb${scFil===c?' on':''}" onclick="setSC('${c}')">${cl[c]}</button>`).join('');
  const list = scFil === 'todos' ? CONSTRUCTION_SYSTEMS : CONSTRUCTION_SYSTEMS.filter(s => s.tipo === scFil);
  const grid = document.getElementById('sc-grid');
  if (!grid) return;
  grid.innerHTML = list.map(s => `
    <div class="sc-card">
      <div class="sc-hdr">
        <span class="sc-icon">${s.icon}</span>
        <div>
          <div class="sc-name">${s.name}</div>
          <div class="sc-tipo">${s.tipo} · ${s.region} · ${s.costo}</div>
        </div>
      </div>
      <p class="sc-desc">${s.desc}</p>
      <div class="sc-tech">
        <span class="sc-tag">λ ${s.lambda}</span>
        <span class="sc-tag">${s.masa}</span>
      </div>
      <div class="sc-lists">
        <div class="sc-pros">${s.pros.map(p => `<span>✅ ${p}</span>`).join('')}</div>
        <div class="sc-cons">${s.cons.map(c => `<span>⚠️ ${c}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}
function setSC(c) { scFil = c; renderConstSystems(); }

/* ══════════════════════════════════════
   FAQ
══════════════════════════════════════ */
function renderFAQ() {
  const el = document.getElementById('faq-list');
  if (!el) return;
  el.innerHTML = FAQ.map((f, i) => `
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFAQ(${i})">
        <span>${f.q}</span>
        <span class="faq-arrow">▸</span>
      </div>
      <div class="faq-a" id="faq-${i}">${f.a}</div>
    </div>`).join('');
}
function toggleFAQ(i) {
  const el = document.getElementById('faq-' + i);
  const arrow = el.previousElementSibling.querySelector('.faq-arrow');
  if (!el) return;
  el.classList.toggle('open');
  arrow.textContent = el.classList.contains('open') ? '▾' : '▸';
}

/* ══════════════════════════════════════
   EXPORTAR RESUMEN
══════════════════════════════════════ */
function exportSummary() {
  const win = window.open('', '_blank');
  const theme = currentTheme || 'arq';
  const t = THEMES[theme];
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bioclimática Paraguay — Resumen</title>
    <style>
      body { font-family:'Inter',sans-serif; font-size:12px; color:#1a1a18; max-width:800px; margin:0 auto; padding:20px; line-height:1.6 }
      h1 { font-size:18px; margin-bottom:4px }
      h2 { font-size:14px; margin:16px 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px }
      h3 { font-size:12px; margin:10px 0 4px }
      p { margin:0 0 8px;color:#444 }
      .z { display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;margin:2px }
      hr { border:none;border-top:1px solid #eee;margin:12px 0 }
      .f { font-size:10px;color:#888;margin-top:20px }
    </style></head><body>
    <h1>🌿 Bioclimática Paraguay</h1>
    <p>Resumen de recomendaciones · ${new Date().toLocaleDateString()}</p>
    <hr>`);
  const zi = parseInt(document.getElementById('sel-zona')?.value) || 0;
  const z = ZONES.find(x => x.id === (document.getElementById('sel-zona')?.value));
  if (z) {
    win.document.write(`<h2>📍 Zona: ${z.name}</h2><p>${z.desc}</p>`);
    win.document.write(`<div>${z.temp} · ${z.hum} · ${z.lluvia} · ${z.viento}</div>`);
  }
  if (fd.frente) win.document.write(`<h2>🧭 Lote</h2><p>Frente: ${fd.frente} · Tipo: ${fd.tipo || '-'} · Entorno: ${fd.entorno || '-'}</p>`);
  win.document.write(`<h2>📐 Principios clave</h2>`);
  DESIGN_PRINCIPLES.forEach(p => {
    win.document.write(`<h3>${p.icon} ${p.title}</h3><p>${p.desc}</p>`);
  });
  win.document.write(`<hr><div class="f">Generado por Bioclimática Paraguay · Hecho en Paraguay 🇵🇾</div>`);
  win.document.write('</body></html>');
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}

/* ══════════════════════════════════════
   DASHBOARD — bento grid view
══════════════════════════════════════ */
function renderDashboard() {
  const grid = document.getElementById('dash-grid');
  if (!grid) return;
  const zi = parseInt(document.getElementById('sel-zona-sidebar')?.value || '0');
  const zid = document.getElementById('sel-zona-sidebar')?.value || 'subtropical';
  const z = ZONES.find(x => x.id === zid) || ZONES[0];
  const cities = CITIES[zid] || [];

  const lat = -25, lon = -57;
  const decSummer = -23.5, decWinter = 23.5;
  function noonAlt(dec) { return 90 - Math.abs(lat - dec); }
  const altSummer = noonAlt(decSummer);
  const altWinter = noonAlt(decWinter);

  const subtitle = document.getElementById('dash-subtitle');
  if (subtitle) subtitle.textContent = `Perfil bioclimático para ${z.name}. Evaluación de confort térmico, radiación solar y estrategias pasivas recomendadas.`;

  const updateEl = document.getElementById('dash-update');
  if (updateEl) updateEl.textContent = `Actualizado: ${new Date().toLocaleDateString()}`;

  grid.innerHTML = `
    <!-- Site Data -->
    <div class="col-span-12 lg:col-span-4 border border-outline-variant p-6 bg-white flex flex-col justify-between">
      <div>
        <span class="font-caption text-caption uppercase tracking-widest text-on-surface-variant mb-4 block">Datos del sitio</span>
        <div class="space-y-4">
          <div class="flex justify-between items-end border-b border-surface-container py-2"><span class="font-body-main text-on-surface-variant">Zona</span><span class="font-data-label text-data-label">${z.name}</span></div>
          <div class="flex justify-between items-end border-b border-surface-container py-2"><span class="font-body-main text-on-surface-variant">Temperatura</span><span class="font-data-label text-data-label">${z.temp}</span></div>
          <div class="flex justify-between items-end border-b border-surface-container py-2"><span class="font-body-main text-on-surface-variant">Humedad</span><span class="font-data-label text-data-label">${z.hum}</span></div>
          <div class="flex justify-between items-end border-b border-surface-container py-2"><span class="font-body-main text-on-surface-variant">Lluvia anual</span><span class="font-data-label text-data-label">${z.lluvia}</span></div>
          <div class="flex justify-between items-end border-b border-surface-container py-2"><span class="font-body-main text-on-surface-variant">Viento</span><span class="font-data-label text-data-label">${z.viento}</span></div>
          <div class="flex justify-between items-end border-b border-surface-container py-2"><span class="font-body-main text-on-surface-variant">Región</span><span class="font-data-label text-data-label">${z.region}</span></div>
        </div>
      </div>
      <div class="mt-6 pt-4 border-t border-outline-variant">
        <div class="text-secondary font-bold text-headline-md mb-1">${cities.length > 0 ? cities[0].name : z.name}</div>
        <div class="font-caption text-caption uppercase text-on-surface-variant">${z.desc.slice(0, 80)}…</div>
      </div>
    </div>

    <!-- Sun Path -->
    <div class="col-span-12 lg:col-span-8 border border-outline-variant p-6 bg-white overflow-hidden relative">
      <span class="font-caption text-caption uppercase tracking-widest text-on-surface-variant mb-4 block">Trayectoria solar · Latitud ${Math.abs(lat)}°S</span>
      <div class="w-full h-72 flex items-center justify-center relative">
        <svg class="w-full h-full stroke-on-surface-variant fill-none" viewBox="0 0 400 240">
          <path class="stroke-outline-variant" d="M 20 200 Q 200 20 380 200" stroke-dasharray="4" stroke-width="1"/>
          <path class="stroke-secondary" d="M 40 200 Q 200 40 360 200" stroke-width="2"/>
          <path class="stroke-tertiary-container" d="M 70 200 Q 200 80 330 200" stroke-width="1.5"/>
          <circle cx="200" cy="40" fill="#fe6b00" r="6"/>
          <text fill="#a04100" font-family="JetBrains Mono" font-size="10" x="210" y="35">Solsticio verano ${altSummer.toFixed(1)}°</text>
          <text fill="#75777a" font-family="JetBrains Mono" font-size="10" x="210" y="50">Solsticio invierno ${altWinter.toFixed(1)}°</text>
          <line class="stroke-outline" stroke-dasharray="2" stroke-width="0.5" x1="200" x2="200" y1="40" y2="200"/>
          <text fill="#75777a" font-family="JetBrains Mono" font-size="8" x="10" y="215">E</text>
          <text fill="#75777a" font-family="JetBrains Mono" font-size="8" x="385" y="215">W</text>
          <text fill="#75777a" font-family="JetBrains Mono" font-size="8" x="195" y="215">S</text>
          <rect x="100" y="170" width="80" height="30" fill="var(--surface-container,#edeeef)" stroke="var(--outline-variant,#c5c6ca)" stroke-width="0.5"/>
          <text fill="#44474a" font-family="JetBrains Mono" font-size="7" x="115" y="185">Edificio</text>
          <line x1="100" y1="170" x2="50" y2="70" stroke="#fe6b00" stroke-width="1" stroke-dasharray="3,2" opacity="0.6"/>
          <line x1="180" y1="170" x2="240" y2="80" stroke="#2480ff" stroke-width="1" stroke-dasharray="3,2" opacity="0.6"/>
        </svg>
        <div class="absolute bottom-4 right-6 text-right">
          <p class="font-data-label text-data-label">Cenit verano: ${altSummer.toFixed(1)}°</p>
          <p class="font-caption text-caption text-on-surface-variant">Cenit invierno: ${altWinter.toFixed(1)}°</p>
        </div>
      </div>
    </div>

    <!-- Temp Chart -->
    <div class="col-span-12 lg:col-span-8 border border-outline-variant p-6 bg-white">
      <div class="flex justify-between items-center mb-6">
        <span class="font-caption text-caption uppercase tracking-widest text-on-surface-variant">Lluvia mensual (mm)</span>
        <div class="flex gap-4">
          <div class="flex items-center gap-2"><div class="w-3 h-3 bg-secondary-container"></div><span class="font-caption text-caption">Precipitación</span></div>
        </div>
      </div>
      <div class="h-56 grid grid-cols-12 items-end gap-2">
        ${(z.lluviaMensual || [140,145,145,110,90,70,70,70,90,130,140,155]).map((mm, i) => {
          const h = Math.min(100, mm / 2);
          return `<div class="bg-surface-container relative group" style="height:100%">
            <div class="absolute bottom-0 w-full bg-secondary-container transition-all group-hover:opacity-80" style="height:${h}%"></div>
            <div class="absolute bottom-full left-0 right-0 text-center opacity-0 group-hover:opacity-100 font-data-label text-[10px] text-on-surface-variant mb-1">${mm}mm</div>
          </div>`;
        }).join('')}
      </div>
      <div class="grid grid-cols-12 gap-2 mt-2">
        ${['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DEC'].map(m => `<span class="text-center font-data-label text-[10px] text-on-surface-variant">${m}</span>`).join('')}
      </div>
    </div>

    <!-- Wind Rose -->
    <div class="col-span-12 lg:col-span-4 border border-outline-variant p-6 bg-white flex flex-col">
      <span class="font-caption text-caption uppercase tracking-widest text-on-surface-variant mb-4 block">Frecuencia / Dirección del viento</span>
      <div class="flex-1 flex items-center justify-center relative">
        <div class="relative w-48 h-48 rounded-full border border-surface-container flex items-center justify-center">
          <div class="absolute w-full h-px bg-surface-container"></div>
          <div class="absolute h-full w-px bg-surface-container"></div>
          <div class="absolute inset-0 border border-surface-container rounded-full scale-[0.66]"></div>
          <div class="absolute inset-0 border border-surface-container rounded-full scale-[0.33]"></div>
          <svg class="absolute inset-0 w-full h-full fill-tertiary-container/30 stroke-tertiary-container" viewBox="0 0 100 100">
            <polygon points="50,50 55,15 45,15"></polygon>
            <polygon points="50,50 85,45 85,55"></polygon>
            <polygon points="50,50 52,75 48,75"></polygon>
            <polygon points="50,50 15,48 15,52"></polygon>
            <polygon points="50,50 75,25 70,20"></polygon>
          </svg>
          <span class="absolute top-[-20px] font-data-label text-[10px] text-on-surface-variant">N</span>
          <span class="absolute right-[-20px] font-data-label text-[10px] text-on-surface-variant">E</span>
          <span class="absolute bottom-[-20px] font-data-label text-[10px] text-on-surface-variant">S</span>
          <span class="absolute left-[-20px] font-data-label text-[10px] text-on-surface-variant">W</span>
        </div>
      </div>
      <div class="mt-6 pt-4 border-t border-outline-variant">
        <div class="flex justify-between font-data-label text-data-label">
          <span class="text-on-surface-variant">Viento predominante</span>
          <span class="text-tertiary-container font-bold">${z.viento}</span>
        </div>
      </div>
    </div>

    <!-- Cities -->
    <div class="col-span-12 lg:col-span-4 border border-outline-variant p-6 bg-white">
      <span class="font-caption text-caption uppercase tracking-widest text-on-surface-variant mb-4 block">🌆 Ciudades de la zona</span>
      <div class="space-y-3">
        ${cities.length > 0 ? cities.slice(0, 5).map(c => `
          <div class="flex justify-between items-center border-b border-surface-container pb-2">
            <span class="font-body-main text-on-surface font-semibold">${c.name}</span>
            <div class="text-right">
              <span class="font-data-label text-data-label text-on-surface-variant">${c.temp}</span>
              <span class="font-caption text-caption text-on-surface-variant ml-2">${c.hum}</span>
            </div>
          </div>`).join('') : '<span class="font-caption text-caption text-on-surface-variant">Sin datos por ciudad</span>'}
      </div>
    </div>

    <!-- Estrategias recomendadas -->
    <div class="col-span-12 lg:col-span-8 border border-outline-variant p-6 bg-white">
      <span class="font-caption text-caption uppercase tracking-widest text-on-surface-variant mb-4 block">Estrategias recomendadas para ${z.name}</span>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${STRATS.filter(s => s.tags.some(t => t === 'Todas las zonas' || t === z.name || t === z.id)).slice(0, 6).map(s => `
          <div class="p-4 border border-outline-variant hover:border-secondary transition-all group cursor-pointer" onclick="go('estrategias', document.querySelector('.nav-item[data-panel=estrategias]'))">
            <div class="w-10 h-10 bg-surface flex items-center justify-center mb-3 group-hover:bg-secondary group-hover:text-on-secondary transition-colors text-xl">${s.icon}</div>
            <h3 class="font-body-main font-bold mb-1 uppercase tracking-wide text-sm">${s.name}</h3>
            <p class="font-caption text-on-surface-variant text-xs">${s.desc.slice(0, 70)}…</p>
          </div>`).join('')}
      </div>
    </div>
  `;
}

/* ── LOCALSTORAGE ── */
function savePrefs() {
  try {
    const prefs = {
      theme: currentTheme,
      fontSize: document.querySelector('.font-btn.active')?.textContent?.trim?.() === 'A−' ? -1 :
                document.querySelector('.font-btn.active')?.textContent?.trim?.() === 'A' ? 0 : 1,
    };
    localStorage.setItem('bioclim-py-prefs', JSON.stringify(prefs));
  } catch(e) {}
}
function loadPrefs() {
  try {
    const raw = localStorage.getItem('bioclim-py-prefs');
    if (!raw) return;
    const prefs = JSON.parse(raw);
    if (prefs.theme && THEMES[prefs.theme]) applyTheme(prefs.theme);
    if (prefs.fontSize !== undefined) {
      const btns = document.querySelectorAll('.font-btn');
      const idx = prefs.fontSize + 1;
      if (btns[idx]) btns[idx].click();
    }
  } catch(e) {}
}

/* ══════════════════════════════════════
   INIT — called by index.html on load
══════════════════════════════════════ */
/* Everything is now initialized from index.html DOMContentLoaded */
