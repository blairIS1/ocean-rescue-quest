"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { speak, stopSpeaking } from "./speak";

export type Action =
  | { type: "speak"; key: string }
  | { type: "sfx"; fn: () => void }
  | { type: "wait"; ms: number }
  | { type: "unlock" };

export type GameNode = {
  id: string;
  enter?: Action[];
  on: Record<string, string>;
};

export type GameGraphState = {
  nodeId: string;
  inputEnabled: boolean;
  data: Record<string, unknown>;
};

export function useGameGraph(nodes: GameNode[], initial: string) {
  const [state, setState] = useState<GameGraphState>({
    nodeId: initial,
    inputEnabled: true,
    data: {},
  });
  const cancelRef = useRef<() => void>(() => {});
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const runEnter = useCallback((node: GameNode, nodeId: string) => {
    if (!node.enter?.length) {
      setState((s) => ({ ...s, nodeId, inputEnabled: true }));
      return;
    }

    let cancelled = false;
    stopSpeaking();
    cancelRef.current();
    cancelRef.current = () => { cancelled = true; };

    setState((s) => ({ ...s, nodeId, inputEnabled: false }));

    (async () => {
      for (const action of node.enter!) {
        if (cancelled) return;
        switch (action.type) {
          case "speak":
            await speak(action.key);
            break;
          case "sfx":
            action.fn();
            break;
          case "wait":
            await new Promise<void>((r) => {
              const t = setTimeout(r, action.ms);
              const check = () => { if (cancelled) { clearTimeout(t); r(); } };
              const id = setInterval(check, 50);
              setTimeout(() => clearInterval(id), action.ms + 100);
            });
            break;
          case "unlock":
            if (!cancelled) setState((s) => ({ ...s, inputEnabled: true }));
            break;
        }
      }
    })();
  }, []);

  useEffect(() => {
    const node = nodesRef.current.find((n) => n.id === state.nodeId);
    if (node) runEnter(node, node.id);
    return () => { cancelRef.current(); stopSpeaking(); };
  }, [state.nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback((event: string, payload?: unknown) => {
    const node = nodesRef.current.find((n) => n.id === state.nodeId);
    if (!node) return;
    const next = node.on[event];
    if (!next) return;
    stopSpeaking();
    cancelRef.current();
    setState((prev) => ({
      nodeId: next,
      inputEnabled: false,
      data: payload !== undefined ? { ...prev.data, [event]: payload } : prev.data,
    }));
  }, [state.nodeId]);

  return { state, send };
}
