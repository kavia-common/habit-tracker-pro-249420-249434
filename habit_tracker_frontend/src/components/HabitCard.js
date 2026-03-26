import React, { useMemo } from "react";
import {
  calculateBestStreak,
  calculateCurrentStreak,
  isCompletedToday,
  todayKey,
} from "../utils/habits";

const COLOR_CLASS = {
  neonGreen: "rt-accent--green",
  neonPink: "rt-accent--pink",
  neonBlue: "rt-accent--blue",
  neonYellow: "rt-accent--yellow",
};

/**
 * @param {{
 *  habit: {id: string, name: string, color: string, completionsByDate: Record<string, true>},
 *  onToggleToday: (id: string, nowKey: string) => void,
 *  onEdit: (id: string) => void,
 *  onDelete: (id: string) => void
 * }} props
 */
export default function HabitCard({ habit, onToggleToday, onEdit, onDelete }) {
  const nowKey = useMemo(() => todayKey(), []);
  const doneToday = isCompletedToday(habit.completionsByDate, nowKey);
  const current = calculateCurrentStreak(habit.completionsByDate, nowKey);
  const best = calculateBestStreak(habit.completionsByDate);

  const accentClass = COLOR_CLASS[habit.color] || COLOR_CLASS.neonGreen;

  return (
    <section className={`rt-card rt-card--habit ${accentClass}`} aria-label={`Habit: ${habit.name}`}>
      <div className="rt-habit__top">
        <div className="rt-habit__titleRow">
          <h3 className="rt-habit__title">{habit.name}</h3>
          <span className={`rt-status ${doneToday ? "rt-status--on" : "rt-status--off"}`}>
            {doneToday ? "DONE TODAY" : "NOT YET"}
          </span>
        </div>

        <div className="rt-habit__stats" aria-label="Streak stats">
          <div className="rt-stat">
            <div className="rt-stat__label">Current</div>
            <div className="rt-stat__value">{current}</div>
          </div>
          <div className="rt-stat">
            <div className="rt-stat__label">Best</div>
            <div className="rt-stat__value">{best}</div>
          </div>
        </div>
      </div>

      <div className="rt-habit__actions">
        <button
          type="button"
          className={`rt-btn ${doneToday ? "rt-btn--success" : "rt-btn--primary"}`}
          onClick={() => onToggleToday(habit.id, nowKey)}
          aria-pressed={doneToday}
        >
          {doneToday ? "Undo today" : "Check in (today)"}
        </button>

        <button type="button" className="rt-btn rt-btn--ghost" onClick={() => onEdit(habit.id)}>
          Edit
        </button>

        <button
          type="button"
          className="rt-btn rt-btn--danger"
          onClick={() => onDelete(habit.id)}
        >
          Delete
        </button>
      </div>
    </section>
  );
}
