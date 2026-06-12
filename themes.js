/* ══════════════════════════════════════
   THEMES.JS — 4 Visual Themes (v3 Helio-Metric)
══════════════════════════════════════ */

const THEMES = {
  arq: {
    name: 'Helio-Metric',
    emoji: '🌞',
    desc: 'Precisión heliométrica — clean, professional',
    vars: {
      '--surface': '#f8f9fa',
      '--surface-dim': '#d9dadb',
      '--surface-bright': '#f8f9fa',
      '--surface-container-lowest': '#ffffff',
      '--surface-container-low': '#f3f4f5',
      '--surface-container': '#edeeef',
      '--surface-container-high': '#e7e8e9',
      '--surface-container-highest': '#e1e3e4',
      '--on-surface': '#191c1d',
      '--on-surface-variant': '#44474a',
      '--inverse-surface': '#2e3132',
      '--inverse-on-surface': '#f0f1f2',
      '--outline': '#75777a',
      '--outline-variant': '#c5c6ca',
      '--surface-tint': '#5d5e61',
      '--primary': '#000101',
      '--on-primary': '#ffffff',
      '--primary-container': '#1a1c1e',
      '--on-primary-container': '#838486',
      '--inverse-primary': '#c6c6c9',
      '--secondary': '#a04100',
      '--on-secondary': '#ffffff',
      '--secondary-container': '#fe6b00',
      '--on-secondary-container': '#572000',
      '--tertiary': '#000001',
      '--on-tertiary': '#ffffff',
      '--tertiary-container': '#001a41',
      '--on-tertiary-container': '#2480ff',
      '--error': '#ba1a1a',
      '--on-error': '#ffffff',
      '--error-container': '#ffdad6',
      '--on-error-container': '#93000a',
      '--primary-fixed': '#e2e2e5',
      '--primary-fixed-dim': '#c6c6c9',
      '--on-primary-fixed': '#1a1c1e',
      '--on-primary-fixed-variant': '#454749',
      '--secondary-fixed': '#ffdbcc',
      '--secondary-fixed-dim': '#ffb693',
      '--on-secondary-fixed': '#351000',
      '--on-secondary-fixed-variant': '#7a3000',
      '--tertiary-fixed': '#d8e2ff',
      '--tertiary-fixed-dim': '#adc6ff',
      '--on-tertiary-fixed': '#001a41',
      '--on-tertiary-fixed-variant': '#004493',
      '--background': '#f8f9fa',
      '--on-background': '#191c1d',
      '--surface-variant': '#e1e3e4',
    },
    canvas: {
      bg1:'#edf1f7', bg2:'#e2e8f0', ground:'#eef2e8',
      grid:'rgba(0,0,0,0.05)', border:'#000101', dim:'#191c1d',
      shadow:'rgba(80,100,120,0.17)',
    }
  },

  blueprint: {
    name: 'Blueprint',
    emoji: '🔵',
    desc: 'Plano técnico clásico',
    vars: {
      '--surface': '#0a1628',
      '--surface-dim': '#070f1e',
      '--surface-bright': '#121e38',
      '--surface-container-lowest': '#071020',
      '--surface-container-low': '#0a1628',
      '--surface-container': '#0e1e38',
      '--surface-container-high': '#132548',
      '--surface-container-highest': '#182e58',
      '--on-surface': '#c8dcf8',
      '--on-surface-variant': '#7aa0d0',
      '--inverse-surface': '#2e3132',
      '--inverse-on-surface': '#0a1628',
      '--outline': '#3a6090',
      '--outline-variant': 'rgba(100,160,255,0.38)',
      '--surface-tint': '#4090ff',
      '--primary': '#4090ff',
      '--on-primary': '#071020',
      '--primary-container': '#80c0ff',
      '--on-primary-container': '#071020',
      '--inverse-primary': '#c6c6c9',
      '--secondary': '#4090ff',
      '--on-secondary': '#071020',
      '--secondary-container': '#80c0ff',
      '--on-secondary-container': '#071020',
      '--tertiary': '#4090ff',
      '--on-tertiary': '#071020',
      '--tertiary-container': '#80c0ff',
      '--on-tertiary-container': '#071020',
      '--error': '#ff6b6b',
      '--on-error': '#071020',
      '--error-container': 'rgba(255,100,100,0.2)',
      '--on-error-container': '#ff6b6b',
      '--primary-fixed': '#c8dcf8',
      '--primary-fixed-dim': '#7aa0d0',
      '--on-primary-fixed': '#071020',
      '--on-primary-fixed-variant': '#0a1628',
      '--secondary-fixed': '#c8dcf8',
      '--secondary-fixed-dim': '#7aa0d0',
      '--on-secondary-fixed': '#071020',
      '--on-secondary-fixed-variant': '#0a1628',
      '--tertiary-fixed': '#c8dcf8',
      '--tertiary-fixed-dim': '#7aa0d0',
      '--on-tertiary-fixed': '#071020',
      '--on-tertiary-fixed-variant': '#0a1628',
      '--background': '#0a1628',
      '--on-background': '#c8dcf8',
      '--surface-variant': '#0e1e38',
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
    vars: {
      '--surface': '#0d0d14',
      '--surface-dim': '#08080e',
      '--surface-bright': '#12121c',
      '--surface-container-lowest': '#08080e',
      '--surface-container-low': '#0d0d14',
      '--surface-container': '#13131e',
      '--surface-container-high': '#1a1a28',
      '--surface-container-highest': '#222232',
      '--on-surface': '#e0e0ff',
      '--on-surface-variant': '#9090c0',
      '--inverse-surface': '#2e3132',
      '--inverse-on-surface': '#e0e0ff',
      '--outline': '#5050a0',
      '--outline-variant': 'rgba(0,200,255,0.35)',
      '--surface-tint': '#00c8ff',
      '--primary': '#00c8ff',
      '--on-primary': '#0d0d14',
      '--primary-container': '#ff0090',
      '--on-primary-container': '#0d0d14',
      '--inverse-primary': '#c6c6c9',
      '--secondary': '#ff0090',
      '--on-secondary': '#0d0d14',
      '--secondary-container': '#00c8ff',
      '--on-secondary-container': '#0d0d14',
      '--tertiary': '#00c8ff',
      '--on-tertiary': '#0d0d14',
      '--tertiary-container': '#ff0090',
      '--on-tertiary-container': '#0d0d14',
      '--error': '#ff3366',
      '--on-error': '#0d0d14',
      '--error-container': 'rgba(255,0,100,0.2)',
      '--on-error-container': '#ff3366',
      '--primary-fixed': '#e0e0ff',
      '--primary-fixed-dim': '#9090c0',
      '--on-primary-fixed': '#0d0d14',
      '--on-primary-fixed-variant': '#0d0d14',
      '--secondary-fixed': '#e0e0ff',
      '--secondary-fixed-dim': '#9090c0',
      '--on-secondary-fixed': '#0d0d14',
      '--on-secondary-fixed-variant': '#0d0d14',
      '--tertiary-fixed': '#e0e0ff',
      '--tertiary-fixed-dim': '#9090c0',
      '--on-tertiary-fixed': '#0d0d14',
      '--on-tertiary-fixed-variant': '#0d0d14',
      '--background': '#0d0d14',
      '--on-background': '#e0e0ff',
      '--surface-variant': '#13131e',
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
    vars: {
      '--surface': '#f8f4ec',
      '--surface-dim': '#e8e0d0',
      '--surface-bright': '#faf6f0',
      '--surface-container-lowest': '#faf6f0',
      '--surface-container-low': '#f8f4ec',
      '--surface-container': '#f0eadc',
      '--surface-container-high': '#e8dece',
      '--surface-container-highest': '#d8cebc',
      '--on-surface': '#1e1a14',
      '--on-surface-variant': '#4a4438',
      '--inverse-surface': '#2e3132',
      '--inverse-on-surface': '#f8f4ec',
      '--outline': '#8a8070',
      '--outline-variant': 'rgba(60,50,30,0.26)',
      '--surface-tint': '#2a2010',
      '--primary': '#2a2010',
      '--on-primary': '#f8f4ec',
      '--primary-container': '#805020',
      '--on-primary-container': '#f8f4ec',
      '--inverse-primary': '#c6c6c9',
      '--secondary': '#805020',
      '--on-secondary': '#f8f4ec',
      '--secondary-container': '#2a2010',
      '--on-secondary-container': '#f8f4ec',
      '--tertiary': '#2a2010',
      '--on-tertiary': '#f8f4ec',
      '--tertiary-container': '#805020',
      '--on-tertiary-container': '#f8f4ec',
      '--error': '#8a3020',
      '--on-error': '#f8f4ec',
      '--error-container': 'rgba(60,30,20,0.1)',
      '--on-error-container': '#8a3020',
      '--primary-fixed': '#1e1a14',
      '--primary-fixed-dim': '#4a4438',
      '--on-primary-fixed': '#f8f4ec',
      '--on-primary-fixed-variant': '#f8f4ec',
      '--secondary-fixed': '#1e1a14',
      '--secondary-fixed-dim': '#4a4438',
      '--on-secondary-fixed': '#f8f4ec',
      '--on-secondary-fixed-variant': '#f8f4ec',
      '--tertiary-fixed': '#1e1a14',
      '--tertiary-fixed-dim': '#4a4438',
      '--on-tertiary-fixed': '#f8f4ec',
      '--on-tertiary-fixed-variant': '#f8f4ec',
      '--background': '#f8f4ec',
      '--on-background': '#1e1a14',
      '--surface-variant': '#f0eadc',
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
  Object.entries(theme.vars).forEach(([key, val]) => root.style.setProperty(key, val));

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