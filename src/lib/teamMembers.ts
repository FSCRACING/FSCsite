import teamMembersData from "../data/team-members.json";

export type TeamDepartment =
  | "electric-hv"
  | "electric-lv"
  | "mech-vd"
  | "mech-design"
  | "mech-aero"
  | "management";

export type TeamCardSize = "lead" | "standard";

export interface TeamMember {
  id: string;
  department: TeamDepartment;
  name: string;
  role: string;
  imageUrl: string;
  github: string;
  linkedinUrl: string;
  cardSize: TeamCardSize;
  order?: number;
}

interface DecapMemberRaw {
  name?: string;
  role?: string;
  dept?: string;
  unit?: string;
  bio?: string;
  linkedin?: string;
  special?: boolean;
  photo?: string;
  visible?: boolean;
  order?: number;
}

const STORAGE_KEY = "fsc-team-members-v1";

export const TEAM_DEPARTMENT_OPTIONS: { value: TeamDepartment; label: string }[] = [
  { value: "electric-hv", label: "Elettrica — High Voltage" },
  { value: "electric-lv", label: "Elettrica — Low Voltage" },
  { value: "mech-vd", label: "Meccanica — Vehicle Dynamics" },
  { value: "mech-design", label: "Meccanica — Mechanical Design" },
  { value: "mech-aero", label: "Meccanica — Aerodynamics" },
  { value: "management", label: "Management" }
];

const defaultMembers: TeamMember[] = (teamMembersData.members || []) as TeamMember[];

function isBrowser() {
  return typeof window !== "undefined";
}

function emitMembersUpdate() {
  if (!isBrowser()) {
    return;
  }
  window.dispatchEvent(new CustomEvent("fsc-members-updated"));
}

function safeParseMembers(value: string | null): TeamMember[] | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as TeamMember[];
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getTeamMembers(): TeamMember[] {
  if (!isBrowser()) {
    return defaultMembers;
  }

  const parsed = safeParseMembers(window.localStorage.getItem(STORAGE_KEY));
  if (parsed && parsed.length > 0) {
    return parsed;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMembers));
  return defaultMembers;
}

export function saveTeamMembers(members: TeamMember[]) {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  emitMembersUpdate();
}

export function addTeamMember(member: TeamMember) {
  const members = getTeamMembers();
  members.push(member);
  saveTeamMembers(members);
}

export function removeTeamMember(memberId: string) {
  const members = getTeamMembers().filter((member) => member.id !== memberId);
  saveTeamMembers(members);
}

export function getMembersByDepartment(department: TeamDepartment): TeamMember[] {
  return getTeamMembers()
    .filter((member) => member.department === department)
    .sort((first, second) => {
      if (first.cardSize === second.cardSize) {
        const firstOrder = first.order ?? 0;
        const secondOrder = second.order ?? 0;
        if (firstOrder !== secondOrder) {
          return firstOrder - secondOrder;
        }
        return first.name.localeCompare(second.name);
      }
      return first.cardSize === "lead" ? -1 : 1;
    });
}

function mapDepartmentFromDecap(raw: DecapMemberRaw): TeamDepartment | null {
  const dept = (raw.dept || "").toLowerCase().trim();
  const unit = (raw.unit || "").toLowerCase().trim();

  if (dept === "management") {
    return "management";
  }

  if (dept === "elettrica") {
    if (unit === "high_voltage") {
      return "electric-hv";
    }
    if (unit === "low_voltage") {
      return "electric-lv";
    }
    return null;
  }

  if (dept === "meccanica") {
    if (unit === "vehicle_dynamics") {
      return "mech-vd";
    }
    if (unit === "mechanical_design") {
      return "mech-design";
    }
    if (unit === "aerodynamics") {
      return "mech-aero";
    }
    return null;
  }

  return null;
}

function toTeamMember(raw: DecapMemberRaw, index: number): TeamMember | null {
  const department = mapDepartmentFromDecap(raw);
  const name = (raw.name || "").trim();
  const role = (raw.role || "").trim();
  if (!department || !name || !role) {
    return null;
  }

  const safeUnit = (raw.unit || "member").replace(/[^a-z0-9_\-]+/gi, "-");
  return {
    id: `${department}-${safeUnit}-${index}`,
    department,
    name,
    role,
    imageUrl: (raw.photo || "").trim(),
    github: "",
    linkedinUrl: (raw.linkedin || "").trim(),
    cardSize: raw.special ? "lead" : "standard",
    order: typeof raw.order === "number" ? raw.order : 0
  };
}

export async function loadMembersFromDecapFile(): Promise<TeamMember[] | null> {
  if (!isBrowser()) {
    return null;
  }

  try {
    const response = await fetch(`/dev/data/members.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { members?: DecapMemberRaw[] };
    const rawMembers = Array.isArray(payload.members) ? payload.members : [];

    const mapped = rawMembers
      .filter((member) => member.visible !== false)
      .map((member, index) => toTeamMember(member, index))
      .filter((member): member is TeamMember => Boolean(member));

    if (mapped.length === 0) {
      return null;
    }

    return mapped;
  } catch {
    return null;
  }
}
