"use client";

let ctx: AudioContext | null = null;
let playing = false;

export function startMusic() {
  if (playing || typeof window === "undefined") return;
  ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  playing = true;
  loop();
}

export function stopMusic() {
  playing = false;
  if (ctx) { ctx.close(); ctx = null; }
}

function playNote(freq: number, start: number, dur: number, vol: number) {
  if (!ctx || !playing) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.1);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur);
}

function loop() {
  if (!playing || !ctx) return;
  const notes = [262, 294, 330, 392, 440, 392, 330, 294];
  notes.forEach((n, i) => playNote(n, i * 0.8, 0.7, 0.03));
  setTimeout(loop, notes.length * 800);
}
