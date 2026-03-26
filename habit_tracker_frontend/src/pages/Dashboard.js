import React, { useMemo, useState } from "react";
import HabitCard from "../components/HabitCard";
import HabitForm from "../components/HabitForm";
import { useHabits } from "../hooks/useHabits";

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Main dashboard: create habit, list habits, daily check-ins, edit/delete. */
  const { habits, addHabit, updateHabit, deleteHabit, toggleToday } = useHabits();

  const [editingId, setEditingId] = useState(null);

  const editingHabit = useMemo(
    () => (editingId ? habits.find((h) => h.id === editingId) : null),
    [editingId, habits]
  );

  function handleCreate(payload) {
    addHabit(payload);
  }

  function handleSave(payload) {
    if (!editingId) return;
    updateHabit(editingId, { name: payload.name, color: payload.color });
    setEditingId(null);
  }

  function handleDelete(id) {
    const habit = habits.find((h) => h.id === id);
    const ok = window.confirm(`Delete "${habit ? habit.name : "this habit"}"? This cannot be undone.`);
    if (!ok) return;
    if (editingId === id) setEditingId(null);
    deleteHabit(id);
  }

  return (
    <div className="rt-grid">
      <div className="rt-col rt-col--left">
        {editingHabit ? (
          <HabitForm
            mode="edit"
            initialHabit={editingHabit}
            onCancel={() => setEditingId(null)}
            onSubmit={handleSave}
          />
        ) : (
          <HabitForm mode="create" onSubmit={handleCreate} />
        )}

        <section className="rt-card rt-card--info" aria-label="How streaks work">
          <h2 className="rt-card__title">How streaks work</h2>
          <ul className="rt-list">
            <li>
              <strong>Current</strong> counts consecutive days ending today (or yesterday if you
              haven't checked in today yet).
            </li>
            <li>
              <strong>Best</strong> is your longest consecutive run ever.
            </li>
          </ul>
        </section>
      </div>

      <div className="rt-col rt-col--right">
        <div className="rt-panelHeader">
          <h2 className="rt-panelTitle">Your habits</h2>
          <div className="rt-panelMeta">
            <span className="rt-chip">{habits.length} total</span>
          </div>
        </div>

        {habits.length === 0 ? (
          <section className="rt-card rt-card--empty" aria-label="No habits yet">
            <h3 className="rt-card__title">No habits yet</h3>
            <p className="rt-card__hint">Create your first habit to begin your retro streak quest.</p>
          </section>
        ) : (
          <div className="rt-habitList">
            {habits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                onToggleToday={toggleToday}
                onEdit={(id) => setEditingId(id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
