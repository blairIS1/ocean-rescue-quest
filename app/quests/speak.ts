"use client";

let current: HTMLAudioElement | null = null;
let queue: Promise<void> = Promise.resolve();
let isSpeaking = false;
let listeners: Set<() => void> = new Set();

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

// Auto-detect basePath from Next.js config at runtime
let _basePath: string | null = null;
function getBasePath(): string {
  if (_basePath !== null) return _basePath;
  if (typeof window !== "undefined") {
    // Next.js sets __NEXT_DATA__.basePath
    const nd = (window as unknown as Record<string, { basePath?: string }>).__NEXT_DATA__;
    _basePath = (nd?.basePath || "") + "/audio/";
  } else {
    _basePath = "/audio/";
  }
  return _basePath;
}
