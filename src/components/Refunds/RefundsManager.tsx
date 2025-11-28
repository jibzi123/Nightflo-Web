import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Search, DollarSign } from "lucide-react";
import ProfileImage from "../common/ProfileImage";
import "../../styles/components.css";
import { apiClient } from "../../services/apiClient";

interface Refund {
  id: string;
  customerName: string;
  customerEmail: string;
  customerImage?: string;
  name: string;

  eventName: string;
  bookingType: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  requestDate: string;
  processedDate?: string;
}
interface ClubEvent {
  id?: string;
  eventName: string;
}
const RefundsManager: React.FC = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState<string | undefined>(undefined);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [pageLoading, setPageLoading] = useState(false);

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

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter === "all" ? undefined : statusFilter;
      const eventParam =
        eventFilter === undefined || eventFilter === ""
          ? undefined
          : eventFilter;

      const response = await apiClient.getRefundBookingsList(
        user?.club?.id || "",
        // "6825dfdc873bb4f6540042f6",
        eventParam || ""
      );
      console.log(response, "response");
      const refundsData = response?.payLoad || [];
      const mappedRefunds: Refund[] = refundsData.map(
        (p: any, index: string) => {
          return {
            id: index + 1,
            customerName: p.customerName,
            customerEmail: p.customerEmail,
            name: p.ticketName || p.tableNumber,
            customerImage:
              "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
            eventName: p.eventName,
            bookingType: p.bookingType,
            originalAmount: p.originalPrice,
            refundAmount: p.amountRefunded,
            // reason: "Event cancelled due to weather",
            status: p.checkedInStatus,
            requestDate: p.refundDate,
          };
        }
      );
      setRefunds(mappedRefunds);
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.club?.id) {
      fetchRefunds();
    }
  }, [statusFilter, eventFilter]);

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || refund.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "approved":
        return "badge-success";
      case "rejected":
        return "badge-danger";
      case "processed":
        return "badge-info";
      default:
        return "badge-info";
    }
  };

  // if (loading) {
  //   return <div className="loading-spinner"></div>;
  // }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Refunds Management</h2>
          <p className="card-subtitle">
            Process customer refund requests and track refund history
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <select
            className="filter-select"
            value={eventFilter || ""}
            onChange={(e) => setEventFilter(e.target.value || undefined)}
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
          <div className="search-filter-container">
            {/* Event dropdown */}

            <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#fff",
                }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search refunds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
            </div>

            {/* <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processed">Processed</option>
            </select> */}
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Event</th>
                <th>Booking Type</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                {/*  <th>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((refund) => (
                <tr key={refund.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <ProfileImage
                        firstName={refund.customerName.split(" ")[0]}
                        lastName={refund.customerName.split(" ")[1] || ""}
                        imageUrl={refund.customerImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: "600", color: "#fff" }}>
                          {refund.customerName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#A5A5A5" }}>
                          {refund.customerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{refund.eventName}</td>
                  <td>{refund.bookingType}</td>
                  <td>{refund.name}</td>
                  <td>
                    <div>
                      <div style={{ fontWeight: "600", color: "#fff" }}>
                        ${refund.refundAmount}
                      </div>
                      <div style={{ fontSize: "11px", color: "#A5A5A5" }}>
                        of ${refund.originalAmount}
                      </div>
                    </div>
                  </td>
                  {/* <td style={{ maxWidth: "200px" }}>
                    <div style={{ fontSize: "12px", color: "#fff" }}>
                      {refund.reason}
                    </div>
                  </td> */}
                  <td>
                    <span
                      className={`badge ${getStatusBadgeClass(refund.status)}`}
                    >
                      {refund.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "12px" }}>
                      <div style={{ color: "#fff" }}>
                        {new Date(refund.requestDate).toLocaleDateString()}
                      </div>
                      {refund.processedDate && (
                        <div style={{ color: "#A5A5A5" }}>
                          Processed:{" "}
                          {new Date(refund.processedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  {/* <td>
                    {refund.status === "pending" && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-success"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                          onClick={() =>
                            handleRefundAction(refund.id, "approve")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                          onClick={() =>
                            handleRefundAction(refund.id, "reject")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {refund.status !== "pending" && (
                      <span style={{ fontSize: "12px", color: "#fff" }}>
                        {refund.status === "approved"
                          ? "Approved"
                          : refund.status === "rejected"
                          ? "Rejected"
                          : "Processed"}
                      </span>
                    )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRefunds.length === 0 && (
          <div className="empty-state">
            <DollarSign
              size={48}
              style={{ color: "#9ca3af", margin: "0 auto 16px" }}
            />
            <div className="empty-state-title">No Refunds Found</div>
            <div className="empty-state-description">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No refund requests at this time"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundsManager;
