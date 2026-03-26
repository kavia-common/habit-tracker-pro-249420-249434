/**
 * Habit domain utilities:
 * - Normalize dates (local timezone) for consistent day keys.
 * - Compute streaks based on completion date keys.
 * - Provide simple data model helpers.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns a YYYY-MM-DD key for the user's local timezone.
 * @param {Date} date
 * @returns {string}
 */
function toLocalDateKey(date) {
  const d = new Date(date);
  // Normalize to local "date" by using local fields
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns today's local YYYY-MM-DD key.
 * @returns {string}
 */
function todayKey() {
  return toLocalDateKey(new Date());
}

/**
 * Parses YYYY-MM-DD into a Date at local midnight.
 * @param {string} key
 * @returns {Date}
 */
function dateKeyToLocalMidnight(key) {
  const [y, m, d] = key.split("-").map((v) => Number(v));
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Returns a new date key offset by N days from the given key.
 * @param {string} key
 * @param {number} deltaDays
 * @returns {string}
 */
function addDaysToKey(key, deltaDays) {
  const base = dateKeyToLocalMidnight(key);
  const next = new Date(base.getTime() + deltaDays * DAY_MS);
  return toLocalDateKey(next);
}

/**
 * Calculates the current streak:
 * - If completed today, streak counts backward from today.
 * - Otherwise, counts backward from yesterday if yesterday is completed (i.e., the streak is still "current").
 * - Otherwise 0.
 *
 * @param {Record<string, true>} completionsByDateKey
 * @param {string} [nowKey]
 * @returns {number}
 */
function calculateCurrentStreak(completionsByDateKey, nowKey = todayKey()) {
  if (!completionsByDateKey) return 0;

  const hasToday = Boolean(completionsByDateKey[nowKey]);
  const yesterdayKey = addDaysToKey(nowKey, -1);

  let cursor = hasToday ? nowKey : yesterdayKey;
  if (!completionsByDateKey[cursor]) return 0;

  let streak = 0;
  while (completionsByDateKey[cursor]) {
    streak += 1;
    cursor = addDaysToKey(cursor, -1);
  }
  return streak;
}

/**
 * Calculates the longest streak over all completions.
 * @param {Record<string, true>} completionsByDateKey
 * @returns {number}
 */
function calculateBestStreak(completionsByDateKey) {
  if (!completionsByDateKey) return 0;

  const keys = Object.keys(completionsByDateKey).sort(); // YYYY-MM-DD lexicographic sorts by date
  if (keys.length === 0) return 0;

  let best = 0;
  let run = 0;
  let prevKey = null;

  for (const key of keys) {
    if (!prevKey) {
      run = 1;
    } else {
      const expected = addDaysToKey(prevKey, 1);
      run = key === expected ? run + 1 : 1;
    }
    best = Math.max(best, run);
    prevKey = key;
  }

  return best;
}

/**
 * Determines whether a habit is completed today.
 * @param {Record<string, true>} completionsByDateKey
 * @param {string} [nowKey]
 * @returns {boolean}
 */
function isCompletedToday(completionsByDateKey, nowKey = todayKey()) {
  return Boolean(completionsByDateKey && completionsByDateKey[nowKey]);
}

/**
 * Creates a new habit object.
 * @param {{name: string, color?: string}} input
 * @returns {{id: string, name: string, color: string, createdAt: string, completionsByDate: Record<string, true>}}
 */
function createHabit(input) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `h_${Math.random().toString(16).slice(2)}_${Date.now()}`;

  return {
    id,
    name: input.name.trim(),
    color: input.color || "neonGreen",
    createdAt: new Date().toISOString(),
    completionsByDate: {},
  };
}

export {
  toLocalDateKey,
  todayKey,
  addDaysToKey,
  calculateCurrentStreak,
  calculateBestStreak,
  isCompletedToday,
  createHabit,
};
