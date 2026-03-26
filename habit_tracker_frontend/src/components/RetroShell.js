import React from "react";
import "../styles/retro.css";

/**
 * RetroShell provides the app layout and retro background frame.
 * @param {{title: string, subtitle?: string, children: React.ReactNode}} props
 */
export default function RetroShell({ title, subtitle, children }) {
  return (
    <div className="rt-app">
      <header className="rt-topbar" role="banner">
        <div className="rt-topbar__brand">
          <div className="rt-badge" aria-hidden="true">
            CRT
          </div>
          <div>
            <h1 className="rt-title">{title}</h1>
            {subtitle ? <p className="rt-subtitle">{subtitle}</p> : null}
          </div>
        </div>

        <div className="rt-topbar__right" aria-hidden="true">
          <span className="rt-chip">LOCAL</span>
          <span className="rt-chip">OFFLINE</span>
          <span className="rt-chip">v1</span>
        </div>
      </header>

      <main className="rt-main" role="main">
        {children}
      </main>

      <footer className="rt-footer" role="contentinfo">
        <span>Tip: Check in daily to grow your streak.</span>
        <span className="rt-footer__sep" aria-hidden="true">
          •
        </span>
        <span>Data stays in your browser (localStorage).</span>
      </footer>
    </div>
  );
}
