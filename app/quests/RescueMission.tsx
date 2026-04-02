"use client";
import { useState, useEffect, useCallback } from "react";
import { RESCUE_EVENTS } from "./data";
import BubblesBuddy from "./BubblesBuddy";
import { sfxCorrect, sfxWrong, sfxTap, sfxCelebrate } from "./sfx";
import { speak, stopSpeaking } from "./speak";
import { VOICE } from "./voice";
import Confetti from "./Confetti";

export default function RescueMission({ onComplete }: { onComplete: () => void }) {
  const [events] = useState(() => [...RESCUE_EVENTS]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"sailing" | "event" | "result">("sailing");
  const [overridden, setOverridden] = useState(false);
  const [aiActed, setAiActed] = useState(false);
  const [saves, setSaves] = useState(0);
  const [oops, setOops] = useState(0);
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState(0);
  const [boatY, setBoatY] = useState(50);

  useEffect(() => { speak(VOICE.q4Start); return () => { stopSpeaking(); }; }, []);

  const event = events[idx];
  const aiWrong = event.correct === "rescue";

  useEffect(() => {
    if (phase !== "sailing") return;
    const t = setTimeout(() => { setPhase("event"); setTimer(0); }, 1200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "event") return;
    const t = setInterval(() => setTimer((v) => v + 100), 100);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "event" || overridden || aiActed) return;
    if (timer >= event.delay) setAiActed(true);
  }, [phase, timer, event.delay, overridden, aiActed]);

  useEffect(() => {
    if (!aiActed || phase !== "event") return;
    if (aiWrong) { setOops((c) => c + 1); sfxWrong(); speak(VOICE.q4Crash); }
    else { sfxCorrect(); speak(VOICE.q4AiRight); }
    setPhase("result");
  }, [aiActed, phase, aiWrong]);

  const override = useCallback(() => {
    if (phase !== "event" || aiActed) return;
    setOverridden(true); setPhase("result");
    setBoatY((y) => y > 50 ? y - 20 : y + 20);
    if (aiWrong) { setSaves((s) => s + 1); sfxCorrect(); speak(VOICE.q4Save); }
    else { speak(VOICE.q4FalseAlarm); }
  }, [phase, aiActed, aiWrong]);

  const advance = () => {
    if (idx + 1 >= events.length) { setDone(true); return; }
    setIdx(idx + 1); setPhase("sailing"); setOverridden(false); setAiActed(false); setTimer(0);
  };

  if (done) {
    const totalRescue = events.filter((e) => e.correct === "rescue").length;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 fade-in">
        <Confetti active={true} />
        <BubblesBuddy mood="celebrate" size={140} />
        <h2 className="text-3xl font-bold">Rescue Complete!</h2>
        <div className="flex gap-6 text-lg"><span>🦸 Saved: {saves}/{totalRescue}</span><span>😅 Missed: {oops}</span></div>
        <button className="btn btn-success mt-4" onClick={() => { stopSpeaking(); sfxTap(); sfxCelebrate(); speak(VOICE.q4Learned); onComplete(); }}>Final Quest →</button>
      </div>
    );
  }

  const urgencyPct = aiWrong ? Math.min((timer / event.delay) * 100, 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 sm:p-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold">🚢 Quest 3: Rescue Mission!</h2>
      <BubblesBuddy mood={phase === "event" && aiWrong ? "scared" : "idle"} size={80} />
      <div className="text-sm opacity-70">{idx + 1} / {events.length}</div>
      <div className="w-full max-w-lg h-32 rounded-2xl relative overflow-hidden" style={{ background: "#0a2a4a" }}>
        <div className="text-4xl absolute transition-all" style={{ left: "15%", top: `${boatY}%`, transform: "translateY(-50%)", transitionDuration: "0.3s" }}>🚤</div>
        {phase !== "sailing" && <div className="text-5xl absolute top-1/2 right-8" style={{ transform: "translateY(-50%)" }}>{event.emoji}</div>}
        {[20, 40, 60, 80].map((x) => <div key={x} className="absolute w-1 h-1 rounded-full bg-cyan-300 opacity-20" style={{ left: `${x}%`, top: `${(x * 37) % 80 + 10}%` }} />)}
      </div>
      {phase === "event" && aiWrong && !overridden && !aiActed && (
        <div className="w-full max-w-lg">
          <div className="text-sm text-center mb-1" style={{ color: "var(--warn)" }}>⚠️ Act before it&apos;s too late!</div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${urgencyPct}%`, background: urgencyPct > 70 ? "#ef4444" : "var(--warn)", transition: "width 0.1s linear" }} /></div>
        </div>
      )}
      {phase === "event" && <div className="text-xl font-semibold">{event.label}</div>}
      {phase === "event" && !overridden && !aiActed && (
        <button className="btn text-2xl fade-in" style={{ background: "#ef4444", animation: "pulse 0.6s infinite alternate" }} onClick={override}>🛡️ RESCUE!</button>
      )}
      {phase === "result" && (
        <div className="flex flex-col items-center gap-3 fade-in">
          <div className="text-lg text-center max-w-md" style={{ color: (overridden && aiWrong) || (!aiWrong) ? "var(--success)" : "var(--warn)" }}>
            {overridden && aiWrong ? "🦸 Great rescue!" : overridden && !aiWrong ? "😅 That was actually safe!" : !aiWrong ? "🤖 AI sailed through safely!" : "😅 Oops! Should have rescued!"}
          </div>
          <button className="btn btn-primary mt-2" onClick={advance}>Continue →</button>
        </div>
      )}
      <div className="flex gap-4 text-sm opacity-70"><span>🦸 Saved: {saves}</span><span>😅 Missed: {oops}</span></div>
    </div>
  );
}
