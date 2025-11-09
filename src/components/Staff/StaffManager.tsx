import React, { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";
import { useAuth } from "../../contexts/AuthContext";
import { Edit, Mail, Plus, Search, Trash2, X } from "lucide-react";
import ProfileImage from "../common/ProfileImage";
import "../../styles/components.css";

interface StaffItem {
  id: string;
  staff: {
    fullName: string;
    email: string;
    address?: string;
    imageUrl?: string;
    userType: string;
    isVerified: boolean;
    profileComplete: boolean;
    createdAt: string;
  };
  event: {
    eventName: string;
    location: string;
    eventDate: string;
  };
  role: string;
  status: string;
  activated: boolean;
  joinedAt: string;
}

interface ClubEvent {
  id: string;
  eventName: string;
}

interface StaffEditorProps {
  staff: StaffItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffItem) => void;
}

const StaffEditor: React.FC<StaffEditorProps> = ({ staff, isOpen, onClose, onSave }) => {
  // flat form model used in the modal
  const [formData, setFormData] = useState<StaffItem>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Bartender",
    department: "Bar",
    salary: 35000,
    workingHours: "Part-time",
    hireDate: new Date().toISOString().split("T")[0],
    status: "active",
    emergencyContact: "",
    address: "",
  });

  // map incoming nested staff model -> flat form fields
  useEffect(() => {
    if (staff) {
      const fullName = staff.staff?.fullName || "";
      const [firstName = "", ...rest] = fullName.split(" ");
      const lastName = rest.join(" ");
      setFormData({
        id: staff.id || staff.staff?.id || "",
        firstName,
        lastName,
        email: staff.staff?.email || "",
        phone: staff["phone"] || "",
        role: staff.role || (staff.staff?.userType || "Bartender"),
        department: (staff["department"] as any) || "Bar",
        salary: (staff["salary"] as any) || 35000,
        workingHours: (staff["workingHours"] as any) || "Part-time",
        hireDate: (staff["hireDate"] as any) || new Date().toISOString().split("T")[0],
        status: staff.status?.toLowerCase() === "accepted" ? "active" : (staff.status || "active"),
        emergencyContact: staff["emergencyContact"] || "",
        address: staff.staff?.address || staff["address"] || "",
      });
    } else {
      // reset
      setFormData({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "Bartender",
        department: "Bar",
        salary: 35000,
        workingHours: "Part-time",
        hireDate: new Date().toISOString().split("T")[0],
        status: "active",
        emergencyContact: "",
        address: "",
      });
    }
  }, [staff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // build a StaffMember shaped object to return
    const fullName = `${(formData.firstName || "").trim()} ${(formData.lastName || "").trim()}`.trim();
    const newStaff: StaffItem = {
      id: formData.id || Date.now().toString(),
      role: formData.role,
      status: formData.status,
      activated: true,
      joinedAt: staff?.joinedAt || new Date().toISOString(),
      staff: {
        id: formData.id || undefined,
        fullName,
        email: (formData as any).email || "",
        address: formData?.address || "",
        imageUrl: staff?.staff?.imageUrl || undefined,
        userType: formData.role,
      },
      // keep event/eventOwner if editing an existing staff
      event: staff?.event,
      eventOwner: staff?.eventOwner,
      // include the flat fields so parent can decide
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      department: formData.department,
      salary: formData.salary,
      workingHours: formData.workingHours,
      hireDate: formData.hireDate,
      emergencyContact: formData.emergencyContact,
      address: formData.address,
    };

    onSave(newStaff);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "700px" }}>
        <div className="modal-header">
          <h2 className="modal-title">{staff ? "Edit Staff Member" : "Add New Staff Member"}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={(formData as any).email || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                >
                  <option value="Bartender">Bartender</option>
                  <option value="Security">Security</option>
                  <option value="DJ">DJ</option>
                  <option value="Server">Server</option>
                  <option value="Manager">Manager</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Host">Host</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                >
                  <option value="Bar">Bar</option>
                  <option value="Security">Security</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Service">Service</option>
                  <option value="Management">Management</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Front of House">Front of House</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Annual Salary ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.salary || 0}
                  onChange={(e) => setFormData((p) => ({ ...p, salary: parseInt(e.target.value || "0", 10) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Working Hours</label>
                <select
                  className="form-select"
                  value={formData.workingHours}
                  onChange={(e) => setFormData((p) => ({ ...p, workingHours: e.target.value }))}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Casual">Casual</option>
                  <option value="Contract">Contract</option>
                  <option value="Weekend Only">Weekend Only</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Hire Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.hireDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFormData((p) => ({ ...p, hireDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as any }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.address || ""}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="123 Main Street, City, State"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input
                type="text"
                className="form-input"
                value={formData.emergencyContact || ""}
                onChange={(e) => setFormData((p) => ({ ...p, emergencyContact: e.target.value }))}
                placeholder="Name and phone number"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {staff ? "Update Staff" : "Add Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StaffManager: React.FC = () => {
  const { user } = useAuth();

  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showStaffEditor, setShowStaffEditor] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);

  // ✅ Fetch all events
  useEffect(() => {
    const fetchClubEvents = async () => {
      try {
        setPageLoading(true);
        const [upcomingRes, pastRes] = await Promise.all([
          apiClient.getUpcomingEvents(),
          apiClient.getPastEvents(),
        ]);

        const allEvents = [
          ...(upcomingRes?.payLoad || []),
          ...(pastRes?.payLoad || []),
        ].map((ev: any) => ({
          id: ev.id,
          eventName: ev.eventName,
        }));

        // Insert "All Events" option at the very top
        allEvents.unshift({ id: undefined, eventName: "All Events" });

        // Store the list
        setClubEvents(allEvents);

        // Set the default filter to undefined (so it fetches all)
        setEventFilter(undefined);
        //if (allEvents.length > 0) setEventFilter(allEvents[0].id);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchClubEvents();
  }, []);

  // ✅ Fetch staff by club
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        if (!user?.club?.id) return;
        setLoading(true);

        const role = roleFilter !== "all" ? roleFilter : undefined;
        const status = statusFilter !== "all" ? statusFilter : undefined;
        debugger
        const eventId = eventFilter == "All Events" ? undefined : eventFilter || undefined;

        const res = await apiClient.getStaffByClubId(
          user.club.id,
          role,
          status,
          eventId
        );

        const staffArray = Array.isArray(res?.payLoad?.staff)
          ? res.payLoad.staff
          : [];

        setStaff(staffArray);
      } catch (err) {
        console.error("Failed to fetch staff:", err);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [user?.club?.id, roleFilter, statusFilter, eventFilter]);

  // ✅ Search filter
  const filteredStaff = Array.isArray(staff)
    ? staff.filter((member) => {
        const search = searchTerm.toLowerCase();
        return (
          member.staff?.fullName?.toLowerCase().includes(search) ||
          member.staff?.email?.toLowerCase().includes(search) ||
          member.role?.toLowerCase().includes(search) ||
          member.event?.eventName?.toLowerCase().includes(search)
        );
      })
    : [];

      const handleCreateStaff = () => {
    setSelectedStaff(null);
    setShowStaffEditor(true);
  };

  const handleEditStaff = (s: StaffItem) => {
    setSelectedStaff(s);
    setShowStaffEditor(true);
  };

  const handleSaveStaff = (s: StaffItem) => {
    // If ID exists, update; else add
    setStaff((prev) => {
      const exists = prev.some((p) => p.id === s.id);
      if (exists) return prev.map((p) => (p.id === s.id ? s : p));
      return [s, ...prev];
    });
    setShowStaffEditor(false);
    setSelectedStaff(null);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      setStaff((prev) => prev.filter((s) => s.id !== staffId));
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Staff Management</h2>
          <p className="card-subtitle">Manage your club staff members</p>
          <div style={{ display: "none", gap: 8, marginBottom: 16, justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={handleCreateStaff}>
              <Plus size={14} style={{ marginRight: 6 }} /> Add Staff Member
            </button>
            <button className="btn btn-secondary" onClick={() => alert("Send invitations (implement)")}>
              <Mail size={14} style={{ marginRight: 6 }} /> Send Invitations
            </button>
          </div>
        </div>

        

        {/* Filters */}
        <div className="search-filter-container">
          <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="BARTENDER">Bartender</option>
            <option value="SECURITY">Security</option>
            <option value="DJ">DJ</option>
            <option value="SERVER">Server</option>
            <option value="MANAGER">Manager</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="filter-select"
            value={eventFilter || ""}
            onChange={(e) =>
              setEventFilter(e.target.value || undefined)
            }
          >
            {clubEvents.length === 0 ? (
              <option value="">No Events Found</option>
            ) : (
              clubEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.eventName}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Table */}
        {loading || pageLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Joined At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <ProfileImage
                            firstName={member.staff.fullName.split(" ")[0]}
                            lastName={member.staff.fullName.split(" ")[1]}
                            imageUrl={member.staff.imageUrl}
                            size="sm"
                          />
                          <div>
                            <div style={{ fontWeight: "600" }}>
                              {member.staff.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{member.staff.email}</td>
                      <td>{member.role}</td>
                      <td>{member.event.eventName}</td>
                      <td>
                        <span
                          className={`badge ${
                            member.status === "ACCEPTED"
                              ? "badge-success"
                              : member.status === "PENDING"
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td>
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => handleEditStaff(member)}
                          >
                            <Edit size={12} />
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => handleDeleteStaff(member.id)} /* Keep as is */
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      No staff found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StaffEditor staff={selectedStaff} isOpen={showStaffEditor} onClose={() => setShowStaffEditor(false)} onSave={handleSaveStaff} />
    </div>
  );
};

export default StaffManager;
