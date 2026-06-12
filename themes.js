/* ══════════════════════════════════════
   THEMES.JS — 4 Visual Themes (v3)
══════════════════════════════════════ */

const THEMES = {
  arq: {
    name: 'Helio-Metric',
    emoji: '🌞',
    desc: 'Neutros fríos, naranja solar, precisión técnica',
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
    desc: 'Azul técnico clásico sobre fondo nocturno',
    vars: {
      '--surface': '#0f172a',
      '--surface-dim': '#0a0f1f',
      '--surface-bright': '#1a2340',
      '--surface-container-lowest': '#080c18',
      '--surface-container-low': '#0f172a',
      '--surface-container': '#131d38',
      '--surface-container-high': '#1a2748',
      '--surface-container-highest': '#223258',
      '--on-surface': '#e2e8f0',
      '--on-surface-variant': '#94a3b8',
      '--inverse-surface': '#e2e8f0',
      '--inverse-on-surface': '#0f172a',
      '--outline': '#475569',
      '--outline-variant': 'rgba(100,160,255,0.25)',
      '--surface-tint': '#60a5fa',
      '--primary': '#60a5fa',
      '--on-primary': '#0f172a',
      '--primary-container': '#93c5fd',
      '--on-primary-container': '#0f172a',
      '--inverse-primary': '#1e3a5f',
      '--secondary': '#f59e0b',
      '--on-secondary': '#0f172a',
      '--secondary-container': '#fbbf24',
      '--on-secondary-container': '#422800',
      '--tertiary': '#60a5fa',
      '--on-tertiary': '#0f172a',
      '--tertiary-container': '#93c5fd',
      '--on-tertiary-container': '#0f172a',
      '--error': '#f87171',
      '--on-error': '#0f172a',
      '--error-container': 'rgba(248,113,113,0.2)',
      '--on-error-container': '#f87171',
      '--primary-fixed': '#dbeafe',
      '--primary-fixed-dim': '#93c5fd',
      '--on-primary-fixed': '#0f172a',
      '--on-primary-fixed-variant': '#1e3a5f',
      '--secondary-fixed': '#fef3c7',
      '--secondary-fixed-dim': '#fcd34d',
      '--on-secondary-fixed': '#422800',
      '--on-secondary-fixed-variant': '#422800',
      '--tertiary-fixed': '#dbeafe',
      '--tertiary-fixed-dim': '#93c5fd',
      '--on-tertiary-fixed': '#0f172a',
      '--on-tertiary-fixed-variant': '#1e3a5f',
      '--background': '#0f172a',
      '--on-background': '#e2e8f0',
      '--surface-variant': '#1e293b',
    },
    canvas: {
      bg1:'#0f172a', bg2:'#131d38', ground:'#1a2748',
      grid:'rgba(96,165,250,0.1)', border:'#60a5fa', dim:'#93c5fd',
      shadow:'rgba(0,40,100,0.3)',
    }
  },

  obsidian: {
    name: 'Obsidian',
    emoji: '🌋',
    desc: 'Oscuro cálido, ámbar y carbón — modo nocturno',
    vars: {
      '--surface': '#18181b',
      '--surface-dim': '#101012',
      '--surface-bright': '#222226',
      '--surface-container-lowest': '#0e0e10',
      '--surface-container-low': '#18181b',
      '--surface-container': '#1f1f23',
      '--surface-container-high': '#28282d',
      '--surface-container-highest': '#323238',
      '--on-surface': '#e4e4e7',
      '--on-surface-variant': '#a1a1aa',
      '--inverse-surface': '#e4e4e7',
      '--inverse-on-surface': '#18181b',
      '--outline': '#52525b',
      '--outline-variant': 'rgba(255,180,60,0.2)',
      '--surface-tint': '#f59e0b',
      '--primary': '#f59e0b',
      '--on-primary': '#18181b',
      '--primary-container': '#fbbf24',
      '--on-primary-container': '#422800',
      '--inverse-primary': '#a16207',
      '--secondary': '#22d3ee',
      '--on-secondary': '#18181b',
      '--secondary-container': '#67e8f9',
      '--on-secondary-container': '#164e63',
      '--tertiary': '#f59e0b',
      '--on-tertiary': '#18181b',
      '--tertiary-container': '#fbbf24',
      '--on-tertiary-container': '#422800',
      '--error': '#f87171',
      '--on-error': '#18181b',
      '--error-container': 'rgba(248,113,113,0.2)',
      '--on-error-container': '#fca5a5',
      '--primary-fixed': '#fef3c7',
      '--primary-fixed-dim': '#fcd34d',
      '--on-primary-fixed': '#422800',
      '--on-primary-fixed-variant': '#a16207',
      '--secondary-fixed': '#cffafe',
      '--secondary-fixed-dim': '#67e8f9',
      '--on-secondary-fixed': '#164e63',
      '--on-secondary-fixed-variant': '#155e75',
      '--tertiary-fixed': '#fef3c7',
      '--tertiary-fixed-dim': '#fcd34d',
      '--on-tertiary-fixed': '#422800',
      '--on-tertiary-fixed-variant': '#a16207',
      '--background': '#18181b',
      '--on-background': '#e4e4e7',
      '--surface-variant': '#27272a',
    },
    canvas: {
      bg1:'#101012', bg2:'#18181b', ground:'#1f1f23',
      grid:'rgba(245,158,11,0.08)', border:'#f59e0b', dim:'#fbbf24',
      shadow:'rgba(180,100,0,0.2)',
    }
  },

  terra: {
    name: 'Terra',
    emoji: '🏺',
    desc: 'Tonos tierra, arcilla y oliva — cálido natural',
    vars: {
      '--surface': '#f5f0eb',
      '--surface-dim': '#e0d8d0',
      '--surface-bright': '#faf6f2',
      '--surface-container-lowest': '#faf6f2',
      '--surface-container-low': '#f5f0eb',
      '--surface-container': '#ede5dc',
      '--surface-container-high': '#e5dad0',
      '--surface-container-highest': '#dcd0c4',
      '--on-surface': '#1c1917',
      '--on-surface-variant': '#57534e',
      '--inverse-surface': '#292524',
      '--inverse-on-surface': '#f5f0eb',
      '--outline': '#8a8070',
      '--outline-variant': '#d4c9bc',
      '--surface-tint': '#c4462a',
      '--primary': '#c4462a',
      '--on-primary': '#ffffff',
      '--primary-container': '#e67350',
      '--on-primary-container': '#4a1a0e',
      '--inverse-primary': '#f5a080',
      '--secondary': '#6b7f4e',
      '--on-secondary': '#ffffff',
      '--secondary-container': '#a0b882',
      '--on-secondary-container': '#2a3a18',
      '--tertiary': '#7a5a3a',
      '--on-tertiary': '#ffffff',
      '--tertiary-container': '#c4a080',
      '--on-tertiary-container': '#3a2a1a',
      '--error': '#ba1a1a',
      '--on-error': '#ffffff',
      '--error-container': '#ffdad6',
      '--on-error-container': '#93000a',
      '--primary-fixed': '#ffe0d6',
      '--primary-fixed-dim': '#f5a080',
      '--on-primary-fixed': '#3a1408',
      '--on-primary-fixed-variant': '#8a3018',
      '--secondary-fixed': '#e0f0c8',
      '--secondary-fixed-dim': '#a0b882',
      '--on-secondary-fixed': '#1a2a0e',
      '--on-secondary-fixed-variant': '#4a6040',
      '--tertiary-fixed': '#f0e0d0',
      '--tertiary-fixed-dim': '#c4a080',
      '--on-tertiary-fixed': '#2a1a10',
      '--on-tertiary-fixed-variant': '#5a3c28',
      '--background': '#f5f0eb',
      '--on-background': '#1c1917',
      '--surface-variant': '#e5dad0',
    },
    canvas: {
      bg1:'#ede5dc', bg2:'#e5dad0', ground:'#f5f0eb',
      grid:'rgba(100,80,50,0.06)', border:'#c4462a', dim:'#6b7f4e',
      shadow:'rgba(100,60,30,0.15)',
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