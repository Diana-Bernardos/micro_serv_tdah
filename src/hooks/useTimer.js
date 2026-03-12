import { useEffect, useRef, useState } from "react";

export function useTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) return;

    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft !== 0) return;
    setIsRunning(false);
    setSessions((x) => x + 1);
  }, [isRunning, secondsLeft]);

  function start(minutes) {
    const s = Math.max(0, Math.round(minutes * 60));
    setSecondsLeft(s);
    if (s > 0) setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
  }

  function resume() {
    if (secondsLeft > 0) setIsRunning(true);
  }

  function reset() {
    setIsRunning(false);
    setSecondsLeft(0);
  }

  return {
    secondsLeft,
    isRunning,
    sessions,
    start,
    pause,
    resume,
    reset,
  };
}

