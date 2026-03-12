import { useEffect, useMemo, useState } from "react";
import { EMOJIS } from "../constants/config";

function randEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function load() {
  try {
    const raw = localStorage.getItem("focusflow.tasks.v1");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function save(tasks) {
  try {
    localStorage.setItem("focusflow.tasks.v1", JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState(() => load() ?? []);
  const [focusedId, setFocusedId] = useState(() => null);

  useEffect(() => save(tasks), [tasks]);

  const doingId = useMemo(() => tasks.find((t) => t.col === "doing")?.id ?? null, [tasks]);

  function addTask({ text, energy }) {
    const cleaned = String(text ?? "").trim();
    if (!cleaned) return;

    const id = Date.now() + Math.floor(Math.random() * 1000);
    const task = {
      id,
      text: cleaned,
      emoji: randEmoji(),
      col: "todo",
      energy,
      subtasks: [],
      priority: "medium",
    };
    setTasks((prev) => [task, ...prev]);
  }

  function setDoing(id) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) return { ...t, col: "doing" };
        if (t.col === "doing") return { ...t, col: "todo" };
        return t;
      }),
    );
    setFocusedId(id);
  }

  function moveTask(id, col) {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, col } : t));
      // regla: solo un doing
      const doing = next.filter((t) => t.col === "doing");
      if (doing.length > 1) {
        const [keep, ...rest] = doing;
        return next.map((t) => (rest.some((r) => r.id === t.id) ? { ...t, col: "todo" } : t.id === keep.id ? keep : t));
      }
      return next;
    });

    if (col === "done" && focusedId === id) setFocusedId(null);
  }

  function toggleDone(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    moveTask(id, t.col === "done" ? "todo" : "done");
  }

  function setSubtasks(id, subtasks) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, subtasks: Array.isArray(subtasks) ? subtasks : [] } : t)),
    );
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (focusedId === id) setFocusedId(null);
  }

  return {
    tasks,
    focusedId,
    setFocusedId,
    doingId,
    addTask,
    moveTask,
    toggleDone,
    setDoing,
    setSubtasks,
    removeTask,
  };
}

