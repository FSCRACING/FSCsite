import { useEffect, useState } from "react";
// @ts-ignore - FlowingMenu is a JSX component
import FlowingMenu from "./FlowingMenu";

interface PageDrawerMenuProps {
  onNavigate: (page: string) => void;
}

export default function PageDrawerMenu({ onNavigate }: PageDrawerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="topbar">
        <button
          className={`hamb ${menuOpen ? "is-on" : ""}`}
          aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className={`drawerShade ${menuOpen ? "is-on" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`drawer ${menuOpen ? "is-on" : ""}`} aria-hidden={!menuOpen}>
        <div className="drawerHead">
          <div className="drawerTitle">MENU</div>
        </div>

        <div className="drawerBody">
          {menuOpen ? (
            <FlowingMenu
              items={[
                { text: "Home", link: "#home", onClick: () => { setMenuOpen(false); onNavigate("home"); } },
                { text: "Management", link: "#management", onClick: () => { setMenuOpen(false); onNavigate("management"); } },
                { text: "Elettrica", link: "#electric", onClick: () => { setMenuOpen(false); onNavigate("electric"); } },
                { text: "Area Riservata", link: "/admin/index.html", onClick: () => { setMenuOpen(false); window.location.assign("/admin/index.html"); } }
              ]}
              bgColor="transparent"
              speed={5}
            />
          ) : null}
        </div>
      </aside>
    </>
  );
}