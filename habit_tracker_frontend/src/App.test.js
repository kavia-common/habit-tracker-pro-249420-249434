import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { STORAGE_KEY } from "./utils/storage";

/**
 * Test helpers
 */
function setPersistedHabits(habits) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      habits,
      updatedAt: new Date().toISOString(),
    })
  );
}

function makeHabit({
  id = "h_1",
  name = "Read",
  color = "neonGreen",
  createdAt = "2024-01-01T00:00:00.000Z",
  completionsByDate = {},
} = {}) {
  return { id, name, color, createdAt, completionsByDate };
}

describe("Retro Habit Tracker - core behavior", () => {
  beforeEach(() => {
    // Ensure each test starts with a clean storage state.
    window.localStorage.clear();

    // Avoid unexpected confirm dialogs from delete flows (not tested here).
    jest.spyOn(window, "confirm").mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders retro habit tracker title", () => {
    render(<App />);
    const heading = screen.getByRole("heading", { name: /retro habit tracker/i });
    expect(heading).toBeInTheDocument();
  });

  test("renders empty state when no habits exist", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /your habits/i })).toBeInTheDocument();
    expect(screen.getByText(/0 total/i)).toBeInTheDocument();

    const empty = screen.getByRole("region", { name: /no habits yet/i });
    expect(within(empty).getByText(/create your first habit/i)).toBeInTheDocument();
  });

  test("renders habit list from localStorage on load", () => {
    setPersistedHabits([
      makeHabit({ id: "h_a", name: "Read 10 pages", color: "neonGreen" }),
      makeHabit({ id: "h_b", name: "Walk", color: "neonBlue" }),
    ]);

    render(<App />);

    expect(screen.getByText(/2 total/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /habit: read 10 pages/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /habit: walk/i })).toBeInTheDocument();
  });

  test("create habit flow: adds habit and persists to localStorage", async () => {
    const user = userEvent.setup();

    const setItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem");

    render(<App />);

    // Fill the form
    await user.type(screen.getByLabelText(/habit name/i), "Meditate");
    await user.selectOptions(screen.getByLabelText(/color/i), "neonPink");
    await user.click(screen.getByRole("button", { name: /add habit/i }));

    // List should now contain the habit
    expect(screen.getByText(/1 total/i)).toBeInTheDocument();
    const card = screen.getByRole("region", { name: /habit: meditate/i });
    expect(within(card).getByRole("heading", { name: /meditate/i })).toBeInTheDocument();

    // Also confirms it wrote to localStorage using the expected key
    expect(setItemSpy).toHaveBeenCalled();
    const lastCall = setItemSpy.mock.calls[setItemSpy.mock.calls.length - 1];
    expect(lastCall[0]).toBe(STORAGE_KEY);

    const persisted = JSON.parse(lastCall[1]);
    expect(persisted).toEqual(
      expect.objectContaining({
        version: 1,
        habits: expect.any(Array),
        updatedAt: expect.any(String),
      })
    );
    expect(persisted.habits[0]).toEqual(
      expect.objectContaining({
        name: "Meditate",
        color: "neonPink",
        completionsByDate: {},
        id: expect.any(String),
        createdAt: expect.any(String),
      })
    );
  });

  test("toggle completion for today: updates status/streaks and persists to localStorage", async () => {
    const user = userEvent.setup();

    // Fix time so that "todayKey" is deterministic (local date key derived from Date()).
    // Using midday avoids potential DST edge cases across environments.
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));

    try {
      setPersistedHabits([
        makeHabit({
          id: "h_1",
          name: "Drink water",
          color: "neonGreen",
          completionsByDate: {
            // Yesterday completion should yield current=1 until today is checked in.
            "2024-06-14": true,
          },
        }),
      ]);

      const setItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem");

      render(<App />);

      const card = screen.getByRole("region", { name: /habit: drink water/i });

      // Pre-toggle: not completed today, current streak should still be 1 (yesterday)
      expect(within(card).getByText(/not yet/i)).toBeInTheDocument();

      const stats = within(card).getByLabelText(/streak stats/i);
      // There are two stat boxes with values; we assert current=1 and best=1
      expect(within(stats).getByText("Current")).toBeInTheDocument();
      expect(within(stats).getByText("Best")).toBeInTheDocument();
      // Both Current and Best show "1" here; ensure we match both values unambiguously.
      expect(within(stats).getAllByText("1")).toHaveLength(2);

      // Toggle today on
      await user.click(within(card).getByRole("button", { name: /check in \(today\)/i }));

      expect(within(card).getByText(/done today/i)).toBeInTheDocument();
      expect(within(card).getByRole("button", { name: /undo today/i })).toBeInTheDocument();

      // After toggle: current should now be 2 (yesterday + today), best should be 2.
      // Since the UI renders both stats as plain numbers, we check that a "2" appears.
      expect(within(stats).getAllByText("2")).toHaveLength(2);

      // Persisted state should include today's completion key
      const lastCall = setItemSpy.mock.calls[setItemSpy.mock.calls.length - 1];
      const persisted = JSON.parse(lastCall[1]);
      const persistedHabit = persisted.habits.find((h) => h.id === "h_1");
      expect(persistedHabit.completionsByDate).toEqual(
        expect.objectContaining({
          "2024-06-14": true,
          "2024-06-15": true,
        })
      );

      // Toggle today off
      await user.click(within(card).getByRole("button", { name: /undo today/i }));
      expect(within(card).getByText(/not yet/i)).toBeInTheDocument();

      const lastCall2 = setItemSpy.mock.calls[setItemSpy.mock.calls.length - 1];
      const persisted2 = JSON.parse(lastCall2[1]);
      const persistedHabit2 = persisted2.habits.find((h) => h.id === "h_1");
      expect(persistedHabit2.completionsByDate).toEqual(
        expect.objectContaining({
          "2024-06-14": true,
        })
      );
      expect(persistedHabit2.completionsByDate["2024-06-15"]).toBeUndefined();
    } finally {
      jest.useRealTimers();
    }
  });

  test("streak calculation: best streak reflects longest run across all time", () => {
    // We don't need to freeze time here because best streak doesn't depend on nowKey.
    setPersistedHabits([
      makeHabit({
        id: "h_1",
        name: "Practice guitar",
        completionsByDate: {
          // A 2-day run in Jan
          "2024-01-01": true,
          "2024-01-02": true,
          // A 3-day run in Feb (best)
          "2024-02-10": true,
          "2024-02-11": true,
          "2024-02-12": true,
        },
      }),
    ]);

    render(<App />);

    const card = screen.getByRole("region", { name: /habit: practice guitar/i });
    const stats = within(card).getByLabelText(/streak stats/i);

    // Best should be 3.
    // We anchor via the "Best" label and ensure a "3" appears within the stats area.
    expect(within(stats).getByText("Best")).toBeInTheDocument();
    expect(within(stats).getByText("3")).toBeInTheDocument();
  });
});
