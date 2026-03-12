import { C } from "../constants/colors";

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function burst({ x, y }) {
  if (typeof document === "undefined") return;

  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.left = "0";
  root.style.top = "0";
  root.style.width = "100vw";
  root.style.height = "100vh";
  root.style.pointerEvents = "none";
  root.style.zIndex = "9999";

  const colors = [C.focus, C.morning, C.afternoon, C.lowEnergy, "#ffffff"];
  const count = 22;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 7;
    const dx = (Math.random() - 0.5) * 240;
    const dy = -80 - Math.random() * 240;
    const rot = (Math.random() - 0.5) * 720;
    const duration = 650 + Math.random() * 450;

    p.style.position = "absolute";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = `${size}px`;
    p.style.height = `${size * (0.6 + Math.random() * 0.6)}px`;
    p.style.background = colors[i % colors.length];
    p.style.borderRadius = "2px";
    p.style.opacity = "0.95";
    p.style.transform = "translate(-50%, -50%)";
    p.style.transition = `transform ${duration}ms cubic-bezier(.2,.8,.2,1), opacity ${duration}ms ease`;

    root.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`;
      p.style.opacity = "0";
    });
  }

  document.body.appendChild(root);
  setTimeout(() => root.remove(), 1300);
}

