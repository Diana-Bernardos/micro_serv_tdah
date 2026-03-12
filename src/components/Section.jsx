import { useMemo } from "react";
import { C } from "../constants/colors";
import TaskCard from "./TaskCard";

export default function Section({
  title,
  hint,
  color,
  tasks,
  focusedId,
  doingId,
  onFocus,
  onDoing,
  onToggleDone,
  onRemove,
}) {
  const list = useMemo(() => tasks ?? [], [tasks]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 99,
              background: color,
              boxShadow: `0 0 0 4px rgba(255,255,255,0.03)`,
            }}
          />
          <div style={{ color: C.text, fontWeight: 750 }}>{title}</div>
          <div style={{ color: C.textMute, fontSize: 12 }}>{hint}</div>
        </div>
        <div style={{ color: C.textMute, fontSize: 12 }}>{list.length}</div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {list.length === 0 ? (
          <div
            style={{
              borderRadius: 16,
              border: `1.5px dashed ${C.border}`,
              padding: 14,
              color: C.textMute,
              fontSize: 13,
            }}
          >
            Nada aquí. Perfecto.
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
    </div>
  );
}

