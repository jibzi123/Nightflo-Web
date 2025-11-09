import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserPlus, Mail, Target, Percent, Shield } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';
import { apiClient } from '../../services/apiClient';
import { EventSummaryData, TeamMember } from '../../types/api';


type RoleKey = "admin" | "doorteam" | "promoter" | "staff";
type SubListKey = "team" | "suggestions" | "archivedSuggestions";

interface OrganizerRaw {
  id: string;
  organizer: {
    id?: string;
    fullName?: string;
    email?: string;
    imageUrl?: string;
    userType?: string;
  };
  requestId?: string;
  requestStatus?: string;
  movedToArchive?: boolean;
  isActivation?: boolean;
  // ... any other fields
}

interface OrganizerItem {
  id: string;
  fullName: string;
  email?: string;
  imageUrl?: string;
  userType?: string;
  requestId?: string;
  requestStatus?: string;
  movedToArchive?: boolean;
  isActivation?: boolean;
}

interface RolePayload {
  team: OrganizerRaw[];
  suggestions: OrganizerRaw[];
  archivedSuggestions: OrganizerRaw[];
}

interface EventStaffManagerProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_LABELS: Record<RoleKey, string> = {
  admin: "Admins",
  doorteam: "Door Team",
  promoter: "Promoters",
  staff: "Staff",
};

const ROLE_API_TYPE: Record<RoleKey, string> = {
  admin: "admin",
  doorteam: "doorteam",
  promoter: "promoter",
  staff: "staff",
};

const EventStaffManager: React.FC<EventStaffManagerProps> = ({ eventId, eventName, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'promoter'>('staff');
  const [staff, setStaff] = useState<TeamMember[]>([]);
  const [promoters, setPromoters] = useState<TeamMember[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteType, setInviteType] = useState<'staff' | 'promoter'>('staff');
  const [summaryData, setSummaryData] = useState<EventSummaryData | null>(null);
  const [activeRole, setActiveRole] = useState<RoleKey>("promoter");
  const [activeSubList, setActiveSubList] = useState<SubListKey>("team");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");


  const [rolesData, setRolesData] = useState<Record<RoleKey, RolePayload>>({
    admin: { team: [], suggestions: [], archivedSuggestions: [] },
    doorteam: { team: [], suggestions: [], archivedSuggestions: [] },
    promoter: { team: [], suggestions: [], archivedSuggestions: [] },
    staff: { team: [], suggestions: [], archivedSuggestions: [] },
  });

  useEffect(() => {
    if (isOpen) {
      fetchAllRoles(eventId);
    }
  }, [isOpen]);

  async function fetchAllRoles(eId: string) {
  try {
    setLoading(true);
    const roleKeys: RoleKey[] = ["admin", "doorteam", "promoter"];

    await Promise.all(
      roleKeys.map(async (rk) => {
        try {
          const res = await apiClient.getAllEventsOrganizersByEventAndUsertype(
            eId,
            ROLE_API_TYPE[rk]
          );

          // each payload should have { team, suggestions, archivedSuggestions }
          const payload: RolePayload = res?.payLoad ?? {
            team: [],
            suggestions: [],
            archivedSuggestions: []
          };

          setRolesData((prev) => ({ ...prev, [rk]: payload }));
        } catch (err) {
          console.error(`Failed to load ${rk}`, err);
          setRolesData((prev) => ({
            ...prev,
            [rk]: { team: [], suggestions: [], archivedSuggestions: [] }
          }));
        }
      })
    );
  } finally {
    setLoading(false);
  }
}

  const mapRawToItem = (r: OrganizerRaw): OrganizerItem => ({
    id: r.id ?? r.requestId ?? r.organizer?.id ?? "",
    fullName: r.organizer?.fullName ?? "",
    email: r.organizer?.email ?? "",
    imageUrl: r.organizer?.imageUrl ?? "",
    userType: r.organizer?.userType ?? "",
    movedToArchive: r.movedToArchive ?? false,
    isActivation: r.isActivation ?? false
  });


  const displayedList = useMemo(() => {
    const payload = rolesData[activeRole][activeSubList] ?? [];
    const mapped = payload.map(mapRawToItem);
    if (!search?.trim()) return mapped;
    const q = search.trim().toLowerCase();
    return mapped.filter((it) => (it.fullName || "").toLowerCase().includes(q) || (it.email || "").toLowerCase().includes(q));
  }, [rolesData, activeRole, activeSubList, search]);

async function handleAdd(user: OrganizerRaw) {
  try {
    setLoading(true);

    const res = await apiClient.addOrganizerInEvent(
      eventId,
      user?.organizer.id,
      ROLE_API_TYPE[activeRole]
    );

    const added = { ...res?.payLoad, isActivation: true };

    setRolesData((prev) => {
      const newTeam = [...prev[activeRole].team, added];
      const newSuggestions = prev[activeRole].suggestions.filter(
        (s) => s.organizer.id !== user.organizer.id
      );
      return {
        ...prev,
        [activeRole]: {
          ...prev[activeRole],
          team: newTeam,
          suggestions: newSuggestions,
        },
      };
    });
  } catch (err) {
    console.error("Failed to add:", err);
  } finally {
    setLoading(false);
  }
}

async function handleRemove(user: OrganizerRaw) {
  try {
    setLoading(true);

    await apiClient.removeOrganizerFromEvent(
      eventId,
      user?.organizer.id,
      ROLE_API_TYPE[activeRole]
    );

    setRolesData((prev) => {
      const newTeam = prev[activeRole].team.filter(
        (t) => t.organizer.id !== user.organizer.id
      );

      const newSuggestions = user.movedToArchive
        ? prev[activeRole].suggestions
        : [...prev[activeRole].suggestions, { ...user, isActivation: false }];

      return {
        ...prev,
        [activeRole]: {
          ...prev[activeRole],
          team: newTeam,
          suggestions: newSuggestions,
        },
      };
    });
  } catch (err) {
    console.error("Failed to remove:", err);
  } finally {
    setLoading(false);
  }
}

async function handleArchiveToggle(user: OrganizerRaw, moveToArchive: boolean) {
  try {
    setLoading(true);

    await apiClient.toggleArchive(
      eventId,
      user?.organizer.id,
      moveToArchive
    );

    setRolesData((prev) => {
      const roleData = prev[activeRole];
      let archived = [...roleData.archivedSuggestions];
      let suggestions = [...roleData.suggestions];

      if (moveToArchive) {
        archived.push({ ...user, movedToArchive: true });
        suggestions = suggestions.filter((s) => s.organizer.id !== user.organizer.id);
      } else {
        suggestions.push({ ...user, movedToArchive: false });
        archived = archived.filter((a) => a.organizer.id !== user.organizer.id);
      }

      return {
        ...prev,
        [activeRole]: {
          ...roleData,
          archivedSuggestions: archived,
          suggestions,
        },
      };
    });
  } catch (err) {
    console.error("Failed to archive toggle:", err);
  } finally {
    setLoading(false);
  }
}

  const renderRoleIcon = (rk: RoleKey) => {
    switch (rk) {
      case "admin": return <Shield size={14} />;
      case "doorteam": return <Users size={14} />;
      case "promoter": return <Target size={14} />;
      case "staff": return <UserPlus size={14} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Manage Staff</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '16px 24px 16px 24px', borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {/* Role tabs */}
            {(["admin","doorteam","promoter","staff"] as RoleKey[]).map((rk) => (
              <button
                key={rk}
                className={`btn ${activeRole === rk ? "btn-primary" : "btn-outline"}`}
                onClick={() => { setActiveRole(rk); setActiveSubList("team"); setSearch(""); }}
              >
                <span style={{ marginRight: 8, display: "inline-flex", verticalAlign: "middle" }}>{renderRoleIcon(rk)}</span>
                {ROLE_LABELS[rk]}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`btn ${activeSubList === "team" ? "btn-primary" : "btn-outline"}`} onClick={() => setActiveSubList("team")}>Added in this event ({rolesData[activeRole].team.length})</button>
              <button className={`btn ${activeSubList === "suggestions" ? "btn-primary" : "btn-outline"}`} onClick={() => setActiveSubList("suggestions")}>Quick add ({rolesData[activeRole].suggestions.length})</button>
              <button className={`btn ${activeSubList === "archivedSuggestions" ? "btn-primary" : "btn-outline"}`} onClick={() => setActiveSubList("archivedSuggestions")}>Archived ({rolesData[activeRole].archivedSuggestions.length})</button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" />
              <button className="btn btn-outline" onClick={() => { setSearch(""); fetchAllRoles(eventId); }}>Refresh</button>
            </div>
          </div>
        </div>
        

        <div style={{ minHeight: 120 }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
          ) : displayedList.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>No items</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedList.map((it) => {
                  // find the raw object for actions (we need requestId etc.)
                  const rawCandidates = rolesData[activeRole][activeSubList];
                  const raw = rawCandidates.find(r => (r.requestId ?? r.id) === it.id) ?? rawCandidates.find(r => (r.organizer?.id ?? r.id) === it.id);
                  return (
                    <tr key={it.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <ProfileImage firstName={it.fullName?.split(" ")[0] || ""} lastName={(it.fullName?.split(" ")[1] || "")} imageUrl={it.imageUrl} size="sm" />
                          <div>
                            <div style={{ fontWeight: 600 }}>{it.fullName}</div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>{it.userType || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td>{it.email}</td>
                      <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        {activeSubList === "suggestions" && (
                          <button className="btn btn-primary" onClick={() => raw && handleAdd(raw)}>Add</button>
                        )}
                        {activeSubList === "team" && (
                          <button className="btn btn-outline-danger" onClick={() => raw && handleRemove(raw)}>Remove</button>
                        )}
                        {activeSubList !== "archivedSuggestions" && (
                          <button className="btn btn-outline" onClick={() => raw && handleArchiveToggle(raw, true)}>Archive</button>
                        )}
                        {activeSubList === "archivedSuggestions" && (
                          <button className="btn btn-primary" onClick={() => raw && handleArchiveToggle(raw, false)}>Unarchive</button>
                        )}
                      </div>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">
            Save Assignments
          </button>
        </div>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Invite New {inviteType === 'staff' ? 'Staff Member' : 'Promoter'}</h2>
              <button className="modal-close" onClick={() => setShowInviteForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" placeholder="John" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" placeholder="Doe" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="john.doe@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" placeholder="+1 555-0100" />
              </div>
              {inviteType === 'staff' && (
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select">
                    <option value="bartender">Bartender</option>
                    <option value="security">Security</option>
                    <option value="dj">DJ</option>
                    <option value="server">Server</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              )}
              {inviteType === 'promoter' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Commission Rate (%)</label>
                    <input type="number" className="form-input" placeholder="15" min="0" max="100" step="0.5" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sales Target (Optional)</label>
                    <input type="number" className="form-input" placeholder="100" min="0" />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowInviteForm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary">
                <Mail size={16} />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventStaffManager;