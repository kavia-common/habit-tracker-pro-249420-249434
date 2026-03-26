import { useEffect, useMemo, useReducer } from "react";
import { loadState, saveState } from "../utils/storage";
import { createHabit, todayKey } from "../utils/habits";

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
 * @typedef {{ habits: Habit[] }} HabitsState
 */

function initFromStorage() {
  const persisted = loadState();
  return { habits: persisted.habits };
}

/**
 * @param {HabitsState} state
 * @param {any} action
 * @returns {HabitsState}
 */
function reducer(state, action) {
  switch (action.type) {
    case "habit/add": {
      const habit = createHabit({ name: action.payload.name, color: action.payload.color });
      return { habits: [habit, ...state.habits] };
    }
    case "habit/update": {
      const { id, patch } = action.payload;
      return {
        habits: state.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      };
    }
    case "habit/delete": {
      const { id } = action.payload;
      return { habits: state.habits.filter((h) => h.id !== id) };
    }
    case "habit/toggleToday": {
      const { id, nowKey } = action.payload;
      return {
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const key = nowKey || todayKey();
          const next = { ...(h.completionsByDate || {}) };

          if (next[key]) {
            delete next[key];
          } else {
            next[key] = true;
          }
          return { ...h, completionsByDate: next };
        }),
      };
    }
    case "habit/clearCompletions": {
      const { id } = action.payload;
      return {
        habits: state.habits.map((h) => (h.id === id ? { ...h, completionsByDate: {} } : h)),
      };
    }
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function useHabits() {
  /** Hook managing habits with localStorage persistence. */
  const [state, dispatch] = useReducer(reducer, undefined, initFromStorage);

  // Persist on any change
  useEffect(() => {
    saveState({ version: 1, habits: state.habits, updatedAt: new Date().toISOString() });
  }, [state.habits]);

  const actions = useMemo(() => {
    return {
      addHabit: (payload) => dispatch({ type: "habit/add", payload }),
      updateHabit: (id, patch) => dispatch({ type: "habit/update", payload: { id, patch } }),
      deleteHabit: (id) => dispatch({ type: "habit/delete", payload: { id } }),
      toggleToday: (id, nowKey) =>
        dispatch({ type: "habit/toggleToday", payload: { id, nowKey } }),
      clearCompletions: (id) => dispatch({ type: "habit/clearCompletions", payload: { id } }),
    };
  }, []);

  return { habits: state.habits, ...actions };
}
