import { sleep } from "./helpers";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks
    .filter(Boolean)
    .map((t) => ({
      id: t.id,
      text: String(t.text ?? "").trim(),
      emoji: t.emoji ?? "🎯",
      col: t.col ?? "todo",
      energy: t.energy ?? "morning",
      subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
    }))
    .filter((t) => t.text.length > 0);
}

function simulateWhatNow({ tasks, energy }) {
  const pool = tasks.filter((t) => t.col !== "done");
  const sameEnergy = pool.filter((t) => t.energy === energy);
  const candidate = (sameEnergy[0] ?? pool[0]) || null;

  if (!candidate) {
    return "Ahora mismo: añade una tarea pequeñita (2 minutos). Es el arranque, no el plan perfecto.";
  }

  const opener = pick([
    "Elige UNA cosa y empieza sin negociar:",
    "Ahora mismo, solo esto:",
    "Para salir del bloqueo, haz esto primero:",
  ]);

  return `${opener} ${candidate.emoji} ${candidate.text}. Si te cuesta, haz solo 2 minutos y decide después.`;
}

function simulateBreakIdea() {
  return pick([
    "Descanso corto: agua + 10 respiraciones lentas mirando un punto fijo. Sin pantalla.",
    "Reset: estira cuello/hombros 60s y camina por casa 2 minutos. Vuelves con más foco.",
    "Micro-descanso: abre una ventana, luz natural 1 minuto, y vuelve directo a la tarea.",
  ]);
}

function simulateSplitTask({ input }) {
  const base = input?.trim() || "esa tarea";
  const steps = [
    `Define el primer paso de 2 minutos de "${base}"`,
    "Abre lo necesario (pestaña/archivo/herramienta) y deja todo listo",
    "Haz solo la versión mínima (borrador/primer intento)",
    "Cierra con un siguiente paso claro para retomar mañana",
  ];
  return `Vale. Aquí tienes 4 microtareas:\n- ${steps.join("\n- ")}`;
}

/**
 * callClaude — Wrapper de IA.
 * En este proyecto está en modo SIMULADO (sin API externa).
 *
 * @param {{ mode: 'whatNow'|'breakIdea'|'splitTask', tasks?: any[], energy?: string, input?: string }} params
 * @returns {Promise<{ text: string }>}
 */
export async function callClaude(params) {
  const mode = params?.mode;
  const energy = params?.energy ?? "morning";
  const tasks = normalizeTasks(params?.tasks);

  // Simula latencia para UX realista.
  await sleep(350 + Math.random() * 450);

  if (mode === "breakIdea") return { text: simulateBreakIdea() };
  if (mode === "splitTask") return { text: simulateSplitTask({ input: params?.input }) };
  return { text: simulateWhatNow({ tasks, energy }) };
}

