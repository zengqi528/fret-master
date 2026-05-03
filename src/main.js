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

// iOS Add to Home Screen Prompt Logic
const iosPrompt = document.getElementById('iosInstallPrompt');
const iosClose = document.getElementById('iosPromptClose');
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};
const isStandalone = () => {
  return ('standalone' in window.navigator) && window.navigator.standalone;
};

if (iosPrompt && iosClose) {
  if (isIos() && !isStandalone() && !localStorage.getItem('iosPromptDismissed')) {
    // Show prompt after a short delay
    setTimeout(() => {
      iosPrompt.classList.add('visible');
    }, 1500);
  }

  iosClose.addEventListener('click', () => {
    iosPrompt.classList.remove('visible');
    localStorage.setItem('iosPromptDismissed', 'true');
  });
}

// Boot
init();
