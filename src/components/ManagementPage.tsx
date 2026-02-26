import { useRef, useState } from "react";
import "./ElectricPage.css";
import ContactGate from "./Contacts";
import FscFooter from "./FscFooter";
import PageDrawerMenu from "./PageDrawerMenu";
import DepartmentMembers from "./DepartmentMembers";

interface DetailItem {
  title: string;
  desc: string;
  img: string;
  role: string;
  name: string;
}

interface ManagementPageProps {
  onNavigate: (page: string) => void;
}

interface SwipeStart {
  x: number;
  y: number;
}

const collageItems = [
  {
    img: "/images/collage-mgmt/collage-1.jpeg",
    alt: "Talking",
    caption: "Talking"
  },
  {
    img: "/images/collage-mgmt/collage-2.jpeg",
    alt: "Planning",
    caption: "Planning"
  },
  {
    img: "/images/collage-mgmt/collage-3.jpg",
    alt: "Working",
    caption: "Working"
  }
];

const focusItems: DetailItem[] = [
  {
    title: "Strategia & Pianificazione",
    desc: "Definiamo obiettivi, roadmap e priorità operative del team, garantendo coerenza tra attività tecniche e risultati attesi.",
    img: "/images/collage-mgmt/collage-1.jpeg",
    role: "Management",
    name: "Pianificazione"
  },
  {
    title: "Coordinamento & Comunicazione",
    desc: "Allineiamo reparti, tempi e responsabilità con meeting strutturati e flussi informativi chiari per accelerare le decisioni.",
    img: "/images/collage-mgmt/collage-2.jpeg",
    role: "Management",
    name: "Coordinamento"
  },
  {
    title: "Budget & Partnership",
    desc: "Gestiamo risorse economiche, sponsor e relazioni esterne per sostenere la crescita del progetto FSC in modo solido e continuo.",
    img: "/images/collage-mgmt/collage-3.jpg",
    role: "Management",
    name: "Operations"
  }
];

export default function ManagementPage({ onNavigate }: ManagementPageProps) {
  const [selectedDetail, setSelectedDetail] = useState<DetailItem | null>(null);
  const [order, setOrder] = useState<number[]>([0, 1, 2]);
  const swipeStart = useRef<SwipeStart | null>(null);

  const goNext = () => {
    setOrder((prev) => {
      const next = [...prev];
      const last = next.pop();
      if (last === undefined) {
        return prev;
      }
      next.unshift(last);
      return next;
    });
  };

  const goPrev = () => {
    setOrder((prev) => {
      const next = [...prev];
      const first = next.shift();
      if (first === undefined) {
        return prev;
      }
      next.push(first);
      return next;
    });
  };

  const onStart = (x: number, y: number) => {
    swipeStart.current = { x, y };
  };

  const onMove = (x: number, y: number) => {
    if (!swipeStart.current) {
      return;
    }
    const dx = x - swipeStart.current.x;
    const dy = y - swipeStart.current.y;
    const threshold = 28;

    if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) {
      return;
    }

    swipeStart.current = null;
    if (dx < 0) {
      goNext();
    } else {
      goPrev();
    }
  };

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

      <div className="management-page electric-page">
        <PageDrawerMenu onNavigate={onNavigate} />

        <section id="chi-siamo">
          <div className="container">
            <section className="intro" aria-label="Presentazione del team">
              <div className="logo-box">
                <img src="/images/logo.png" alt="Logo FSC Racing Team" />
              </div>
              <div className="about">
                <h2>Reparto Management</h2>
                <p>
                  Il fulcro della pianificazione e della gestione del nostro progetto. Coordiniamo
                  risorse, tempi e budget per garantire che ogni aspetto del lavoro sia efficiente e
                  allineato agli obiettivi del team.
                </p>
                <p>
                  Dalla strategia alla comunicazione, il nostro compito è rendere il Team FSC
                  un'unità coesa e orientata al successo.
                </p>
              </div>
            </section>
          </div>

          <section className="mgmt-collage-wrap" aria-label="Collage del team">
            <div className="mgmt-collage">
              <figure className="mgmt-tile mgmt-i1"><img src="/images/collage-mgmt/collage-1.jpeg" alt="Team Presentation" /></figure>
              <figure className="mgmt-tile mgmt-i2"><img src="/images/collage-mgmt/collage-3.jpg" alt="Site Launch" /></figure>
              <figure className="mgmt-tile mgmt-i3"><img src="/images/collage-mgmt/collage-2.jpeg" alt="Dettagli operativi" /></figure>
            </div>
          </section>

          <section className="mgmt-polaroid-stack" aria-label="Galleria mobile">
            <div
              className="mgmt-stack"
              onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={() => { swipeStart.current = null; }}
              onPointerDown={(e) => onStart(e.clientX, e.clientY)}
              onPointerMove={(e) => onMove(e.clientX, e.clientY)}
              onPointerUp={() => { swipeStart.current = null; }}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  goPrev();
                }
                if (e.key === "ArrowRight") {
                  goNext();
                }
              }}
              tabIndex={0}
            >
              {order.map((index, visualIndex) => {
                const card = collageItems[index];
                return (
                  <figure
                    className="mgmt-polaroid"
                    key={card.caption}
                    style={{
                      zIndex: visualIndex + 1,
                      transform: `translate(${visualIndex * 3}px, ${visualIndex * 2}px) rotate(${(visualIndex - 1) * 2}deg)`
                    }}
                  >
                    <div className="mgmt-polaroid-frame">
                      <img src={card.img} alt={card.alt} />
                      <figcaption>{card.caption}</figcaption>
                    </div>
                  </figure>
                );
              })}
            </div>
            <div className="mgmt-swipe-hint" aria-hidden="true">Swipe ⇄</div>
          </section>
        </section>

        <div className="divisore"></div>

        <section className="electric-section mgmt-focus">
          <div className="header">
            <span className="pip"></span> Management
          </div>
          <div className="grid-feat">
            {focusItems.map(renderCard)}
          </div>
          <DepartmentMembers title="Team Management" department="management" />
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
