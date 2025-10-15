import React, { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";
import { useAuth } from "../../contexts/AuthContext";
import { Search } from "lucide-react";
import ProfileImage from "../common/ProfileImage";
import "../../styles/components.css";

interface Customer {
  userId: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  isVerified: boolean;
  profileComplete: boolean;
  createdAt: string;
  ticketCount: number;
  tableCount: number;
  ticketTotal: number;
  tableTotal: number;
  totalSpent: number;
}

const CustomerManager: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vipFilter, setVipFilter] = useState("all");

  useEffect(() => {
    if (user?.club?.id) {
      fetchCustomers(user.club?.id || "");
    }
  }, [user]);

  const fetchCustomers = async (clubId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getCustomersByClubId(clubId);
      if (response?.payLoad) {
        setCustomers(response.payLoad);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVip =
      vipFilter === "all" ||
      (vipFilter === "vip" && customer.totalSpent >= 1000) ||
      (vipFilter === "regular" && customer.totalSpent < 1000);

    return matchesSearch && matchesVip;
  });

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Customer Management</h2>
          <p className="card-subtitle">
            Manage your customer database and loyalty programs
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
            Add Customer
          </button>
          <button className="btn btn-secondary">Export Data</button>
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
                color: "#64748b",
              }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>

          <select
            className="filter-select"
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
          >
            <option value="all">All Customers</option>
            <option value="vip">VIP (Spent ≥ $1000)</option>
            <option value="regular">Regular (Spent &lt; $1000)</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Email</th>
                <th>Tickets</th>
                <th>Tables</th>
                <th>Total Spent ($)</th>
                <th>Joined</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.userId}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <ProfileImage
                          firstName={customer.fullName.split(" ")[0]}
                          lastName={customer.fullName.split(" ")[1] || ""}
                          imageUrl={customer.imageUrl}
                          size="sm"
                        />
                        <div>
                          <div
                            style={{ fontWeight: "600", color: "#1e293b" }}
                          >
                            {customer.fullName}
                          </div>
                          <div
                            style={{ fontSize: "12px", color: "#64748b" }}
                          >
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{customer.email}</td>
                    <td>
                      {customer.ticketCount} (${customer.ticketTotal})
                    </td>
                    <td>
                      {customer.tableCount} (${customer.tableTotal})
                    </td>
                    <td>${customer.totalSpent.toLocaleString()}</td>
                    <td>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          customer.isVerified
                            ? "badge-success"
                            : "badge-info"
                        }`}
                      >
                        {customer.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerManager;
