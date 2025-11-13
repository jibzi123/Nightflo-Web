import React, { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";
import { useAuth } from "../../contexts/AuthContext";
import { Search, Filter, Mail, Plus, Percent } from "lucide-react";
import ProfileImage from "../common/ProfileImage";
import "../../styles/components.css";

interface Promoter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  commissionRate: number;
  totalCommissions: number;
  eventsPromoted: number;
  ticketsSold: number;
  status: "active" | "inactive";
  profileImage?: string;
}

const PromoterManager: React.FC = () => {
  const { user } = useAuth();
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPromoters();
  }, []);

  const fetchPromoters = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPromoters();
      setPromoters(data);
    } catch (error) {
      console.error("Failed to fetch promoters:", error);
      // Mock data for demonstration
      setPromoters([
        {
          id: "1",
          firstName: "Lisa",
          lastName: "Chen",
          email: "lisa.chen@promoter.com",
          phone: "+1 555-0301",
          commissionRate: 15,
          totalCommissions: 3500,
          eventsPromoted: 12,
          ticketsSold: 280,
          status: "active",
          profileImage:
            "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
        },
        {
          id: "2",
          firstName: "David",
          lastName: "Rodriguez",
          email: "david.r@promoter.com",
          phone: "+1 555-0302",
          commissionRate: 12,
          totalCommissions: 2800,
          eventsPromoted: 8,
          ticketsSold: 190,
          status: "active",
        },
        // Additional promoters for super admin view
        ...(user?.userType === "super_admin"
          ? [
              {
                id: "3",
                firstName: "Jessica",
                lastName: "Wong",
                email: "jessica.w@globalpromoter.com",
                phone: "+1 555-0303",
                commissionRate: 18,
                totalCommissions: 4200,
                eventsPromoted: 15,
                ticketsSold: 350,
                status: "active" as const,
                profileImage:
                  "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150",
              },
              {
                id: "4",
                firstName: "Marcus",
                lastName: "Thompson",
                email: "marcus.t@citypromoter.com",
                phone: "+1 555-0304",
                commissionRate: 14,
                totalCommissions: 3100,
                eventsPromoted: 10,
                ticketsSold: 220,
                status: "active" as const,
              },
            ]
          : []),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPromoters = promoters.filter((promoter) => {
    const matchesSearch =
      promoter.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promoter.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promoter.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || promoter.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const updateCommissionRate = (promoterId: string, newRate: number) => {
    setPromoters((prev) =>
      prev.map((p) =>
        p.id === promoterId ? { ...p, commissionRate: newRate } : p
      )
    );
  };

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
          <button className="btn btn-primary">
            <span>+</span>
            Add Promoter
          </button>
          <button className="btn btn-secondary-outlined">
            <Mail size={16} />
            Send Invitations
          </button>
          <button className="btn btn-secondary-outlined">
            Commission Report
          </button>
        </div>

        <div className="search-filter-container">
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
              placeholder="Search promoters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>

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

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Commission Rate</th>
                <th>Total Earnings</th>
                <th>Events</th>
                <th>Tickets Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromoters.map((promoter) => (
                <tr key={promoter.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <ProfileImage
                        firstName={promoter.firstName}
                        lastName={promoter.lastName}
                        imageUrl={promoter.profileImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: "600", color: "#1e293b" }}>
                          {promoter.firstName} {promoter.lastName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {promoter.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{promoter.email}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <input
                        type="number"
                        value={promoter.commissionRate}
                        onChange={(e) =>
                          updateCommissionRate(
                            promoter.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        style={{
                          width: "60px",
                          padding: "4px 8px",
                          border: "1px solid #323232",
                          borderRadius: "4px",
                          fontSize: "12px",
                          background: "#111",
                          color: "#fff",
                        }}
                        min="0"
                        max="100"
                        step="0.5"
                      />
                      <Percent size={14} style={{ color: "#fff" }} />
                    </div>
                  </td>
                  <td>${promoter.totalCommissions.toLocaleString()}</td>
                  <td>{promoter.eventsPromoted}</td>
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
                      <button
                        className="btn btn-secondary-outlined"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-secondary-outlined"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromoterManager;
