import { useState } from "react";
import "./ElectricPage.css";
import ContactGate from "./Contacts";
import FscFooter from "./FscFooter";
// @ts-ignore - Hyperspeed is a JSX component
import Hyperspeed from "./Hyperspeed";
// @ts-ignore - Silk is a JSX component
import Silk from "./Silk";
// @ts-ignore - Beams is a JSX component
import Beams from "./Beams";
import PageDrawerMenu from "./PageDrawerMenu";
import DepartmentMembers from "./DepartmentMembers";

interface DetailItem {
  title: string;
  desc: string;
  img: string;
  role: string;
  name: string;
}

interface MechPageProps {
  onNavigate: (page: string) => void;
}

const vehicleDynamicsItems: DetailItem[] = [
  {
    title: "Suspensions — Cinematica & geometrie",
    desc: "Progettazione di bracci, push/pull-rod e pivot; definizione di camber, caster, toe; analisi di roll center, anti-dive/anti-squat e bump steer lungo l’escursione.",
    img: "/images/collage-elect/Immagine2.jpg",
    role: "Suspensions",
    name: "Cinematica & geometrie"
  },
  {
    title: "Vehicle Dynamics — Pneumatici & dinamica",
    desc: "Modelli pneumatico (es. Pacejka), mappatura grip e temperature, trasferimenti di carico e gestione di sotto/sovrasterzo; validazione tramite telemetria.",
    img: "/images/collage-elect/collage-3.jpg",
    role: "Vehicle Dynamics",
    name: "Pneumatici & dinamica"
  }
];

const mechanicalDesignItems: DetailItem[] = [
  {
    title: "Mechanical Design — CAD & FEA",
    desc: "Progettazione componenti (uprights, mozzi, staffe); scelta materiali; analisi FEM statica/fatica; ottimizzazione topologica e rispetto dei fattori di sicurezza.",
    img: "/images/collage-elect/Immagine6.jpg",
    role: "Mechanical Design",
    name: "CAD & FEA strutturale"
  }
];

const aerodynamicsItems: DetailItem[] = [
  {
    title: "Aerodynamics — Aero package & CFD",
    desc: "Studio di ali, endplate, fondo e diffusore; simulazioni CFD (steady/transient), correlazione con assetto (ride-height, rake) e post-processing dei risultati.",
    img: "/images/collage-elect/Immagine5.png",
    role: "Aerodynamics",
    name: "Aero package & CFD"
  }
];

const VEHICLE_DYNAMICS_HYPERSPEED_OPTIONS = {
  distortion: "LongRaceDistortion",
  length: 400,
  roadWidth: 10,
  islandWidth: 5,
  lanesPerRoad: 2,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 50,
  lightPairsPerRoadWay: 70,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [20, 60],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.2, 0.2],
  carFloorSeparation: [0.05, 1],
  colors: {
    roadColor: 526344,
    islandColor: 657930,
    background: 0,
    shoulderLines: 1250072,
    brokenLines: 1250072,
    leftCars: [16736115, 15158624, 16715818],
    rightCars: [10806246, 8442324, 5489350],
    sticks: 10806246
  }
};

export default function MechPage({ onNavigate }: MechPageProps) {
  const [selectedDetail, setSelectedDetail] = useState<DetailItem | null>(null);

  const renderCard = (item: DetailItem) => (
    <article
      key={item.title}
      className="card1-feat"
      tabIndex={0}
      onClick={() => setSelectedDetail(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedDetail(item);
        }
      }}
    >
      <div className="img-feat">
        <img src={item.img} alt={item.title} onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
      </div>
      <div className="meta-feat">
        <div className="role-feat">{item.role}</div>
        <div className="name-feat">{item.name}</div>
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

      <div className="mech-page electric-page">
        <PageDrawerMenu onNavigate={onNavigate} />

        <section id="chi-siamo">
          <div className="container">
            <section className="intro" aria-label="Presentazione del team">
              <div className="logo-box">
                <img src="/images/logo.png" alt="Logo FSC Racing Team" />
              </div>
              <div className="about">
                <h2>Reparto Meccanica</h2>
                <p>
                  Rappresenta il cuore pulsante dell'innovazione tecnica e progettuale del Team FSC.
                  Il reparto si dedica alla progettazione, sviluppo e realizzazione di componenti
                  meccanici avanzati per la vettura da competizione.
                </p>
              </div>
            </section>
          </div>
        </section>

        <div className="divisore"></div>

        <section className="mech-section-wrapper mech-vd-wrapper">
          <div className="mech-vd-bg" aria-hidden="true">
            <Hyperspeed effectOptions={VEHICLE_DYNAMICS_HYPERSPEED_OPTIONS} />
          </div>
          <div className="mech-section-container electric-section">
            <div className="header">
              <span className="pip"></span> Vehicle Dynamics & Suspensions
            </div>

            <section aria-label="Vehicle Dynamics approfondimenti">
              <div className="intro-feat">
                <div className="media-feat">
                  <img src="/images/collage-elect/setup.avif" alt="VD Hero" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
                </div>
                <div className="copy-feat">
                  <h2>Shock Absorbers, Tyres and Tuning.</h2>
                  <p>Gestione sospensioni, studio comportamentale di masse sospese e non sospese.</p>
                </div>
              </div>

              <div className="grid-feat">
                {vehicleDynamicsItems.map(renderCard)}
              </div>
              <DepartmentMembers title="Team Vehicle Dynamics" department="mech-vd" />
            </section>
          </div>
        </section>

        <section className="mech-section-wrapper mech-design-wrapper">
          <div className="mech-design-bg" aria-hidden="true">
            <div className="mech-design-beams-host">
              <Beams
                beamWidth={3.4}
                beamHeight={30}
                beamNumber={20}
                lightColor="#0084ff"
                speed={4.8}
                noiseIntensity={1.75}
                scale={0.2}
                rotation={30}
              />
            </div>
          </div>
          <div className="mech-section-container electric-section">
            <div className="header">
              <span className="pip"></span> Mechanic Designing
            </div>

            <section aria-label="Mechanical Design approfondimenti">
              <div className="intro-feat">
                <div className="media-feat">
                  <img src="/images/collage-elect/lv-hero.jpg" alt="Design Hero" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
                </div>
                <div className="copy-feat">
                  <h2>CAD, Simulations & Designing</h2>
                  <p>Progettazione CAD, analisi delle sollecitazioni, modellazione e studio delle componenti meccaniche.</p>
                </div>
              </div>

              <div className="grid-feat">
                {mechanicalDesignItems.map(renderCard)}
              </div>
              <DepartmentMembers title="Team Mechanical Design" department="mech-design" />
            </section>
          </div>
        </section>

        <section className="mech-section-wrapper mech-aero-wrapper">
          <div className="mech-aero-bg" aria-hidden="true">
            <Silk
              speed={20}
              scale={1}
              color="#ff0000"
              noiseIntensity={1.5}
              rotation={0}
            />
          </div>
          <div className="mech-section-container electric-section">
            <div className="header">
              <span className="pip"></span> Aerodynamics
            </div>

            <section aria-label="Aerodynamics approfondimenti">
              <div className="intro-feat">
                <div className="media-feat">
                  <img src="/images/collage-elect/aero.jpeg" alt="Aero Hero" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
                </div>
                <div className="copy-feat">
                  <h2>CFD, CAD & Aerodynamic Analysis</h2>
                  <p>Simulazione CFD, Simulazioni CAD e ottimizzazione delle superfici aerodinamiche.</p>
                </div>
              </div>

              <div className="grid-feat">
                {aerodynamicsItems.map(renderCard)}
              </div>
              <DepartmentMembers title="Team Aerodynamics" department="mech-aero" />
            </section>
          </div>
        </section>

        <ContactGate />
        <FscFooter />

        <div
          className="detail-overlay-feat"
          aria-hidden={!selectedDetail}
          onClick={() => setSelectedDetail(null)}
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
                  onClick={() => setSelectedDetail(null)}
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
