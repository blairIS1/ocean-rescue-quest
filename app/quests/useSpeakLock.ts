"use client";
import { useState, useEffect } from "react";
import { getIsSpeaking, onSpeakingChange } from "./speak";

/** Returns true while any voice line is playing. Use to disable buttons. */
export function useSpeakLock(): boolean {
  const [locked, setLocked] = useState(getIsSpeaking);
  useEffect(() => onSpeakingChange(() => setLocked(getIsSpeaking())), []);
  return locked;
}
