// designed by alongio
import { useState } from "react";
import "./ElectricPage.css";
// @ts-ignore - Lightning is a JSX component
import Lightning from "./Lightning";
// @ts-ignore - FaultyTerminal is a JSX component
import FaultyTerminal from "./FaultyTerminal";
import ContactGate from "./Contacts";
import FscFooter from "./FscFooter";
import PageDrawerMenu from "./PageDrawerMenu";
import DepartmentMembers from "./DepartmentMembers";

interface DetailItem {
  title: string;
  desc: string;
  img: string;
}

interface ElectricPageProps {
  onNavigate: (page: string) => void;
}

export default function ElectricPage({ onNavigate }: ElectricPageProps) {
  const [selectedDetail, setSelectedDetail] = useState<DetailItem | null>(null);

  const hvItems: DetailItem[] = [
    {
      title: "Accumulator — Pack design & layout",
      desc: "Progettazione meccanica del box accumulatori, selezione celle, interconnessioni e raffreddamento. Packaging e integrazione nel telaio. Integrazione e sviluppo inverter.",
      img: "/images/collage-elect/battery.jpg"
    },
    {
      title: "BMS & Sensing",
      desc: "Battery Management System custom: monitoraggio tensioni, correnti, temperature. Bilanciamento celle e comunicazione CAN con ECU. Protezione da sovra/sotto-carica e temperatura eccessiva.",
      img: "/images/collage-elect/bms.jpg"
    },
    {
      title: "HV Safety & Shutdown",
      desc: "Catena TSAC, IMD, AIRs, fusibili e interruttori rapidi. Isolamento HV, interlock e protezioni da cortocircuito. Integrazione BSPD e sensori di impatto.",
      img: "/images/collage-elect/hv-safety.jpg"
    }
  ];

  const glvItems: DetailItem[] = [
    {
      title: "ECU & Data Acquisition",
      desc: "Centralina elettronica basata su microcontroller STM32. Gestione sensori, attuatori e CAN Bus. Logging dati in tempo reale e telemetria.",
      img: "/images/collage-elect/ecu.jpg"
    },
    {
      title: "Wiring & PCB Design",
      desc: "Progettazione schede elettroniche custom per distribuzione alimentazione 12V/5V. Layout cablaggi LV conformi a regolamento. Design PCB multi-layer per ridurre EMI.",
      img: "/images/collage-elect/pcb.jpg"
    },
    {
      title: "Dashboard & HMI",
      desc: "Display TFT per pilota con dati in tempo reale: velocità, batteria, temperature. Interfaccia touch-screen per configurazione parametri. Indicatori LED di stato e allarmi.",
      img: "/images/collage-elect/dashboard.jpg"
    }
  ];

  const openDetail = (item: DetailItem) => {
    setSelectedDetail(item);
  };

  const closeDetail = () => {
    setSelectedDetail(null);
  };

  const renderCard = (item: DetailItem) => (
    <article
      key={item.title}
      className="card1-feat"
      tabIndex={0}
      onClick={() => openDetail(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail(item);
        }
      }}
    >
      <div className="img-feat">
        <img src={item.img} alt={item.title} onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
      </div>
      <div className="meta-feat">
        <div className="role-feat">Approfondimento</div>
        <div className="name-feat">{item.title}</div>
      </div>
      <div className="arrow-feat">
        <svg viewBox="0 0 24 24">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </article>
  );

  return (
    <>
      <div className="bg" />
      <div className="grain" />
      
      <div className="electric-page">
        <PageDrawerMenu onNavigate={onNavigate} />

      {/* Header */}
      <section id="chi-siamo">
        <div className="container">
          <section className="intro" aria-label="Presentazione del team">
            <div className="logo-box">
              <img src="/images/logo.png" alt="Logo FSC Racing Team" />
            </div>
            <div className="about">
              <h2>Reparto Elettrico</h2>
              <p>
                E' il cuore tecnologico della vettura da competizione, responsabile di progettare
                e sviluppare i sistemi elettrici che alimentano e controllano il veicolo.
              </p>
            </div>
          </section>
        </div>
      </section>

      <div className="divisore"></div>

      {/* HIGH VOLTAGE */}
      <section className="hv-wrapper">
        <div className="hv-bg">
          <Lightning
            hue={260}
            xOffset={0}
            speed={1}
            intensity={1}
            size={1}
          />
        </div>
        <div className="hv-container">
          <div className="header">
            <span className="pip"></span> High Voltage
          </div>

          <section id="hv-feat" aria-label="High Voltage approfondimenti">
            <div className="intro-feat">
            <div className="media-feat">
              <img src="/images/collage-elect/elettrica.jpg" alt="HV Hero" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
            </div>
            <div className="copy-feat">
              <h2>Battery Pack, Powertrain &amp; HV Safety</h2>
              <p>
                Gestione pack, BMS e sicurezza alta tensione: layout celle, isolamento, interlock, TS e interfacce GLV/HV
                conformi a regolamento FS.
              </p>
            </div>
          </div>

          <div className="grid-feat">
            {hvItems.map(renderCard)}
          </div>
          <DepartmentMembers title="Team High Voltage" department="electric-hv" />
        </section>
        </div>
      </section>

      {/* LOW VOLTAGE */}
      <section className="glv-wrapper">
        <div className="glv-bg">
          <FaultyTerminal
            scale={1.5}
            gridMul={[2, 1]}
            digitSize={1.2}
            timeScale={0.5}
            pause={false}
            scanlineIntensity={0.5}
            glitchAmount={1}
            flickerAmount={1}
            noiseAmp={1}
            chromaticAberration={0}
            dither={0}
            curvature={0.1}
            tint="#A7EF9E"
            mouseReact
            mouseStrength={0.5}
            pageLoadAnimation
            brightness={0.6}
          />
        </div>
        <div className="glv-container">
          <div className="header">
            <span className="pip"></span> Low Voltage & Control
          </div>

          <section id="glv-feat" aria-label="Low Voltage approfondimenti">
            <div className="intro-feat">
              <div className="media-feat">
                <img src="/images/collage-elect/glv.jpg" alt="GLV Hero" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
              </div>
              <div className="copy-feat">
                <h2>ECU, Wiring, Dashboard &amp; Acquisition</h2>
                <p>
                  Sistemi di controllo 12V: ECU custom, acquisizione dati, dashboard pilota, cablaggi e schede distribuzione alimentazione.
                </p>
              </div>
            </div>

            <div className="grid-feat">
              {glvItems.map(renderCard)}
            </div>
            <DepartmentMembers title="Team Low Voltage" department="electric-lv" />
          </section>
        </div>
      </section>

      {/* Contacts & Footer */}
      <ContactGate />
      <FscFooter />

      {/* Detail Modal */}
      <div
        className="detail-overlay-feat"
        aria-hidden={!selectedDetail}
        onClick={closeDetail}
      >
        {selectedDetail && (
          <div
            className="detail-modal-feat"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-topbar-feat">
              <div className="detail-title-feat">{selectedDetail.title}</div>
              <button
                className="detail-close-feat"
                onClick={closeDetail}
                aria-label="Chiudi dettaglio"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="detail-media-feat">
              <img src={selectedDetail.img} alt={selectedDetail.title} onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
            </div>

            <div className="detail-copy-feat">
              <h3>{selectedDetail.title}</h3>
              <p>{selectedDetail.desc}</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
