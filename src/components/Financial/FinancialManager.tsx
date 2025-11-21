import React, { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
} from "lucide-react";
import "../../styles/components.css";

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  ticketSales: number;
  barSales: number;
  vipSales: number;
}

const FinancialManager: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getFinancialReport(dateRange);
      setFinancialData(data);
    } catch (error) {
      console.error("Failed to fetch financial data:", error);
      // Mock data for demonstration
      setFinancialData({
        totalRevenue: 125000,
        totalExpenses: 75000,
        netProfit: 50000,
        ticketSales: 85000,
        barSales: 35000,
        vipSales: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Financial Management</h2>
          <p className="card-subtitle">
            Monitor revenue, expenses, and profitability
          </p>
        </div>

        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div className="form-group" style={{ margin: 0, minWidth: "140px" }}>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>
          <div className="form-group" style={{ margin: 0, minWidth: "140px" }}>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>
          <button
            className="btn btn-secondary-outlined"
            style={{ marginTop: "24px" }}
          >
            Generate Report
          </button>
        </div>

        {financialData && (
          <>
            <div className="stats-grid" style={{ marginBottom: "32px" }}>
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Total Revenue</span>
                  <DollarSign
                    className="stat-icon"
                    style={{ color: "#10b981" }}
                  />
                </div>
                <div className="stat-value">
                  ${financialData.totalRevenue.toLocaleString()}
                </div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  +12.5% from last period
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Total Expenses</span>
                  <BarChart3
                    className="stat-icon"
                    style={{ color: "#ef4444" }}
                  />
                </div>
                <div className="stat-value">
                  ${financialData.totalExpenses.toLocaleString()}
                </div>
                <div className="stat-change negative">
                  <TrendingUp size={14} />
                  +5.2% from last period
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Net Profit</span>
                  <Calculator
                    className="stat-icon"
                    style={{ color: "#405189" }}
                  />
                </div>
                <div className="stat-value">
                  ${financialData.netProfit.toLocaleString()}
                </div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  +25.3% from last period
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <PieChart
                      size={20}
                      style={{
                        display: "inline-block",
                        marginRight: "8px",
                        color: "#405189",
                      }}
                    />
                    Revenue Breakdown
                  </h3>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#fff" }}>Ticket Sales</span>
                    <span style={{ color: "#878787", fontWeight: "600" }}>
                      ${financialData.ticketSales.toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#fff" }}>Bar Sales</span>
                    <span style={{ color: "#878787", fontWeight: "600" }}>
                      ${financialData.barSales.toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#fff" }}>VIP Services</span>
                    <span style={{ color: "#878787", fontWeight: "600" }}>
                      ${financialData.vipSales.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <button className="btn btn-secondary-outlined">
                    Process Refund
                  </button>
                  <button className="btn btn-secondary-outlined">
                    Generate Invoice
                  </button>
                  <button className="btn btn-secondary-outlined">
                    Export Financial Report
                  </button>
                  <button className="btn btn-secondary-outlined">
                    View Tax Summary
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinancialManager;
