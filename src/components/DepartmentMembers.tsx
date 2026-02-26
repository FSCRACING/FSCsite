import { useEffect, useMemo, useState } from "react";
import {
  getMembersByDepartment,
  loadMembersFromDecapFile,
  type TeamDepartment,
  type TeamMember
} from "../lib/teamMembers";

interface DepartmentMembersProps {
  title: string;
  department: TeamDepartment;
}

export default function DepartmentMembers({ title, department }: DepartmentMembersProps) {
  const [version, setVersion] = useState(0);
  const [remoteMembers, setRemoteMembers] = useState<TeamMember[] | null>(null);

  useEffect(() => {
    const onUpdate = () => setVersion((value) => value + 1);
    const onStorage = (event: StorageEvent) => {
      if (event.key?.includes("fsc-team-members")) {
        onUpdate();
      }
    };

    window.addEventListener("fsc-members-updated", onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("fsc-members-updated", onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadRemoteMembers = async () => {
      const members = await loadMembersFromDecapFile();
      if (!active) {
        return;
      }
      setRemoteMembers(members);
    };

    void loadRemoteMembers();
    const timer = window.setInterval(() => {
      void loadRemoteMembers();
    }, 8000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const members = useMemo(() => {
    const source = remoteMembers ?? getMembersByDepartment(department);
    return source
      .filter((member) => member.department === department)
      .sort((first, second) => {
        if (first.cardSize !== second.cardSize) {
          return first.cardSize === "lead" ? -1 : 1;
        }
        const firstOrder = first.order ?? 0;
        const secondOrder = second.order ?? 0;
        if (firstOrder !== secondOrder) {
          return firstOrder - secondOrder;
        }
        return first.name.localeCompare(second.name);
      });
  }, [department, remoteMembers, version]);

  return (
    <section className="dept-members" aria-label={`${title} team members`}>
      <h3 className="dept-members-title">{title}</h3>
      {members.length === 0 ? (
        <p className="dept-members-empty">Nessun membro configurato per questa area.</p>
      ) : (
        <div className="dept-members-grid">
          {members.map((member) => {
            const githubUrl = member.github ? `https://github.com/${member.github}` : "";
            return (
              <article key={member.id} className={`dept-member-card dept-member-card--${member.cardSize}`}>
                <div className="dept-member-avatar-wrap">
                  {member.imageUrl ? (
                    <img className="dept-member-avatar" src={member.imageUrl} alt={member.name} />
                  ) : (
                    <div className="dept-member-avatar dept-member-avatar--placeholder" />
                  )}
                </div>

                <div className="dept-member-content">
                  <div className="dept-member-name">{member.name}</div>
                  <div className="dept-member-role">{member.role}</div>

                  <div className="dept-member-links">
                    {githubUrl ? (
                      <a href={githubUrl} target="_blank" rel="noreferrer noopener">GitHub</a>
                    ) : null}
                    {member.linkedinUrl ? (
                      <a href={member.linkedinUrl} target="_blank" rel="noreferrer noopener">LinkedIn</a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
