import { C } from "../constants/colors";
import { FOCUS_PRESETS } from "../constants/config";
import { formatTime } from "../lib/helpers";

export default function FocusTimer({ timer }) {
  const { secondsLeft, isRunning, sessions, start, pause, resume, reset } = timer;

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1.5px solid ${C.border}`,
        background: C.surface,
        padding: 14,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ color: C.text, fontWeight: 800 }}>Temporizador</div>
        <div style={{ color: C.textMute, fontSize: 12 }}>Sesiones: {sessions}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 900, color: C.text }}>
          {formatTime(secondsLeft)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {isRunning ? (
            <button
              onClick={pause}
              style={{
                cursor: "pointer",
                borderRadius: 14,
                border: `1.5px solid ${C.border}`,
                background: "transparent",
                color: C.textDim,
                minHeight: 44,
                padding: "0 12px",
              }}
            >
              Pausar
            </button>
          ) : (
            <button
              onClick={resume}
              disabled={secondsLeft === 0}
              style={{
                cursor: secondsLeft === 0 ? "not-allowed" : "pointer",
                opacity: secondsLeft === 0 ? 0.5 : 1,
                borderRadius: 14,
                border: `1.5px solid ${C.focus}`,
                background: "rgba(16,245,160,0.10)",
                color: C.text,
                minHeight: 44,
                padding: "0 12px",
              }}
            >
              Seguir
            </button>
          )}

          <button
            onClick={reset}
            style={{
              cursor: "pointer",
              borderRadius: 14,
              border: `1.5px solid ${C.border}`,
              background: "transparent",
              color: C.textDim,
              minHeight: 44,
              padding: "0 12px",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FOCUS_PRESETS.map((m) => (
          <button
            key={m}
            onClick={() => start(m)}
            style={{
              cursor: "pointer",
              borderRadius: 999,
              border: `1.5px solid ${C.border}`,
              background: "transparent",
              color: C.textDim,
              padding: "8px 10px",
              minHeight: 44,
            }}
          >
            {m}m
          </button>
        ))}
      </div>
    </div>
  );
}

