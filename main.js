/* ═══════════════════════════════════════════════════════════════
   ARQREF — main.js
   Global JS: storage, toast, modal, nav, cuaderno, proyectos
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Storage helpers ──────────────────────────────────────────── */
const DB = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch { return false; }
  },
  del(key) { try { localStorage.removeItem(key); } catch {} }
};

const KEYS = {
  notas:      'arqref_notas_v1',
  proyectos:  'arqref_proyectos_v1',
  favoritos:  'arqref_favoritos_v1',
};

/* ── Toast ────────────────────────────────────────────────────── */
const Toast = {
  _container: null,
  init() {
    this._container = document.getElementById('toast-container');
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.id = 'toast-container';
      document.body.appendChild(this._container);
    }
  },
  show(msg, type = 'ok', duration = 3000) {
    if (!this._container) this.init();
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'warn' ? ' warn' : type === 'err' ? ' err' : '');
    el.textContent = msg;
    this._container.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 400);
    }, duration);
  }
};

/* ── Modal helper ─────────────────────────────────────────────── */
const Modal = {
  open(id)  { const el = document.getElementById(id); if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; } },
  close(id) { const el = document.getElementById(id); if (el) { el.classList.remove('open'); document.body.style.overflow = ''; } },
  closeAll() { document.querySelectorAll('.modal-overlay.open').forEach(el => { el.classList.remove('open'); }); document.body.style.overflow = ''; }
};

/* ── Nav ──────────────────────────────────────────────────────── */
function initNav() {
  // Mobile toggle
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Active link
  const path = location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && path.includes(href) && href !== '/' && href !== 'index.html') {
      a.classList.add('active');
    }
  });

  // Scroll progress
  const bar = document.getElementById('scroll-bar');
  if (bar) {
    window.addEventListener('scroll', () => {
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  // Close mobile nav on link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => links && links.classList.remove('open'));
  });
}

/* ── Tabs ─────────────────────────────────────────────────────── */
function initTabs(container) {
  const root = container || document;
  root.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const panels = tabGroup.closest('.tabs-root') || tabGroup.parentElement;
        panels.querySelectorAll('.tab-panel').forEach(p => {
          p.classList.toggle('active', p.dataset.panel === target);
        });
      });
    });
  });
}

/* ── Notas por estilo ─────────────────────────────────────────── */
const Notas = {
  getAll() { return DB.get(KEYS.notas, {}); },
  get(estiloId) { return this.getAll()[estiloId] || ''; },
  set(estiloId, texto) {
    const all = this.getAll();
    all[estiloId] = texto;
    DB.set(KEYS.notas, all);
  },
  del(estiloId) {
    const all = this.getAll();
    delete all[estiloId];
    DB.set(KEYS.notas, all);
  }
};

/* ── Favoritos ────────────────────────────────────────────────── */
const Favoritos = {
  getAll() { return DB.get(KEYS.favoritos, []); },
  toggle(id, meta = {}) {
    let favs = this.getAll();
    const idx = favs.findIndex(f => f.id === id);
    if (idx >= 0) {
      favs.splice(idx, 1);
      DB.set(KEYS.favoritos, favs);
      Toast.show('Removido de favoritos');
      return false;
    } else {
      favs.push({ id, ...meta, savedAt: Date.now() });
      DB.set(KEYS.favoritos, favs);
      Toast.show('✓ Guardado en favoritos');
      return true;
    }
  },
  has(id) { return this.getAll().some(f => f.id === id); },
};

/* ── Proyectos ────────────────────────────────────────────────── */
const Proyectos = {
  getAll() { return DB.get(KEYS.proyectos, []); },
  get(id)  { return this.getAll().find(p => p.id === id); },
  create(nombre, tipo = '') {
    const proyectos = this.getAll();
    const nuevo = {
      id: 'p_' + Date.now(),
      nombre,
      tipo,
      createdAt: Date.now(),
      refs: [],           // { tipo, id, nombre, url }
      notas: '',
      paleta: [],         // { hex, nombre }
    };
    proyectos.unshift(nuevo);
    DB.set(KEYS.proyectos, proyectos);
    Toast.show('✓ Proyecto "' + nombre + '" creado');
    return nuevo;
  },
  update(id, changes) {
    const ps = this.getAll();
    const idx = ps.findIndex(p => p.id === id);
    if (idx < 0) return null;
    ps[idx] = { ...ps[idx], ...changes, updatedAt: Date.now() };
    DB.set(KEYS.proyectos, ps);
    return ps[idx];
  },
  delete(id) {
    const ps = this.getAll().filter(p => p.id !== id);
    DB.set(KEYS.proyectos, ps);
    Toast.show('Proyecto eliminado', 'warn');
  },
  addRef(proyectoId, ref) {
    const p = this.get(proyectoId);
    if (!p) return;
    if (!p.refs.find(r => r.id === ref.id)) {
      p.refs.push(ref);
      this.update(proyectoId, { refs: p.refs });
      Toast.show('✓ Referencia agregada al proyecto');
    } else {
      Toast.show('Ya está en este proyecto', 'warn');
    }
  },
  removeRef(proyectoId, refId) {
    const p = this.get(proyectoId);
    if (!p) return;
    p.refs = p.refs.filter(r => r.id !== refId);
    this.update(proyectoId, { refs: p.refs });
  }
};

/* ── Color chip: copiar HEX al clipboard ─────────────────────── */
function initColorChips(root) {
  (root || document).querySelectorAll('.color-chip[data-hex]').forEach(chip => {
    chip.addEventListener('click', () => {
      const hex = chip.dataset.hex;
      navigator.clipboard.writeText(hex)
        .then(() => Toast.show('✓ Copiado: ' + hex))
        .catch(() => {
          // fallback
          const tmp = document.createElement('input');
          tmp.value = hex;
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand('copy');
          tmp.remove();
          Toast.show('✓ Copiado: ' + hex);
        });
    });
  });
}

/* ── Score bars: animar al entrar en viewport ────────────────── */
function initScoreBars(root) {
  const fills = (root || document).querySelectorAll('.score-fill[data-score]');
  if (!fills.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.score + '%';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  fills.forEach(f => { f.style.width = '0%'; observer.observe(f); });
}

/* ── Nota inline por estilo ──────────────────────────────────── */
function initNotaWidget() {
  const widget = document.getElementById('nota-widget');
  if (!widget) return;
  const estiloId = widget.dataset.estilo;
  const textarea = widget.querySelector('.nota-textarea');
  const btnSave  = widget.querySelector('.btn-save-nota');
  const status   = widget.querySelector('.nota-status');
  if (!textarea) return;

  textarea.value = Notas.get(estiloId);

  let timer;
  textarea.addEventListener('input', () => {
    clearTimeout(timer);
    status && (status.textContent = '···');
    timer = setTimeout(() => {
      Notas.set(estiloId, textarea.value);
      status && (status.textContent = '✓ Guardado');
      setTimeout(() => status && (status.textContent = ''), 2000);
    }, 800);
  });

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      Notas.set(estiloId, textarea.value);
      Toast.show('✓ Nota guardada');
    });
  }
}

/* ── Agregar a proyecto (botón en fichas) ────────────────────── */
function initAddToProject() {
  document.querySelectorAll('[data-action="add-to-project"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const refId    = btn.dataset.refId    || '';
      const refTipo  = btn.dataset.refTipo  || 'estilo';
      const refNombre= btn.dataset.refNombre|| '';
      const refUrl   = btn.dataset.refUrl   || location.href;

      const proyectos = Proyectos.getAll();
      if (!proyectos.length) {
        Toast.show('Primero creá un proyecto en el Workspace', 'warn');
        return;
      }

      // Si hay un solo proyecto, agregar directo
      if (proyectos.length === 1) {
        Proyectos.addRef(proyectos[0].id, { id: refId, tipo: refTipo, nombre: refNombre, url: refUrl });
        return;
      }

      // Si hay varios, abrir mini-selector
      showProjectSelector({ refId, refTipo, refNombre, refUrl });
    });
  });
}

function showProjectSelector({ refId, refTipo, refNombre, refUrl }) {
  const existing = document.getElementById('project-selector-modal');
  if (existing) existing.remove();

  const proyectos = Proyectos.getAll();
  const modal = document.createElement('div');
  modal.id = 'project-selector-modal';
  modal.className = 'modal-overlay open';
  modal.innerHTML = `
    <div class="modal" style="max-width:400px;">
      <div class="modal-header">
        <span class="modal-title">Agregar a proyecto</span>
        <button class="modal-close" id="psel-close">✕</button>
      </div>
      <div class="modal-body">
        <p class="text-sm text-muted" style="margin-bottom:16px;">Seleccioná el proyecto para agregar <strong style="color:var(--text-0);">${escHtml(refNombre)}</strong>:</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${proyectos.map(p => `
            <button class="btn btn-ghost w-full" style="justify-content:flex-start;" data-pid="${p.id}">
              <span style="color:var(--accent);">◆</span> ${escHtml(p.nombre)}
              <span class="text-xs text-muted" style="margin-left:auto;">${p.refs.length} refs</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  modal.querySelector('#psel-close').addEventListener('click', () => {
    modal.remove(); document.body.style.overflow = '';
  });
  modal.querySelectorAll('[data-pid]').forEach(btn => {
    btn.addEventListener('click', () => {
      Proyectos.addRef(btn.dataset.pid, { id: refId, tipo: refTipo, nombre: refNombre, url: refUrl });
      modal.remove(); document.body.style.overflow = '';
    });
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; }
  });
}

/* ── Search: filtrado rápido de cards ────────────────────────── */
function initSearch(inputId, cardsSelector) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll(cardsSelector).forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  });
}

/* ── Escape HTML ─────────────────────────────────────────────── */
function escHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
  );
}

/* ── Export / Print ficha ────────────────────────────────────── */
function printFicha() {
  window.print();
}

/* ── Init global ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  initNav();
  initTabs();
  initColorChips();
  initScoreBars();
  initNotaWidget();
  initAddToProject();

  // Modal close on overlay click / ESC
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) Modal.closeAll();
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') Modal.closeAll();
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => Modal.closeAll());
  });
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => Modal.open(btn.dataset.modalOpen));
  });
});

/* ── Exports globales ────────────────────────────────────────── */
window.ARQREF = { DB, KEYS, Toast, Modal, Notas, Favoritos, Proyectos, escHtml, initColorChips, initScoreBars, printFicha };
