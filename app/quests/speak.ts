"use client";

let current: HTMLAudioElement | null = null;
let queue: Promise<void> = Promise.resolve();
let isSpeaking = false;
let listeners: Set<() => void> = new Set();
let unlocked = false;

// Auto-register a one-time tap listener to unlock audio on mobile.
// iOS Safari / Chrome mobile block Audio.play() unless triggered by user gesture.
// This runs once on first touch/click anywhere, then removes itself.
if (typeof window !== "undefined") {
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      const a = new Audio();
      a.play().then(() => a.pause()).catch(() => {});
    } catch {}
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("click", unlock);
  };
  window.addEventListener("touchstart", unlock, { once: true });
  window.addEventListener("click", unlock, { once: true });
}

export function speak(key: string): Promise<void> {
  queue = queue.then(() => new Promise<void>((resolve) => {
    if (typeof window === "undefined") { resolve(); return; }
    if (current) { current.pause(); current = null; }
    const a = new Audio(getBasePath() + key);
    current = a;
    isSpeaking = true;
    notifyListeners();
    a.onended = () => { current = null; isSpeaking = false; notifyListeners(); resolve(); };
    a.onerror = () => { current = null; isSpeaking = false; notifyListeners(); resolve(); };
    a.play().catch(() => { isSpeaking = false; notifyListeners(); resolve(); });
  }));
  return queue;
}

export function stopSpeaking(): void {
  if (current) { current.pause(); current = null; }
  isSpeaking = false;
  notifyListeners();
  queue = Promise.resolve();
}

export function getIsSpeaking(): boolean { return isSpeaking; }

export function onSpeakingChange(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(): void { listeners.forEach((cb) => cb()); }

let _basePath: string | null = null;
function getBasePath(): string {
  if (_basePath !== null) return _basePath;
  if (typeof window !== "undefined") {
    const nd = (window as unknown as Record<string, { basePath?: string }>).__NEXT_DATA__;
    _basePath = (nd?.basePath || "") + "/audio/";
  } else {
    _basePath = "/audio/";
  }
  return _basePath;
}
