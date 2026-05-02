import './style.css';
import { init } from './app.js';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Rotation prompt dismiss
const dismissBtn = document.getElementById('dismissRotate');
if (dismissBtn) {
  dismissBtn.addEventListener('click', () => {
    document.getElementById('rotatePrompt').classList.add('dismissed');
  });
}

// Boot
init();
