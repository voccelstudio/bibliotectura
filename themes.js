/* ══════════════════════════════════════
   THEMES.JS — 4 Visual Themes
══════════════════════════════════════ */

const THEMES = {
  arq: {
    name: 'Arquitectónico',
    emoji: '📐',
    desc: 'Limpio, técnico, profesional',
    ui: {
      '--bg':        '#ffffff',
      '--bg2':       '#f7f7f5',
      '--bg3':       '#edede9',
      '--text':      '#1a1a18',
      '--text2':     '#5a5a55',
      '--text3':     '#9a9a94',
      '--border':    'rgba(0,0,0,0.08)',
      '--border2':   'rgba(0,0,0,0.15)',
      '--accent':    '#1a1a1a',
      '--accent2':   '#444444',
      '--info-bg':   '#e8f0fb',
      '--info-txt':  '#1a4a90',
      '--nav-bg':    '#ffffff',
      '--nav-border':'rgba(0,0,0,0.08)',
      '--shadow':    '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
    },
    canvas: {
      bg1:'#edf1f7', bg2:'#e2e8f0', ground:'#eef2e8',
      grid:'rgba(0,0,0,0.05)', border:'#1a1a1a', dim:'#1a1a1a',
      shadow:'rgba(80,100,120,0.17)',
    }
  },

  blueprint: {
    name: 'Blueprint',
    emoji: '🔵',
    desc: 'Plano técnico clásico',
    ui: {
      '--bg':        '#0a1628',
      '--bg2':       '#0e1e38',
      '--bg3':       '#132548',
      '--text':      '#c8dcf8',
      '--text2':     '#7aa0d0',
      '--text3':     '#3a6090',
      '--border':    'rgba(100,160,255,0.18)',
      '--border2':   'rgba(100,160,255,0.38)',
      '--accent':    '#4090ff',
      '--accent2':   '#80c0ff',
      '--info-bg':   'rgba(64,144,255,0.15)',
      '--info-txt':  '#80c0ff',
      '--nav-bg':    '#0a1628',
      '--nav-border':'rgba(100,160,255,0.2)',
      '--shadow':    '0 2px 8px rgba(0,0,0,0.4)',
    },
    canvas: {
      bg1:'#071020', bg2:'#0a1628', ground:'#0c1e3a',
      grid:'rgba(80,140,255,0.12)', border:'#4090ff', dim:'#80c0ff',
      shadow:'rgba(0,60,200,0.3)',
    }
  },

  cyberpunk: {
    name: 'Cyberpunk',
    emoji: '⚡',
    desc: 'Neon, dark, futurista',
    ui: {
      '--bg':        '#0d0d14',
      '--bg2':       '#13131e',
      '--bg3':       '#1a1a28',
      '--text':      '#e0e0ff',
      '--text2':     '#9090c0',
      '--text3':     '#5050a0',
      '--border':    'rgba(0,200,255,0.15)',
      '--border2':   'rgba(0,200,255,0.35)',
      '--accent':    '#00c8ff',
      '--accent2':   '#ff0090',
      '--info-bg':   'rgba(0,200,255,0.12)',
      '--info-txt':  '#00c8ff',
      '--nav-bg':    '#0d0d14',
      '--nav-border':'rgba(0,200,255,0.2)',
      '--shadow':    '0 2px 12px rgba(0,200,255,0.15)',
    },
    canvas: {
      bg1:'#080812', bg2:'#0d0d1e', ground:'#0f0f20',
      grid:'rgba(0,200,255,0.08)', border:'#00c8ff', dim:'#00c8ff',
      shadow:'rgba(255,0,144,0.25)',
    }
  },

  paper: {
    name: 'Paper / Sketch',
    emoji: '📄',
    desc: 'Boceto de arquitecto',
    ui: {
      '--bg':        '#f8f4ec',
      '--bg2':       '#f0eadc',
      '--bg3':       '#e8dece',
      '--text':      '#1e1a14',
      '--text2':     '#4a4438',
      '--text3':     '#8a8070',
      '--border':    'rgba(60,50,30,0.14)',
      '--border2':   'rgba(60,50,30,0.26)',
      '--accent':    '#2a2010',
      '--accent2':   '#805020',
      '--info-bg':   'rgba(42,32,16,0.08)',
      '--info-txt':  '#2a2010',
      '--nav-bg':    '#f0eadc',
      '--nav-border':'rgba(60,50,30,0.15)',
      '--shadow':    '0 1px 4px rgba(40,30,10,0.12)',
    },
    canvas: {
      bg1:'#f0ead8', bg2:'#e8e0cc', ground:'#e4dcc8',
      grid:'rgba(60,50,30,0.06)', border:'#2a2010', dim:'#2a2010',
      shadow:'rgba(40,30,10,0.15)',
    }
  },
};

let currentTheme = 'arq';
let currentCanvasTheme = THEMES.arq.canvas;
let themePanelOpen = false;

function applyTheme(themeId) {
  currentTheme = themeId;
  const theme = THEMES[themeId];
  if (!theme) return;
  currentCanvasTheme = theme.canvas;

  const root = document.documentElement;
  Object.entries(theme.ui).forEach(([key, val]) => root.style.setProperty(key, val));

  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === themeId);
  });

  closeThemePanel();
  if (typeof savePrefs === 'function') savePrefs();
}

function buildThemePicker() {
  const container = document.getElementById('theme-picker');
  if (!container) return;
  container.innerHTML = Object.entries(THEMES).map(([id, t]) => `
    <button class="theme-opt${id===currentTheme?' active':''}"
      data-theme="${id}" onclick="applyTheme('${id}')" title="${t.desc}">
      <span class="theme-opt-emoji">${t.emoji}</span>
      <div>
        <div class="theme-opt-name">${t.name}</div>
        <div class="theme-opt-desc">${t.desc}</div>
      </div>
    </button>
  `).join('');
}

function toggleThemePanel() {
  themePanelOpen = !themePanelOpen;
  const panel = document.getElementById('theme-panel');
  const overlay = document.getElementById('theme-overlay');
  if (panel) panel.classList.toggle('open', themePanelOpen);
  if (overlay) overlay.classList.toggle('visible', themePanelOpen);
}

function closeThemePanel() {
  themePanelOpen = false;
  const panel = document.getElementById('theme-panel');
  const overlay = document.getElementById('theme-overlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
}

function setFontSize(scale) {
  const sizes = {'-1':'12px', '0':'14px', '1':'17px'};
  document.documentElement.style.setProperty('--font-size-base', sizes[String(scale)]);
  document.querySelectorAll('.font-btn').forEach((b,i) => {
    b.classList.toggle('active', i-1 === scale);
  });
  if (typeof savePrefs === 'function') savePrefs();
}
