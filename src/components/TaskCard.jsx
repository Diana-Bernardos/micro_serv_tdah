import { useMemo, useRef } from "react";
import { C } from "../constants/colors";
import { ENERGY_BLOCKS } from "../constants/config";
import { burst } from "../lib/helpers";

export default function TaskCard({
  task,
  focused,
  isDoing,
  onFocus,
  onDoing,
  onToggleDone,
  onRemove,
}) {
  const ref = useRef(null);

  const energyMeta = useMemo(
    () => ENERGY_BLOCKS.find((e) => e.key === task.energy) ?? ENERGY_BLOCKS[0],
    [task.energy],
  );

  const border = focused ? C.focus : C.border;

  return (
    <div
      ref={ref}
      style={{
        borderRadius: 16,
        border: `1.5px solid ${border}`,
        background: focused ? C.surfaceUp : C.surface,
        padding: 14,
        display: "grid",
        gap: 10,
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ fontSize: 20, lineHeight: "22px" }}>{task.emoji ?? "🎯"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 650 }}>
            {task.text}
          </div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: C[energyMeta.colorKey],
              }}
            />
            <div style={{ color: C.textMute, fontSize: 12 }}>
              {energyMeta.label} {isDoing ? "· En foco" : ""}
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove?.(task.id)}
          aria-label="Eliminar"
          style={{
            cursor: "pointer",
            borderRadius: 12,
            border: `1.5px solid ${C.border}`,
            background: "transparent",
            color: C.textMute,
            minWidth: 44,
            minHeight: 44,
          }}
        >
          ✕
        </button>
      </div>

      {Array.isArray(task.subtasks) && task.subtasks.length > 0 ? (
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1.5px solid ${C.border}`,
            borderRadius: 14,
            padding: 10,
            color: C.textDim,
            fontSize: 13,
          }}
        >
          {task.subtasks.slice(0, 6).map((s, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, padding: "6px 2px" }}>
              <div style={{ color: C.textMute }}>•</div>
              <div style={{ flex: 1 }}>{s}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => onFocus?.(task.id)}
          style={{
            cursor: "pointer",
            borderRadius: 999,
            border: `1.5px solid ${focused ? C.focus : C.border}`,
            background: focused ? "rgba(16,245,160,0.10)" : "transparent",
            color: focused ? C.text : C.textDim,
            padding: "8px 10px",
            minHeight: 44,
          }}
        >
          {focused ? "En pantalla" : "Fijar"}
        </button>

        <button
          onClick={() => onDoing?.(task.id)}
          style={{
            cursor: "pointer",
            borderRadius: 999,
            border: `1.5px solid ${isDoing ? C.focus : C.border}`,
            background: isDoing ? "rgba(16,245,160,0.10)" : "transparent",
            color: isDoing ? C.text : C.textDim,
            padding: "8px 10px",
            minHeight: 44,
          }}
        >
          {isDoing ? "En foco" : "Poner en foco"}
        </button>

        <button
          onClick={() => {
            if (task.col !== "done") {
              const rect = ref.current?.getBoundingClientRect?.();
              if (rect) burst({ x: rect.left + rect.width * 0.55, y: rect.top + rect.height * 0.35 });
            }
            onToggleDone?.(task.id);
          }}
          style={{
            cursor: "pointer",
            borderRadius: 999,
            border: `1.5px solid ${task.col === "done" ? C.focus : C.border}`,
            background: task.col === "done" ? "rgba(16,245,160,0.10)" : "transparent",
            color: task.col === "done" ? C.text : C.textDim,
            padding: "8px 10px",
            minHeight: 44,
          }}
        >
          {task.col === "done" ? "Deshacer" : "Hecho"}
        </button>
      </div>
    </div>
  );
}

