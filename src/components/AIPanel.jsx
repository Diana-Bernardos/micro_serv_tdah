import { useMemo, useState } from "react";
import { C } from "../constants/colors";
import { ENERGY_BLOCKS } from "../constants/config";
import { callClaude } from "../lib/claude";

export default function AIPanel({ tasks, energy, onEnergyChange, onApplySubtasks, focusedTask }) {
  const [mode, setMode] = useState("whatNow");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [splitInput, setSplitInput] = useState("");

  const energyMeta = useMemo(
    () => ENERGY_BLOCKS.find((e) => e.key === energy) ?? ENERGY_BLOCKS[0],
    [energy],
  );

  async function run() {
    setLoading(true);
    setResult("");
    try {
      const res = await callClaude({
        mode,
        tasks,
        energy,
        input: mode === "splitTask" ? splitInput : "",
      });
      setResult(res?.text ?? "");

      if (mode === "splitTask" && focusedTask && res?.text) {
        const lines = String(res.text)
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .filter((l) => l.startsWith("- "))
          .map((l) => l.replace(/^- /, "").trim())
          .slice(0, 6);
        if (lines.length > 0) onApplySubtasks?.(focusedTask.id, lines);
      }
    } finally {
      setLoading(false);
    }
  }

  const btn = (id, label) => {
    const active = mode === id;
    return (
      <button
        onClick={() => setMode(id)}
        style={{
          cursor: "pointer",
          borderRadius: 999,
          border: `1.5px solid ${active ? C.focus : C.border}`,
          background: active ? "rgba(16,245,160,0.10)" : "transparent",
          color: active ? C.text : C.textDim,
          padding: "8px 10px",
          minHeight: 44,
        }}
      >
        {label}
      </button>
    );
  };

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
        <div style={{ color: C.text, fontWeight: 900 }}>Asistente</div>
        <div style={{ color: C.textMute, fontSize: 12 }}>Simulado</div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {btn("whatNow", "¿Qué hago ahora?")}
        {btn("breakIdea", "Idea descanso")}
        {btn("splitTask", "Dividir tarea")}
      </div>

      <div
        style={{
          borderRadius: 14,
          border: `1.5px solid ${C.border}`,
          background: "rgba(255,255,255,0.03)",
          padding: 12,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                background: C[energyMeta.colorKey],
              }}
            />
            <div style={{ color: C.textDim, fontSize: 13 }}>Energía: {energyMeta.label}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ENERGY_BLOCKS.map((b) => (
              <button
                key={b.key}
                onClick={() => onEnergyChange?.(b.key)}
                style={{
                  cursor: "pointer",
                  borderRadius: 999,
                  border: `1.5px solid ${b.key === energy ? C[b.colorKey] : C.border}`,
                  background: b.key === energy ? "rgba(255,255,255,0.06)" : "transparent",
                  color: b.key === energy ? C.text : C.textDim,
                  padding: "8px 10px",
                  minHeight: 40,
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "splitTask" ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ color: C.textMute, fontSize: 12 }}>
              Consejo: elige una tarea en foco y escribe el nombre tal cual.
            </div>
            <input
              value={splitInput}
              onChange={(e) => setSplitInput(e.target.value)}
              placeholder={focusedTask ? `Ej: ${focusedTask.text}` : "Ej: preparar informe"}
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 12,
                border: `1.5px solid ${C.border}`,
                background: "rgba(255,255,255,0.04)",
                color: C.text,
                outline: "none",
              }}
            />
          </div>
        ) : null}

        <button
          onClick={run}
          disabled={loading}
          style={{
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            borderRadius: 14,
            border: `1.5px solid ${C.focus}`,
            background: "rgba(16,245,160,0.10)",
            color: C.text,
            minHeight: 44,
            padding: "0 12px",
            justifySelf: "start",
          }}
        >
          {loading ? "Pensando…" : "Generar"}
        </button>
      </div>

      <div
        style={{
          minHeight: 64,
          borderRadius: 14,
          border: `1.5px solid ${C.border}`,
          background: "rgba(0,0,0,0.18)",
          padding: 12,
          color: result ? C.text : C.textMute,
          whiteSpace: "pre-wrap",
          lineHeight: 1.35,
        }}
      >
        {result || "Respuestas cortas, directas y sin API externa."}
      </div>
    </div>
  );
}

