import React, { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";
import { useAuth } from "../../contexts/AuthContext";
import { Search, Mail, Plus } from "lucide-react";
import ProfileImage from "../common/ProfileImage";
import "../../styles/components.css";
import { toast } from "react-toastify";

interface Promoter {
  id: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  ticketsSold: number;
  totalEarnings: number;
  eventsCount: number;
  status: "active" | "inactive";
}

interface ClubEvent {
  id?: string;
  eventName: string;
}

const PromoterManager: React.FC = () => {
  const { user } = useAuth();
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<string | undefined>(undefined);
  const [pageLoading, setPageLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  // Fetch all club events (upcoming + past)
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

        // Insert "All Events" option at the top
        allEvents.unshift({ id: undefined, eventName: "All Events" });
        setClubEvents(allEvents);
        setEventFilter(undefined);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchClubEvents();
  }, []);

  // Fetch promoters whenever statusFilter or eventFilter changes
  useEffect(() => {
    if (user?.club?.id) {
      fetchPromoters();
    }
  }, [statusFilter, eventFilter]);

  const fetchPromoters = async () => {
    try {
      setLoading(true);
      const statusParam =
        statusFilter === "all" ? undefined : statusFilter;
      const eventParam =
        eventFilter === undefined || eventFilter === "" ? undefined : eventFilter;

      const response = await apiClient.getPromotersByClubId(
        user?.club?.id || "",
        eventParam,
        statusParam
      );

      const promotersData = response?.payLoad?.promoters || [];

      const mappedPromoters: Promoter[] = promotersData.map((p: any) => {
        const rawEmail = p.promoterInfo?.email || "-";
        const cleanedEmail = rawEmail.replace(".inactive", "");

        return {
          id: p.promoterInfo?.id,
          fullName: p.promoterInfo?.fullName || "Unnamed",
          email: cleanedEmail,
          imageUrl: p.promoterInfo?.imageUrl,
          ticketsSold: p.stats?.ticketsSold || 0,
          totalEarnings: p.stats?.totalEarnings || 0,
          eventsCount: p.stats?.eventsCount || 0,
          status: rawEmail.includes(".inactive") ? "inactive" : "active",
        };
      });

      setPromoters(mappedPromoters);
    } catch (error) {
      console.error("Failed to fetch promoters:", error);
      setPromoters([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering on search + status
  const filteredPromoters = promoters.filter((promoter) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      promoter.fullName.toLowerCase().includes(search) ||
      promoter.email.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "all" || promoter.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSendInvite = async () => {
  if (!inviteEmail.trim()) {
    toast.error("Please enter an email.");
    return;
  }

  const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
  if (!reg.test(inviteEmail)) {
    toast.error("Please enter a valid email address.");
    return;
  }

  try {
    setIsLoading(true);

    const res = await apiClient.invitePromoterByEmail(inviteEmail);

    toast.success(res.message || "Invitation sent successfully!");
    setInviteEmail("");
    setIsModalOpen(false);
  } catch (err: any) {
    toast.error(
      err?.response?.data?.message ||
        "Failed to send invitation. Maybe it's already sent."
    );
  } finally {
    setIsLoading(false);
  }
};


  function isValidEmail(email: string) {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return email.length > 0 ? reg.test(email) : false;
  }
  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Promoter Network</h2>
          <p className="card-subtitle">
            Manage event promoters and track their performance
          </p>
        </div>

        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* <button className="btn btn-primary">
            <Plus size={16} />
            Add Promoter
          </button> */}
          <button className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}>
            <Mail size={16} />
            Send Invitations
          </button>
        </div>

        {/* Search + Filters */}
        <div className="search-filter-container">
          {/* Search box */}
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
              placeholder="Search promoters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>

          {/* Event dropdown */}
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
                <option key={ev.id} value={ev.id || ""}>
                  {ev.eventName}
                </option>
              ))
            )}
          </select>

          {/* Status dropdown */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Promoters Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Total Earnings</th>
                <th>Events</th>
                <th>Tickets Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromoters.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                    No promoters found.
                  </td>
                </tr>
              ) : (
                filteredPromoters.map((promoter) => (
                  <tr key={promoter.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <ProfileImage
                          firstName={promoter.fullName.split(" ")[0] || ""}
                          lastName={promoter.fullName.split(" ")[1] || ""}
                          imageUrl={promoter.imageUrl}
                          size="sm"
                        />
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>
                          {promoter.fullName}
                        </div>
                      </div>
                    </td>
                    <td>{promoter.email}</td>
                    <td>${promoter.totalEarnings.toLocaleString()}</td>
                    <td>{promoter.eventsCount}</td>
                    <td>{promoter.ticketsSold}</td>
                    <td>
                      <span
                        className={`badge ${
                          promoter.status === "active"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {promoter.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                          View
                        </button>
                        <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    {isModalOpen && (
      <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div
          className="modal-content"
          style={{ maxWidth: "500px" }}
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        >
          <h2 className="modal-title" style={{paddingTop: 10, paddingLeft: 20}}>Send Promoter Invitation</h2>
          <div className="modal-body">
            <input
              className="form-input"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter promoter email"
            />
          </div>

          <div className="modal-footer">
            <button
              className="btn-secondary"
              onClick={() => {
                setIsModalOpen(false);
                setMessage(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSendInvite}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </div>
      </div>
    )}


    </div>
  );
};

export default PromoterManager;
