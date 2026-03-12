import { C } from "../constants/colors";

export default function FocusMode({ task, onClose }) {
  if (!task) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 9998,
        display: "grid",
        placeItems: "center",
        padding: 18,
      }}
    >
      <div style={{ width: "min(720px, 100%)", display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ color: C.textMute, fontSize: 12 }}>Solo una cosa</div>
          <button
            onClick={onClose}
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
            Salir
          </button>
        </div>

        <div
          style={{
            borderRadius: 18,
            border: `1.5px solid ${C.border}`,
            background: "rgba(255,255,255,0.04)",
            padding: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 950, color: C.text, lineHeight: 1.15 }}>
            {task.emoji ?? "🎯"} {task.text}
          </div>

          {Array.isArray(task.subtasks) && task.subtasks.length > 0 ? (
            <div style={{ display: "grid", gap: 8 }}>
              {task.subtasks.slice(0, 6).map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: 14,
                    border: `1.5px solid ${C.border}`,
                    background: "rgba(0,0,0,0.25)",
                    padding: 12,
                    color: C.textDim,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: C.textDim }}>
              Haz solo 2 minutos. El objetivo es empezar, no acabar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

