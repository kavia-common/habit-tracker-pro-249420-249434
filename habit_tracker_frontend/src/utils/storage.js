/**
 * Storage helpers for local persistence.
 * Uses a versioned envelope to allow safe future migrations.
 */

const STORAGE_KEY = "retro-habit-tracker:v1";

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   color: string,
 *   createdAt: string,
 *   completionsByDate: Record<string, true>
 * }} Habit
 */

/**
 * @typedef {{
 *   version: 1,
 *   habits: Habit[],
 *   updatedAt: string
 * }} PersistedStateV1
 */

/**
 * @returns {PersistedStateV1}
 */
function defaultState() {
  return {
    version: 1,
    habits: [],
    updatedAt: new Date(0).toISOString(),
  };
}

/**
 * @param {unknown} raw
 * @returns {PersistedStateV1}
 */
function normalizeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;

  // eslint-disable-next-line no-prototype-builtins
  const maybeVersion = raw.hasOwnProperty("version") ? raw.version : 1;
  if (maybeVersion !== 1) return base;

  const habits = Array.isArray(raw.habits) ? raw.habits : [];
  const normalizedHabits = habits
    .map((h) => {
      if (!h || typeof h !== "object") return null;
      if (typeof h.id !== "string" || typeof h.name !== "string") return null;

      const color = typeof h.color === "string" ? h.color : "neonGreen";
      const createdAt = typeof h.createdAt === "string" ? h.createdAt : new Date().toISOString();
      const completionsByDate =
        h.completionsByDate && typeof h.completionsByDate === "object" ? h.completionsByDate : {};

      // Only keep boolean-ish true values; store as { [key]: true }
      const cleaned = {};
      for (const [k, v] of Object.entries(completionsByDate)) {
        if (v) cleaned[k] = true;
      }

      return {
        id: h.id,
        name: h.name,
        color,
        createdAt,
        completionsByDate: cleaned,
      };
    })
    .filter(Boolean);

  return {
    version: 1,
    habits: normalizedHabits,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : base.updatedAt,
  };
}

/**
 * Loads state from localStorage.
 * @returns {PersistedStateV1}
 */
function loadState() {
  try {
    const str = window.localStorage.getItem(STORAGE_KEY);
    if (!str) return defaultState();
    const parsed = JSON.parse(str);
    return normalizeState(parsed);
  } catch {
    return defaultState();
  }
}

/**
 * Saves state to localStorage.
 * @param {PersistedStateV1} state
 */
function saveState(state) {
  try {
    const envelope = {
      ...state,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Intentionally ignore storage write failures (quota, private mode, etc.)
  }
}

export { STORAGE_KEY, loadState, saveState };
