# AGENT.md — FocusFlow ADHD Planner

Instrucciones para agentes IA (Claude, Cursor, Copilot, etc.) que trabajen en este proyecto.

---

## Contexto del producto

FocusFlow es una app de productividad para adultos con TDAH. **No es una to-do list genérica.**

El usuario tiene dificultades reales con:
- Iniciar tareas (parálisis por inicio)
- Gestionar la atención y el cambio de contexto
- Percibir el tiempo transcurrido
- Priorizar cuando hay múltiples opciones visibles

Toda decisión de diseño y código debe pasar por este filtro: **¿reduce fricción cognitiva o la aumenta?**

---

## Principios de UX que NO debes romper

1. **Una cosa a la vez** — Nunca añadas más de una acción principal por pantalla
2. **Cero tabs en la vista principal** — El usuario con TDAH pierde contexto al cambiar de vista
3. **Feedback inmediato** — Toda acción debe tener respuesta visual en < 150ms
4. **Textos cortos** — Labels máximo 3 palabras. Instrucciones máximo 1 frase
5. **Jerarquía clara de color** — Los colores de energía (morning/afternoon/lowEnergy) son semánticos, no decorativos. No los cambies sin revisar toda la UI
6. **El estado "doing" es sagrado** — Solo puede haber UNA tarea en doing en un momento dado (a implementar)

---

## Arquitectura del código

### Design tokens
Todos los colores están en `src/constants/colors.js` como objeto `C`. **Nunca uses colores hardcodeados** fuera de ese archivo.

```js
// ✅ Correcto
color: C.focus

// ❌ Incorrecto
color: "#10F5A0"
```

### Componentes
- Cada componente en su propio archivo bajo `src/components/`
- Props tipadas con PropTypes o JSDoc, no TypeScript (MVP, mantén simple)
- Sin librerías de estilos externas — CSS-in-JS inline por ahora

### Hooks personalizados
La lógica de negocio va en hooks, no en componentes:
- `useTasks` — CRUD de tareas, filtros, estado de foco
- `useTimer` — Lógica del Pomodoro (intervals, fases, sesiones)
- `useResponsive` — `isMobile` basado en resize listener

### Claude API
El cliente está en `src/lib/claude.js`. Todas las llamadas pasan por ahí.

```js
// Siempre usar el wrapper, nunca fetch directo en componentes
import { callClaude } from '../lib/claude'
```

**Prompts importantes:**
- Los prompts de IA deben mencionar explícitamente "TDAH adulto" para que el modelo calibre bien el tono
- Las respuestas de IA deben ser cortas: máximo 3 frases o 4 items en lista
- El idioma es español, tono directo y sin condescendencia

---

## Convenciones de código

```js
// Nombres de componentes: PascalCase
function TaskCard({ task, onMove }) { ... }

// Nombres de funciones: camelCase con verbo
function handleFocus(id) { ... }
function moveTask(id, col) { ... }

// Constantes: UPPER_SNAKE_CASE
const ENERGY_BLOCKS = [...]
const FOCUS_PRESETS = [5, 10, 15, 25, 45]

// Estilos inline: objeto en la misma línea si < 3 props, multilínea si más
// ✅ Corto
<div style={{ display: "flex", gap: 8 }}>

// ✅ Largo — multilínea con lógica clara
<div style={{
  background: focused ? C.surfaceUp : C.surface,
  border: `1.5px solid ${focused ? C.focus : C.border}`,
  borderRadius: 16,
  transition: "all 0.2s ease",
}}>
```

---

## Estado de las tareas

```
todo → doing → done
 ↑_______________|   (se puede descompletar)
```

Campos de una tarea:
```js
{
  id: number,          // Date.now() en MVP, UUID con Supabase
  text: string,        // Texto de la tarea
  emoji: string,       // Un emoji como identificador visual
  col: 'todo' | 'doing' | 'done',
  energy: 'morning' | 'afternoon' | 'lowEnergy',
  subtasks: string[],  // Generadas por IA, opcional
  priority: 'high' | 'medium' | 'low'  // Sin usar en UI todavía
}
```

---

## Lo que está en progreso (no romper)

- `FocusMode` overlay — depende de `focusedId` en el estado del App
- `burst()` confetti — depende de `ref` en `TaskCard` para coordenadas
- `AIPanel` — gestiona su propio estado local (mode, loading, result). No mover a contexto global todavía

---

## Lo que viene después (no anticipar)

No añadas estas features todavía aunque parezca obvio. Esperan validación:
- Auth / login
- Base de datos real (Supabase)
- Notificaciones push
- Dark/light mode toggle

---

## Comandos útiles

```bash
npm run dev          # Desarrollo local en localhost:5173
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # ESLint
```

---

## Si encuentras algo roto

1. Primero revisa que las env vars estén correctas en `.env.local`
2. La API key de Anthropic no funciona en localhost si CORS no está configurado — usa un proxy o Vercel Edge Functions
3. El confetti (`burst()`) falla silenciosamente en SSR — está protegido con `typeof document !== "undefined"`

---

## Contacto del proyecto

Proyecto personal. Si tienes dudas sobre decisiones de producto (no de código), consulta siempre el contexto del usuario objetivo: adulto con TDAH, probablemente ha probado Notion, Todoist y Things y ninguno ha funcionado para él.