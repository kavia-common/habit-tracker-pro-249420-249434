import React, { useEffect, useMemo, useState } from "react";

const COLOR_OPTIONS = [
  { value: "neonGreen", label: "Neon Green" },
  { value: "neonPink", label: "Neon Pink" },
  { value: "neonBlue", label: "Neon Blue" },
  { value: "neonYellow", label: "Neon Yellow" },
];

// PUBLIC_INTERFACE
export default function HabitForm({ mode, initialHabit, onCancel, onSubmit }) {
  /** Form for creating/editing habits (controlled inputs). */
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [color, setColor] = useState("neonGreen");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && initialHabit) {
      setName(initialHabit.name || "");
      setColor(initialHabit.color || "neonGreen");
    } else {
      setName("");
      setColor("neonGreen");
    }
    setError("");
  }, [isEdit, initialHabit]);

  const helpId = useMemo(() => `habit-name-help-${isEdit ? "edit" : "new"}`, [isEdit]);

  function validate() {
    const trimmed = name.trim();
    if (!trimmed) return "Name is required.";
    if (trimmed.length > 40) return "Keep it short (max 40 chars).";
    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    onSubmit({ name: name.trim(), color });
  }

  return (
    <form className="rt-card rt-card--form" onSubmit={handleSubmit}>
      <div className="rt-card__header">
        <h2 className="rt-card__title">{isEdit ? "Edit habit" : "Create habit"}</h2>
        <p className="rt-card__hint">
          {isEdit ? "Tune the name/color. Your streak stays." : "Pick something you can do daily."}
        </p>
      </div>

      <div className="rt-field">
        <label className="rt-label" htmlFor="habit-name">
          Habit name
        </label>
        <input
          id="habit-name"
          className="rt-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Read 10 pages"
          autoComplete="off"
          aria-describedby={helpId}
        />
        <div id={helpId} className="rt-help">
          Keep it actionable. You can edit later.
        </div>
      </div>

      <div className="rt-field">
        <label className="rt-label" htmlFor="habit-color">
          Color
        </label>
        <select
          id="habit-color"
          className="rt-select"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        >
          {COLOR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rt-alert" role="alert">
          {error}
        </div>
      ) : null}

      <div className="rt-actions">
        {onCancel ? (
          <button type="button" className="rt-btn rt-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}

        <button type="submit" className="rt-btn rt-btn--primary">
          {isEdit ? "Save changes" : "Add habit"}
        </button>
      </div>
    </form>
  );
}
