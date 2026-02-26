// designed by alongio
import React, { useEffect, useMemo, useRef, useState } from "react";
import { LaserFlow } from "./LaserFlow";

function isValidEmail(value: string) {
  const v = value.trim();
  if (!v) return false;

  // HTML5-ish check via input validity (browser-grade)
  const tmp = document.createElement("input");
  tmp.type = "email";
  tmp.value = v;
  if (tmp.checkValidity()) return true;

  // fallback
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function ContactGate() {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const okEmail = useMemo(() => isValidEmail(email), [email]);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const firstRef = useRef<HTMLInputElement | null>(null);

  const openModal = () => {
    if (!okEmail) return;
    setIsOpen(true);

    requestAnimationFrame(() => {
      firstRef.current?.focus();
    });
  };

  const closeModal = () => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      // focus back to email input
      const el = document.getElementById("cg-email") as HTMLInputElement | null;
      el?.focus();
    });
  };

  // ESC closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("email", email.trim());

    const payload = Object.fromEntries(data.entries());
    console.log("SUBMIT payload:", payload);

    alert("Inviato! (demo)\nControlla la console per il payload.");
    closeModal();
  };

  return (
    <section className="cgPage" aria-label="Contact gate" id="contacts">
      <div className="cgVolcanoBg" aria-hidden="true" />
      <header className="cgHeader">
        <h1 className="cgH1">
          Sei pronto a 
          <br />
            Correre con noi?
        </h1>
      </header>

      <LaserFlow
        color="#A80000"
        horizontalSizing={1.24}
        verticalSizing={1.2}
        wispDensity={5}
        wispSpeed={12}
        wispIntensity={0}
        horizontalBeamOffset={0.0}
        verticalBeamOffset={-0.5}
      />

      <main className="cgHero">
        <div className="cgGate">
          <div className="cgParenRow" aria-label="Email input">
            <span className="cgParen" aria-hidden="true">
              [
            </span>

            <input
              id="cg-email"
              className="cgEmailInput"
              type="email"
              autoComplete="email"
              placeholder="Inserisci la tua Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (okEmail) openModal();
                }
              }}
            />

            <span className="cgParen" aria-hidden="true">
              ]
            </span>
          </div>

          <div className="cgActions">
            <button className="cgBtn" disabled={!okEmail} onClick={openModal}>
              Continua
            </button>
          </div>

          <div className="cgHint" aria-live="polite">
            {!email.trim()
              ? ""
              : okEmail
              ? ""
              : "Inserisci un'email valida (es. nome@dominio.com)."}
          </div>
        </div>
      </main>

      <div className="cgDivider" aria-hidden="true" />

      <footer className="cgFooter">
        <div className="cgFootRow">
          <div>
            <div className="cgFootSmall">
              CONTATTACI PER
              <br />
              SAPERNE DI PIÙ.
            </div>
          </div>

          <div className="cgFootCenter">

          </div>

          <div className="cgFootRight">
            <div className="cgFootSmall">CONTATTI GENERALI</div>
            <div className="cgFootBig">fsc_generale@outlook.it</div>
          </div>
        </div>
      </footer>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`cgOverlay ${isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Contact details form"
      >
        <div className="cgDialogWrap">
          <button className="cgClose" type="button" aria-label="Close form" onClick={closeModal}>
            <span className="cgX" aria-hidden="true" />
          </button>

          <div ref={cardRef} className="cgCard" tabIndex={-1}>
            <p className="cgCardTitle">
              Perfetto. Solo alcune domande per indirizzare la tua richiesta.
            </p>

            <form className="cgForm" onSubmit={onSubmit} noValidate>
              <div className="cgGrid">
                <div className="cgField">
                  <div className="cgLabel">NOME</div>
                  <input ref={firstRef} className="cgInput" name="firstName" autoComplete="given-name" />
                </div>

                <div className="cgField">
                  <div className="cgLabel">COGNOME</div>
                  <input className="cgInput" name="lastName" autoComplete="family-name" />
                </div>

                <div className="cgField cgFull">
                  <div className="cgLabel">CORSO DI LAUREA</div>
                  <input className="cgInput" name="corso" autoComplete="organization" />
                </div>

                <div className="cgField cgFull">
                  <div className="cgLabel">REPARTO</div>
                  <select className="cgSelect" name="reparto" defaultValue="">
                    <option value="" disabled>
                      Seleziona un reparto…
                    </option>
                    <option>Telaio</option>
                    <option>Motore</option>
                    <option>Sospensioni</option>
                    <option>Aerodinamica</option>
                    <option>Elettronica</option>
                    <option>Informatica</option>
                    <option>Marketing</option>
                    <option>Management</option>
                    <option>Altro</option>
                  </select>
                </div>

                <div className="cgField cgFull">
                  <div className="cgLabel">MESSAGGIO</div>
                  <textarea className="cgTextarea" name="message" />
                </div>
              </div>

              <div
                className="cgMetaEmail"
                dangerouslySetInnerHTML={{ __html: `Email utilizzata: <b>${escapeHtml(email.trim())}</b>` }}
              />

              <button className="cgSubmit" type="submit">
                Invia
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}