import React from "react";
import RetroShell from "./components/RetroShell";
import Dashboard from "./pages/Dashboard";

// PUBLIC_INTERFACE
function App() {
  /** App root for the retro habit tracker (local-only persistence). */
  return (
    <RetroShell title="Retro Habit Tracker" subtitle="Build streaks. Save locally. Stay consistent.">
      <Dashboard />
    </RetroShell>
  );
}

export default App;
