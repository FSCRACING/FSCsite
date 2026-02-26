import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import PageDrawerMenu from "./PageDrawerMenu";
import {
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
  TEAM_DEPARTMENT_OPTIONS,
  type TeamCardSize,
  type TeamDepartment,
  type TeamMember
} from "../lib/teamMembers";

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

interface GithubSession {
  login: string;
  avatarUrl: string;
  displayName: string;
}

const SESSION_KEY = "fsc-admin-session-v1";

function parseAllowlist(): string[] {
  const raw = (import.meta.env.VITE_ADMIN_GITHUB_ALLOWLIST || "") as string;
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function readSession(): GithubSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(SESSION_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as GithubSession;
  } catch {
    return null;
  }
}

function saveSession(session: GithubSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

function createMemberId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `member-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [session, setSession] = useState<GithubSession | null>(() => readSession());
  const [githubUsername, setGithubUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [department, setDepartment] = useState<TeamDepartment>("management");
  const [cardSize, setCardSize] = useState<TeamCardSize>("standard");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [github, setGithub] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const members = useMemo(() => getTeamMembers(), [refreshKey]);

  const groupedMembers = useMemo(() => {
    const optionsMap = new Map(TEAM_DEPARTMENT_OPTIONS.map((option) => [option.value, option.label]));
    const entries = new Map<string, TeamMember[]>();

    for (const member of members) {
      const key = member.department;
      if (!entries.has(key)) {
        entries.set(key, []);
      }
      entries.get(key)?.push(member);
    }

    return Array.from(entries.entries())
      .map(([key, values]) => ({
        department: key,
        label: optionsMap.get(key as TeamDepartment) || key,
        values: values.sort((first, second) => first.name.localeCompare(second.name))
      }))
      .sort((first, second) => first.label.localeCompare(second.label));
  }, [members]);

  const loginWithGithub = async (event: FormEvent) => {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");

    const username = githubUsername.trim();
    if (!username) {
      setLoginBusy(false);
      setLoginError("Inserisci username GitHub.");
      return;
    }

    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error("Utente GitHub non trovato.");
      }

      const data = await response.json() as { login: string; avatar_url: string; name: string | null };
      const allowlist = parseAllowlist();
      if (allowlist.length > 0 && !allowlist.includes(data.login.toLowerCase())) {
        throw new Error("Account GitHub non autorizzato.");
      }

      const nextSession: GithubSession = {
        login: data.login,
        avatarUrl: data.avatar_url || "",
        displayName: data.name || data.login
      };

      saveSession(nextSession);
      setSession(nextSession);
      setGithubUsername("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Errore durante il login GitHub.";
      setLoginError(message);
    } finally {
      setLoginBusy(false);
    }
  };

  const addMember = (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !role.trim()) {
      return;
    }

    const newMember: TeamMember = {
      id: createMemberId(),
      department,
      cardSize,
      name: name.trim(),
      role: role.trim(),
      imageUrl: imageUrl.trim(),
      github: github.trim(),
      linkedinUrl: linkedinUrl.trim()
    };

    addTeamMember(newMember);
    setRefreshKey((value) => value + 1);
    setName("");
    setRole("");
    setImageUrl("");
    setGithub("");
    setLinkedinUrl("");
    setCardSize("standard");
  };

  const deleteMember = (memberId: string) => {
    removeTeamMember(memberId);
    setRefreshKey((value) => value + 1);
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <>
      <div className="bg" />
      <div className="grain" />

      <div className="admin-page electric-page">
        <PageDrawerMenu onNavigate={onNavigate} />

        <section className="admin-shell">
          <header className="admin-header">
            <p className="admin-kicker">Area Riservata</p>
            <h1>Admin Team Cards</h1>
            <p>Login GitHub e gestione dinamica card persone per reparto.</p>
          </header>

          {!session ? (
            <form className="admin-login" onSubmit={loginWithGithub}>
              <label htmlFor="githubUsername">Login with GitHub</label>
              <input
                id="githubUsername"
                type="text"
                value={githubUsername}
                placeholder="username GitHub"
                onChange={(event) => setGithubUsername(event.target.value)}
              />
              <button type="submit" disabled={loginBusy}>
                {loginBusy ? "Verifica..." : "Accedi"}
              </button>
              {loginError ? <p className="admin-error">{loginError}</p> : null}
              <small>
                Accesso consentito solo agli username presenti in <strong>VITE_ADMIN_GITHUB_ALLOWLIST</strong>.
              </small>
            </form>
          ) : (
            <div className="admin-panel">
              <div className="admin-userbar">
                <div className="admin-user">
                  {session.avatarUrl ? <img src={session.avatarUrl} alt={session.login} /> : null}
                  <div>
                    <div className="admin-user-name">{session.displayName}</div>
                    <div className="admin-user-login">@{session.login}</div>
                  </div>
                </div>
                <button type="button" onClick={logout}>Logout</button>
              </div>

              <form className="admin-form" onSubmit={addMember}>
                <div className="admin-form-grid">
                  <label>
                    Reparto
                    <select value={department} onChange={(event) => setDepartment(event.target.value as TeamDepartment)}>
                      {TEAM_DEPARTMENT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Tipo card
                    <select value={cardSize} onChange={(event) => setCardSize(event.target.value as TeamCardSize)}>
                      <option value="standard">Standard</option>
                      <option value="lead">Capo reparto</option>
                    </select>
                  </label>

                  <label>
                    Nome *
                    <input value={name} onChange={(event) => setName(event.target.value)} required />
                  </label>

                  <label>
                    Ruolo *
                    <input value={role} onChange={(event) => setRole(event.target.value)} required />
                  </label>

                  <label>
                    URL immagine
                    <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="/images/team/nome.jpg" />
                  </label>

                  <label>
                    GitHub username
                    <input value={github} onChange={(event) => setGithub(event.target.value)} placeholder="username" />
                  </label>

                  <label>
                    URL LinkedIn
                    <input value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} placeholder="https://linkedin.com/in/..." />
                  </label>
                </div>

                <button type="submit" className="admin-add-btn">Aggiungi card</button>
              </form>

              <div className="admin-list-wrap">
                {groupedMembers.map((group) => (
                  <section key={group.department} className="admin-group">
                    <h3>{group.label}</h3>
                    <div className="admin-members-list">
                      {group.values.map((member) => (
                        <article key={member.id} className="admin-member-row">
                          <div>
                            <strong>{member.name}</strong>
                            <span>{member.role}</span>
                            <small>{member.cardSize === "lead" ? "Capo reparto" : "Standard"}</small>
                          </div>
                          <button type="button" onClick={() => deleteMember(member.id)}>Rimuovi</button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
