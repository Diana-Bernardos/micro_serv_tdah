import { useMemo, useState } from "react";
import { C } from "../constants/colors";
import TaskCard from "./TaskCard";

export default function DoneSection({
  tasks,
  focusedId,
  doingId,
  onFocus,
  onDoing,
  onToggleDone,
  onRemove,
}) {
  const [open, setOpen] = useState(false);
  const list = useMemo(() => tasks ?? [], [tasks]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: 12,
          borderRadius: 14,
          border: `1.5px solid ${C.border}`,
          background: "transparent",
          minHeight: 44,
          color: C.textDim,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ color: C.textMute }}>{open ? "▼" : "▶"}</div>
          <div style={{ fontWeight: 700 }}>Completadas</div>
          <div style={{ color: C.textMute, fontSize: 12 }}>{list.length}</div>
        </div>
        <div style={{ color: C.textMute, fontSize: 12 }}>{open ? "Ocultar" : "Mostrar"}</div>
      </button>

      {open ? (
        <div style={{ display: "grid", gap: 10 }}>
          {list.length === 0 ? (
            <div style={{ color: C.textMute, fontSize: 13, padding: "2px 4px" }}>
              Todavía nada. Bien.
            </div>
          ) : null}

          {list.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              focused={focusedId === t.id}
              isDoing={doingId === t.id}
              onFocus={onFocus}
              onDoing={onDoing}
              onToggleDone={onToggleDone}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

