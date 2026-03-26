import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders retro habit tracker title", () => {
  render(<App />);
  const heading = screen.getByRole("heading", { name: /retro habit tracker/i });
  expect(heading).toBeInTheDocument();
});
