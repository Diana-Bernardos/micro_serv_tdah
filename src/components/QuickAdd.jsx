import { useMemo, useState } from "react";
import { C } from "../constants/colors";
import { ENERGY_BLOCKS } from "../constants/config";

export default function QuickAdd({ onAdd }) {
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState("morning");

  const energyMeta = useMemo(
    () => ENERGY_BLOCKS.find((e) => e.key === energy) ?? ENERGY_BLOCKS[0],
    [energy],
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 10,
        padding: 14,
        border: `1.5px solid ${C.border}`,
        background: C.surface,
        borderRadius: 16,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 99,
              background: C[energyMeta.colorKey],
              boxShadow: `0 0 0 4px rgba(255,255,255,0.03)`,
            }}
          />
          <div style={{ color: C.textDim, fontSize: 13 }}>
            Añadir tarea · {energyMeta.label}
          </div>
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe algo pequeño y accionable…"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            onAdd?.({ text, energy });
            setText("");
          }}
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

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ENERGY_BLOCKS.map((b) => {
            const active = b.key === energy;
            return (
              <button
                key={b.key}
                onClick={() => setEnergy(b.key)}
                style={{
                  cursor: "pointer",
                  borderRadius: 999,
                  border: `1.5px solid ${active ? C[b.colorKey] : C.border}`,
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                  color: active ? C.text : C.textDim,
                  padding: "8px 10px",
                  minHeight: 40,
                }}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => {
          onAdd?.({ text, energy });
          setText("");
        }}
        style={{
          cursor: "pointer",
          borderRadius: 14,
          border: `1.5px solid ${C.focus}`,
          background: "rgba(16,245,160,0.10)",
          color: C.text,
          padding: "0 14px",
          minHeight: 44,
          alignSelf: "start",
        }}
      >
        + Añadir
      </button>
    </div>
  );
}

