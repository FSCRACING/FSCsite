import React from "react";

export default function LoaderOverlay({ off }: { off: boolean }) {
  return (
    <div className={`loader ${off ? "is-off" : ""}`} aria-live="polite" aria-busy={!off}>
      <div className="loaderBox">
        <div className="loadTitle">Loading</div>
        <div className="dots" aria-hidden="true">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
        <p className="loadSub">Sto preparando la scena…</p>
      </div>
    </div>
  );
}
