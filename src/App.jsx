import { useEffect, useRef, useState } from "react";

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg: "#080B10",
  surface: "#0D1117",
  surfaceUp: "#131922",
  border: "#1E2733",
  borderUp: "#2A3644",
  muted: "#3A4A5C",
  text: "#E8EFF8",
  textSoft: "#7A8FA8",
  textMuted: "#4A5A6A",
  morning: "#FFB020",
  afternoon: "#22D3EE",
  lowEnergy: "#A78BFA",
  focus: "#10F5A0",
  danger: "#FF4D6D",
  todo: "#3B82F6",
  doing: "#FFB020",
  done: "#10B981",
  ai: "#F472B6",
};

const ENERGY_BLOCKS = [
  { id: "morning", label: "Mañana", icon: "🌅", color: C.morning, desc: "Alta energía — tareas difíciles" },
  { id: "afternoon", label: "Tarde", icon: "☀️", color: C.afternoon, desc: "Energía media — reuniones, emails" },
  { id: "lowEnergy", label: "Baja energía", icon: "🌙", color: C.lowEnergy, desc: "Tareas simples, descanso activo" },
];

const FOCUS_PRESETS = [5, 10, 15, 25, 45];

const SAMPLE_TASKS = [
  { id: 1, text: "Revisar correos importantes", col: "todo", energy: "morning", emoji: "📧", priority: "high" },
  { id: 2, text: "Sesión de ejercicio", col: "todo", energy: "morning", emoji: "🏋️", priority: "medium" },
  { id: 3, text: "Trabajar en el proyecto", col: "doing", energy: "afternoon", emoji: "💻", priority: "high" },
  { id: 4, text: "Llamada con el equipo", col: "done", energy: "afternoon", emoji: "📞", priority: "medium" },
  { id: 5, text: "Journaling del día", col: "todo", energy: "lowEnergy", emoji: "📓", priority: "low" },
];

const EMOJIS = [
  "📧",
  "💻",
  "📞",
  "🏋️",
  "📓",
  "🎯",
  "🔬",
  "✏️",
  "🎨",
  "🧩",
  "📚",
  "🛒",
  "🧘",
  "🎵",
  "🍎",
  "🔑",
  "💡",
  "🚀",
  "📊",
  "🎤",
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
const isMobile = () => window.innerWidth < 768;

// ─── AI SERVICE (SIMULADO, SIN CLAUDE) ─────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractQuotedTasks(userMessage) {
  const matches = String(userMessage || "").match(/"([^"]+)"/g) || [];
  return matches.map((m) => m.slice(1, -1)).filter(Boolean);
}

async function callClaude(_systemPrompt, userMessage) {
  // Simula latencia para que la UX sea realista
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

  const msg = String(userMessage || "");

  // Caso "splitTask": la UI espera JSON array puro
  if (msg.toLowerCase().includes("responde solo con un json array")) {
    const subtasks = [
      "Abrir el documento y poner título",
      "Escribir 3 bullets de lo esencial",
      "Hacer una versión mínima en 10 min",
      "Anotar el siguiente paso exacto",
    ];
    return JSON.stringify(subtasks.slice(0, 3 + Math.floor(Math.random() * 2)));
  }

  // Descanso
  if (msg.toLowerCase().includes("actividad de descanso")) {
    return pick([
      "Haz 5–10 min de paseo corto y agua. Sin pantalla: solo respiración y movimiento.",
      "Reset rápido: estira cuello/hombros 60s y mira por la ventana 2 min. Vuelve directo.",
      "Descanso TDAH: ordena 10 objetos (1 min) y luego respira lento 8 veces. Listo.",
    ]);
  }

  // Qué hago ahora
  if (msg.toLowerCase().includes("empieza con") && msg.includes("👉 Haz esto ahora:")) {
    const tasks = extractQuotedTasks(msg).filter((t) => !t.toLowerCase().includes("energía"));
    const chosen = tasks[0] || "una tarea de 2 minutos";
    return `👉 Haz esto ahora: ${chosen}. Porque empezar baja la fricción y te mete en movimiento. Si cuesta, haz solo 2 minutos.`;
  }

  // Fallback
  return "👉 Haz esto ahora: una microtarea de 2 minutos. Porque el objetivo es arrancar, no hacerlo perfecto.";
}

// ─── MICRO COMPONENTS ──────────────────────────────────────────────────────────
const Pill = ({ color, children, small }) => (
  <span
    style={{
      background: color + "20",
      color,
      border: `1px solid ${color}40`,
      borderRadius: 999,
      padding: small ? "2px 7px" : "3px 10px",
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

// Confetti burst on task completion
function burst(x, y) {
  if (typeof document === "undefined") return;
  const colors = [C.focus, C.morning, C.afternoon, C.ai, C.lowEnergy];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement("div");
    const angle = (Math.PI * 2 * i) / 18;
    const dist = 60 + Math.random() * 60;
    const size = 6 + Math.random() * 6;
    Object.assign(el.style, {
      position: "fixed",
      left: x + "px",
      top: y + "px",
      width: size + "px",
      height: size + "px",
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      background: colors[Math.floor(Math.random() * colors.length)],
      pointerEvents: "none",
      zIndex: 9999,
      transform: "translate(-50%,-50%)",
      transition: "transform 0.7s cubic-bezier(0.2,1,0.4,1), opacity 0.7s ease",
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) rotate(${Math.random() * 360}deg) scale(0)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 800);
  }
}

// ─── TASK CARD ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onMove, onDelete, onFocus, focused, mobile }) {
  const ref = useRef();
  const energy = ENERGY_BLOCKS.find((e) => e.id === task.energy);
  const isDone = task.col === "done";

  function handleDone() {
    if (!isDone) {
      const r = ref.current?.getBoundingClientRect();
      if (r) burst(r.left + r.width / 2, r.top + r.height / 2);
    }
    onMove(task.id, isDone ? "todo" : "done");
  }

  return (
    <div
      ref={ref}
      style={{
        background: focused ? C.surfaceUp : C.surface,
        border: `1.5px solid ${focused ? C.focus + "60" : isDone ? C.done + "30" : C.border}`,
        borderRadius: 16,
        padding: mobile ? "14px 12px" : "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        transition: "all 0.2s ease",
        boxShadow: focused ? `0 0 0 3px ${C.focus}22, 0 8px 32px ${C.focus}18` : "none",
        opacity: isDone ? 0.55 : 1,
      }}
    >
      <button
        onClick={handleDone}
        style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `2px solid ${isDone ? C.done : C.border}`,
          background: isDone ? C.done : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isDone ? "#000" : C.muted,
          fontSize: 13,
          fontWeight: 900,
          marginTop: 1,
          transition: "all 0.2s",
        }}
      >
        {isDone ? "✓" : ""}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>{task.emoji}</span>
          <span
            style={{
              color: C.text,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: isDone ? "line-through" : "none",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.4,
            }}
          >
            {task.text}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {energy && (
            <Pill color={energy.color} small>
              {energy.icon} {energy.label}
            </Pill>
          )}
          {task.col === "doing" && (
            <Pill color={C.doing} small>
              ⚡ En foco
            </Pill>
          )}
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div style={{ marginTop: 10, paddingLeft: 4, borderLeft: `2px solid ${C.ai}40` }}>
            {task.subtasks.map((st, i) => (
              <div
                key={i}
                style={{
                  color: C.textSoft,
                  fontSize: 12,
                  padding: "3px 0 3px 10px",
                  display: "flex",
                  gap: 6,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ color: C.ai, fontWeight: 700, flexShrink: 0 }}>·</span>
                {st}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        {!isDone && (
          <button
            onClick={() => onFocus(task.id)}
            style={iconBtn(focused ? C.focus : C.muted, focused ? C.focus + "30" : "transparent")}
          >
            {focused ? "🎯" : "⚡"}
          </button>
        )}
        {task.col !== "done" && task.col !== "doing" && (
          <button onClick={() => onMove(task.id, "doing")} style={iconBtn(C.doing, "transparent")} title="Mover a En foco">
            →
          </button>
        )}
        {task.col === "doing" && (
          <button onClick={() => onMove(task.id, "todo")} style={iconBtn(C.muted, "transparent")} title="Volver a pendiente">
            ←
          </button>
        )}
        <button onClick={() => onDelete(task.id)} style={iconBtn(C.danger, "transparent")}>
          ×
        </button>
      </div>
    </div>
  );
}

const iconBtn = (color, bg) => ({
  background: bg,
  border: `1px solid ${color}40`,
  color,
  borderRadius: 8,
  width: 30,
  height: 30,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  transition: "all 0.15s",
  flexShrink: 0,
});

// ─── AI PANEL ──────────────────────────────────────────────────────────────────
function AIPanel({ tasks, onAddSubtasks }) {
  const [mode, setMode] = useState(null); // null | 'now' | 'break' | 'split'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [splitInput, setSplitInput] = useState("");
  const [currentEnergy, setCurrentEnergy] = useState("morning");

  async function askWhatNow() {
    setMode("now");
    setLoading(true);
    setResult(null);
    const pending = tasks.filter((t) => t.col !== "done");
    const prompt = `Eres un coach de productividad especializado en TDAH adulto. Responde siempre en español.
Sé muy directo, empático, sin rodeos. Máximo 3 frases. No uses listas complicadas.
El usuario tiene energía de nivel: ${currentEnergy}.
Tareas pendientes: ${pending.map((t) => `"${t.text}" (energía: ${t.energy}, estado: ${t.col})`).join(", ")}.
Dile exactamente UNA tarea que debería hacer AHORA y por qué. Empieza con "👉 Haz esto ahora:"`;
    try {
      const r = await callClaude("Eres un coach TDAH. Responde en español, directo y sin rodeos.", prompt);
      setResult(r);
    } catch {
      setResult("⚠️ No se pudo conectar con la IA. Revisa tu conexión.");
    }
    setLoading(false);
  }

  async function askBreak() {
    setMode("break");
    setLoading(true);
    setResult(null);
    const prompt = `Soy una persona con TDAH y acabo de terminar una sesión de foco. 
Dame UNA actividad de descanso corta (5-10 min) que ayude a resetear el cerebro TDAH. 
No debe ser una pantalla. Sé creativo y animado. Máximo 2 frases.`;
    try {
      const r = await callClaude("Eres un coach de bienestar para TDAH. Español, positivo, breve.", prompt);
      setResult(r);
    } catch {
      setResult("⚠️ Error de conexión.");
    }
    setLoading(false);
  }

  async function splitTask() {
    if (!splitInput.trim()) return;
    setLoading(true);
    setResult(null);
    const prompt = `Tengo TDAH y esta tarea me parece abrumadora: "${splitInput}".
Divídela en exactamente 3-4 microtareas muy concretas y accionables (verbos de acción, máximo 8 palabras cada una).
Responde SOLO con un JSON array de strings, sin explicación, sin markdown, sin backticks. Ejemplo: ["Abrir el doc", "Escribir título", "Añadir 3 puntos"]`;
    try {
      const raw = await callClaude("Responde SOLO con JSON array. Sin markdown, sin explicaciones.", prompt);
      const clean = raw.replace(/```json|```/g, "").trim();
      const subtasks = JSON.parse(clean);
      onAddSubtasks(splitInput, subtasks);
      setResult(`✅ Tarea dividida en ${subtasks.length} pasos. La encontrarás en tu lista.`);
      setSplitInput("");
    } catch {
      setResult("⚠️ Error al procesar. Intenta reformular la tarea.");
    }
    setLoading(false);
  }

  const buttons = [
    { id: "now", icon: "🧠", label: "¿Qué hago ahora?", color: C.focus, action: askWhatNow },
    { id: "break", icon: "🌿", label: "Idea de descanso", color: C.lowEnergy, action: askBreak },
    {
      id: "split",
      icon: "✂️",
      label: "Dividir tarea difícil",
      color: C.ai,
      action: () => {
        setMode("split");
        setResult(null);
      },
    },
  ];

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${C.ai}12, ${C.surface})`,
        border: `1.5px solid ${C.ai}40`,
        borderRadius: 20,
        padding: 20,
        boxShadow: `0 4px 40px ${C.ai}14`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${C.ai}, ${C.lowEnergy})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          ✨
        </div>
        <div>
          <div style={{ color: C.ai, fontWeight: 800, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
            Asistente IA para TDAH
          </div>
          <div style={{ color: C.textSoft, fontSize: 11 }}>Tu copiloto de foco personal</div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            color: C.textMuted,
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 6,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Mi energía ahora
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {ENERGY_BLOCKS.map((e) => (
            <button
              key={e.id}
              onClick={() => setCurrentEnergy(e.id)}
              style={{
                flex: 1,
                background: currentEnergy === e.id ? e.color + "25" : "transparent",
                border: `1.5px solid ${currentEnergy === e.id ? e.color : C.border}`,
                borderRadius: 10,
                padding: "7px 4px",
                cursor: "pointer",
                color: currentEnergy === e.id ? e.color : C.textSoft,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {e.icon} {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {buttons.map((b) => (
          <button
            key={b.id}
            onClick={b.action}
            disabled={loading}
            style={{
              background: mode === b.id ? b.color + "20" : "transparent",
              border: `1.5px solid ${mode === b.id ? b.color : C.border}`,
              borderRadius: 12,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: loading ? "wait" : "pointer",
              color: mode === b.id ? b.color : C.textSoft,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              transition: "all 0.15s",
              textAlign: "left",
              opacity: loading && mode !== b.id ? 0.4 : 1,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{b.icon}</span>
            <span>{b.label}</span>
            {mode !== b.id && <span style={{ marginLeft: "auto", fontSize: 16, opacity: 0.4 }}>→</span>}
          </button>
        ))}
      </div>

      {mode === "split" && (
        <div style={{ marginBottom: 14 }}>
          <input
            value={splitInput}
            onChange={(e) => setSplitInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && splitTask()}
            placeholder="Escribe la tarea que te abruma..."
            style={{
              width: "100%",
              background: C.bg,
              border: `1.5px solid ${C.ai}60`,
              borderRadius: 10,
              padding: "10px 14px",
              color: C.text,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 8,
            }}
          />
          <button
            onClick={splitTask}
            disabled={loading || !splitInput.trim()}
            style={{
              width: "100%",
              background: loading ? C.muted : `linear-gradient(135deg, ${C.ai}, ${C.lowEnergy})`,
              border: "none",
              borderRadius: 10,
              padding: "10px",
              color: "#080B10",
              fontWeight: 700,
              fontSize: 13,
              cursor: loading ? "wait" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {loading ? "✨ Pensando..." : "✂️ Dividir en pasos"}
          </button>
        </div>
      )}

      {loading && !result && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ color: C.ai, fontSize: 20, marginBottom: 6, animation: "spin 1s linear infinite" }}>✨</div>
          <div style={{ color: C.textSoft, fontSize: 12 }}>La IA está pensando...</div>
        </div>
      )}
      {result && (
        <div
          style={{
            background: C.bg,
            border: `1px solid ${C.ai}30`,
            borderRadius: 12,
            padding: 14,
            color: C.text,
            fontSize: 13,
            lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "pre-wrap",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}

// ─── FOCUS TIMER ───────────────────────────────────────────────────────────────
function FocusTimer({ activeTask }) {
  const [duration, setDuration] = useState(25);
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("focus");
  const [sessions, setSessions] = useState(0);
  const iRef = useRef();

  useEffect(() => {
    if (running) {
      iRef.current = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) {
            clearInterval(iRef.current);
            setRunning(false);
            if (phase === "focus") {
              setSessions((n) => n + 1);
              setPhase("break");
              setSecs(5 * 60);
            } else {
              setPhase("focus");
              setSecs(duration * 60);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(iRef.current);
  }, [running, phase, duration]);

  function pickDur(d) {
    setDuration(d);
    setSecs(d * 60);
    setRunning(false);
    setPhase("focus");
    clearInterval(iRef.current);
  }
  function reset() {
    clearInterval(iRef.current);
    setRunning(false);
    setSecs(duration * 60);
    setPhase("focus");
  }

  const total = phase === "focus" ? duration * 60 : 5 * 60;
  const pct = 1 - secs / total;
  const r = 52,
    cx = 60,
    cy = 60,
    circ = 2 * Math.PI * r;
  const color = phase === "focus" ? C.focus : C.afternoon;

  return (
    <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: 20 }}>
      <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
        ⚡ Temporizador de foco
      </div>
      {activeTask && (
        <div
          style={{
            background: C.focus + "14",
            border: `1px solid ${C.focus}30`,
            borderRadius: 10,
            padding: "8px 12px",
            marginBottom: 16,
            color: C.focus,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          🎯 {activeTask.emoji} {activeTask.text}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={120} height={120}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={8} />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={8}
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "stroke-dashoffset 0.9s ease, stroke 0.4s" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color, fontWeight: 800, fontSize: 22, fontFamily: "'DM Sans', sans-serif" }}>{fmt(secs)}</div>
            <div style={{ color: C.textSoft, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}>{phase === "focus" ? "FOCO" : "DESCANSO"}</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {FOCUS_PRESETS.map((d) => (
              <button
                key={d}
                onClick={() => pickDur(d)}
                style={{
                  background: duration === d ? C.focus + "25" : "transparent",
                  border: `1.5px solid ${duration === d ? C.focus : C.border}`,
                  borderRadius: 8,
                  padding: "4px 9px",
                  color: duration === d ? C.focus : C.textSoft,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {d}m
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setRunning((r) => !r)}
              style={{
                flex: 1,
                background: running ? C.danger + "20" : C.focus + "20",
                border: `1.5px solid ${running ? C.danger : C.focus}`,
                color: running ? C.danger : C.focus,
                borderRadius: 10,
                padding: "9px 0",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {running ? "⏸ Pausa" : "▶ Iniciar"}
            </button>
            <button
              onClick={reset}
              style={{
                background: "transparent",
                border: `1.5px solid ${C.border}`,
                color: C.textSoft,
                borderRadius: 10,
                padding: "9px 14px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              ↺
            </button>
          </div>
          {sessions > 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 10, alignItems: "center" }}>
              {Array.from({ length: Math.min(sessions, 6) }).map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.focus }} />
              ))}
              <span style={{ color: C.textSoft, fontSize: 11, marginLeft: 4 }}>
                {sessions} sesión{sessions !== 1 ? "es" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── QUICK ADD ─────────────────────────────────────────────────────────────────
function QuickAdd({ onAdd }) {
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState("morning");
  const [emoji, setEmoji] = useState("🎯");
  const [expanded, setExpanded] = useState(false);

  function submit() {
    if (!text.trim()) return;
    onAdd({ text: text.trim(), energy, emoji, col: "todo" });
    setText("");
    setExpanded(false);
  }

  return (
    <div
      style={{
        background: C.surface,
        border: `1.5px solid ${expanded ? C.focus + "60" : C.border}`,
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <input
          value={text}
          onFocus={() => setExpanded(true)}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="+ Añadir tarea rápida..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: C.text,
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            caretColor: C.focus,
          }}
        />
        {text.trim() && (
          <button
            onClick={submit}
            style={{
              background: C.focus,
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              color: "#080B10",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ✓
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {EMOJIS.slice(0, 12).map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  background: emoji === e ? C.focus + "30" : "transparent",
                  border: `1.5px solid ${emoji === e ? C.focus : C.border}`,
                  borderRadius: 7,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {ENERGY_BLOCKS.map((eb) => (
              <button
                key={eb.id}
                onClick={() => setEnergy(eb.id)}
                style={{
                  flex: 1,
                  background: energy === eb.id ? eb.color + "25" : "transparent",
                  border: `1.5px solid ${energy === eb.id ? eb.color : C.border}`,
                  borderRadius: 10,
                  padding: "7px 4px",
                  color: energy === eb.id ? eb.color : C.textSoft,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {eb.icon} {eb.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FOCUS MODE ────────────────────────────────────────────────────────────────
function FocusMode({ task, onClose, onDone }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#020408",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 380, padding: "0 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 24, animation: "float 3s ease-in-out infinite" }}>{task.emoji}</div>
        <div
          style={{
            color: C.textMuted,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          Ahora mismo, solo esto:
        </div>
        <div style={{ color: C.text, fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>{task.text}</div>
        {task.energy &&
          (() => {
            const e = ENERGY_BLOCKS.find((x) => x.id === task.energy);
            return <Pill color={e.color}>{e.icon} {e.label}</Pill>;
          })()}

        {task.subtasks?.length > 0 && (
          <div style={{ background: C.surfaceUp, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginTop: 24, textAlign: "left" }}>
            {task.subtasks.map((st, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "5px 0", color: C.textSoft, fontSize: 13 }}>
                <span style={{ color: C.ai, fontWeight: 900 }}>{i + 1}.</span>
                {st}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "transparent",
              border: `1.5px solid ${C.border}`,
              borderRadius: 12,
              padding: 14,
              color: C.textSoft,
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Volver
          </button>
          <button
            onClick={() => {
              onDone(task.id);
              onClose();
            }}
            style={{
              flex: 2,
              background: `linear-gradient(135deg, ${C.focus}, ${C.afternoon})`,
              border: "none",
              borderRadius: 12,
              padding: 14,
              color: "#080B10",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 15,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ✅ ¡Completada!
          </button>
        </div>
      </div>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      `}</style>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function FocusFlow() {
  const [tasks, setTasks] = useState(SAMPLE_TASKS);
  const [focusedId, setFocusedId] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    const fn = () => setMobile(isMobile());
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  function addTask(data) {
    setTasks((prev) => [{ ...data, id: Date.now() }, ...prev]);
  }

  function moveTask(id, col) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, col } : t)));
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (focusedId === id) setFocusedId(null);
  }

  function handleFocus(id) {
    setFocusedId((prev) => (prev === id ? null : id));
  }

  function addSubtasks(taskText, subtasks) {
    const existing = tasks.find((t) => t.text.toLowerCase().includes(taskText.toLowerCase().slice(0, 15)));
    if (existing) {
      setTasks((prev) => prev.map((t) => (t.id === existing.id ? { ...t, subtasks } : t)));
    } else {
      setTasks((prev) => [{ id: Date.now(), text: taskText, col: "todo", energy: "morning", emoji: "🎯", subtasks }, ...prev]);
    }
  }

  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const focusedTask = tasks.find((t) => t.id === focusedId);
  const pendingCount = tasks.filter((t) => t.col !== "done").length;
  const doneCount = tasks.filter((t) => t.col === "done").length;
  const doingTasks = tasks.filter((t) => t.col === "doing");
  const todoTasks = tasks.filter((t) => t.col === "todo");
  const doneTasks = tasks.filter((t) => t.col === "done");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        button { font-family: 'DM Sans', sans-serif; }
        input, textarea { font-family: 'DM Sans', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .task-enter { animation: fadeIn 0.25s ease; }
      `}</style>

      {focusMode && focusedTask && (
        <FocusMode
          task={focusedTask}
          onClose={() => setFocusMode(false)}
          onDone={(id) => {
            moveTask(id, "done");
            setFocusedId(null);
          }}
        />
      )}

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: C.bg + "f0",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.border}`,
          padding: mobile ? "12px 16px" : "12px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${C.focus}, ${C.afternoon})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🧠
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: mobile ? 15 : 17, letterSpacing: "-0.02em", fontFamily: "'DM Sans', sans-serif" }}>
                FocusFlow
              </div>
              {!mobile && <div style={{ color: C.textSoft, fontSize: 11 }}>{today}</div>}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ background: C.doing + "20", border: `1px solid ${C.doing}40`, borderRadius: 8, padding: "4px 10px", textAlign: "center" }}>
                <span style={{ color: C.doing, fontWeight: 800, fontSize: mobile ? 16 : 18 }}>{doingTasks.length}</span>
                <span style={{ color: C.textSoft, fontSize: 10, display: "block" }}>foco</span>
              </div>
              <div style={{ background: C.todo + "20", border: `1px solid ${C.todo}40`, borderRadius: 8, padding: "4px 10px", textAlign: "center" }}>
                <span style={{ color: C.todo, fontWeight: 800, fontSize: mobile ? 16 : 18 }}>{pendingCount}</span>
                <span style={{ color: C.textSoft, fontSize: 10, display: "block" }}>pendientes</span>
              </div>
              <div style={{ background: C.done + "20", border: `1px solid ${C.done}40`, borderRadius: 8, padding: "4px 10px", textAlign: "center" }}>
                <span style={{ color: C.done, fontWeight: 800, fontSize: mobile ? 16 : 18 }}>{doneCount}</span>
                <span style={{ color: C.textSoft, fontSize: 10, display: "block" }}>hechas</span>
              </div>
            </div>
          </div>
        </div>

        {mobile && <div style={{ color: C.textSoft, fontSize: 11, marginTop: 4, marginLeft: 44 }}>{today}</div>}
      </div>

      {focusedTask && (
        <div
          style={{
            background: `linear-gradient(135deg, ${C.focus}18, ${C.afternoon}10)`,
            borderBottom: `1px solid ${C.focus}30`,
            padding: mobile ? "10px 16px" : "10px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{focusedTask.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.focus, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tarea en foco</div>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{focusedTask.text}</div>
            </div>
          </div>
          <button
            onClick={() => setFocusMode(true)}
            style={{
              background: C.focus,
              border: "none",
              borderRadius: 10,
              padding: "7px 14px",
              color: "#080B10",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              flexShrink: 0,
            }}
          >
            🎯 Modo solo
          </button>
        </div>
      )}

      <div
        style={{
          display: mobile ? "block" : "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
          padding: mobile ? "16px" : "24px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div>
          <QuickAdd onAdd={addTask} />

          {doingTasks.length > 0 && (
            <Section label="⚡ En foco ahora" color={C.doing} count={doingTasks.length}>
              {doingTasks.map((t) => (
                <TaskCard key={t.id} task={t} onMove={moveTask} onDelete={deleteTask} onFocus={handleFocus} focused={focusedId === t.id} mobile={mobile} />
              ))}
            </Section>
          )}

          {ENERGY_BLOCKS.map((eb) => {
            const blockTasks = todoTasks.filter((t) => t.energy === eb.id);
            if (blockTasks.length === 0) return null;
            return (
              <Section key={eb.id} label={`${eb.icon} ${eb.label}`} color={eb.color} count={blockTasks.length} desc={eb.desc}>
                {blockTasks.map((t) => (
                  <TaskCard key={t.id} task={t} onMove={moveTask} onDelete={deleteTask} onFocus={handleFocus} focused={focusedId === t.id} mobile={mobile} />
                ))}
              </Section>
            );
          })}

          {todoTasks.length === 0 && doingTasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px", color: C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.textSoft }}>¡Todo listo por hoy!</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Añade una nueva tarea arriba cuando estés listo.</div>
            </div>
          )}

          {doneTasks.length > 0 && <DoneSection tasks={doneTasks} onMove={moveTask} onDelete={deleteTask} onFocus={handleFocus} focusedId={focusedId} mobile={mobile} />}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: mobile ? 20 : 0 }}>
          <AIPanel tasks={tasks} onAddSubtasks={addSubtasks} />
          <FocusTimer activeTask={focusedTask} />
        </div>
      </div>
    </div>
  );
}

// ─── SECTION ───────────────────────────────────────────────────────────────────
function Section({ label, color, count, desc, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: color, flexShrink: 0 }} />
        <span style={{ color, fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
        <span style={{ background: color + "20", color, border: `1px solid ${color}40`, borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{count}</span>
        {desc && <span style={{ color: C.textMuted, fontSize: 11, marginLeft: 2 }}>{desc}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function DoneSection({ tasks, onMove, onDelete, onFocus, focusedId, mobile }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 24 }}>
      <button onClick={() => setOpen((o) => !o)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, marginBottom: open ? 12 : 0, padding: 0 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: C.done, flexShrink: 0 }} />
        <span style={{ color: C.done, fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>✅ Completadas</span>
        <span style={{ background: C.done + "20", color: C.done, border: `1px solid ${C.done}40`, borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{tasks.length}</span>
        <span style={{ color: C.textMuted, fontSize: 12, marginLeft: "auto" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open &&
        tasks.map((t) => (
          <TaskCard key={t.id} task={t} onMove={onMove} onDelete={onDelete} onFocus={onFocus} focused={focusedId === t.id} mobile={mobile} />
        ))}
    </div>
  );
}

