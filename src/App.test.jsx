import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App.jsx";

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "ff_user",
      JSON.stringify({ id: "test-user", email: "test@example.com" }),
    );
  });

  it("renderiza el tablero principal cuando hay usuario guardado", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/FocusFlow/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/pendientes/i)).toBeInTheDocument();
  });

  it("muestra la tarjeta del asistente IA simulado", async () => {
    render(<App />);

    const panelTitle = await screen.findByText(/asistente ia/i);
    expect(panelTitle).toBeInTheDocument();
  });
});

