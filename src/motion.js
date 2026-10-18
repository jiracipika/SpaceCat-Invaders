// Motion (motion.dev) — MIT — DOM-shell animations only (never the canvas render loop).
// The game UI lives in the #overlay div, rebuilt via innerHTML on every screen
// change, so we observe it and animate each new screen in; buttons are wired via
// event delegation so they survive innerHTML replacement.
import { animate, stagger } from 'motion';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function animateScreenIn(overlay) {
  if (prefersReducedMotion()) return;
  if (overlay.style.display === 'none' || overlay.children.length === 0) return;
  const elements = Array.from(overlay.children);
  // Initial hidden state set from JS only, so screens stay visible if this fails.
  elements.forEach((el) => {
    el.style.opacity = '0';
  });
  animate(
    elements,
    { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
    { delay: stagger(0.05), type: 'spring', bounce: 0.25, duration: 0.5 },
  );
}

function initShellMotion() {
  const overlay = document.getElementById('overlay');
  if (!overlay) return;

  const observer = new MutationObserver(() => animateScreenIn(overlay));
  observer.observe(overlay, { childList: true });

  // Hover lift + press springs for overlay buttons (delegated: buttons are
  // recreated whenever the overlay is rebuilt).
  overlay.addEventListener('pointerover', (event) => {
    const button = event.target.closest('button');
    if (!button || prefersReducedMotion()) return;
    if (event.relatedTarget && button.contains(event.relatedTarget)) return;
    animate(button, { y: -2, scale: 1 }, { type: 'spring', bounce: 0.4, duration: 0.3 });
  });
  overlay.addEventListener('pointerout', (event) => {
    const button = event.target.closest('button');
    if (!button || prefersReducedMotion()) return;
    if (event.relatedTarget && button.contains(event.relatedTarget)) return;
    animate(button, { y: 0, scale: 1 }, { type: 'spring', bounce: 0.3, duration: 0.35 });
  });
  overlay.addEventListener('pointerdown', (event) => {
    const button = event.target.closest('button');
    if (!button || prefersReducedMotion()) return;
    animate(button, { scale: 0.96 }, { type: 'spring', bounce: 0.5, duration: 0.25 });
  });
  overlay.addEventListener('pointerup', (event) => {
    const button = event.target.closest('button');
    if (!button || prefersReducedMotion()) return;
    animate(button, { scale: 1 }, { type: 'spring', bounce: 0.4, duration: 0.3 });
  });
}

initShellMotion();
