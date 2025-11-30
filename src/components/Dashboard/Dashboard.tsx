// ...existing code...
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../services/apiClient";
import { DashboardStats } from "../../types/api";
import {
  DollarSign,
  Calendar,
  Users,
  UserCheck,
  TrendingUp,
  Activity,
} from "lucide-react";
import "../../styles/dashboard.css";

// Antd date range picker
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import "antd/dist/reset.css";
import dayjs from "dayjs";

interface ClubEvent {
  id?: string;
  eventName: string;
}
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<string | undefined>(undefined);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);

  // Date range state (Dayjs pair for control, and formatted strings)
  const [rangeDates, setRangeDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [rangeStrings, setRangeStrings] = useState<[string, string] | null>(
    null
  );
  // Initialize default date range on component mount
  useEffect(() => {
    const startDate = dayjs().subtract(1, "month").startOf("month");
    const endDate = dayjs().add(2, "months").endOf("month");

    setRangeDates([startDate, endDate]);
    setRangeStrings([
      startDate.format("YYYY-MM-DD"),
      endDate.format("YYYY-MM-DD"),
    ]);
  }, []);
  useEffect(() => {
    const fetchClubEvents = async () => {
      try {
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
      }
    };

    fetchClubEvents();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const eventParam =
          eventFilter === undefined || eventFilter === ""
            ? undefined
            : eventFilter;

        const data = await apiClient.getDashboardStats(
          user?.club?.id,
          eventParam,
          rangeStrings ? rangeStrings[0] : undefined,
          rangeStrings ? rangeStrings[1] : undefined
        );
        console.log(data?.payLoad);
        setStats(data?.payLoad);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.club?.id) {
      fetchStats();
    }
  }, [JSON.stringify(rangeStrings), eventFilter]);

  // Range picker change handler — formats to YYYY-MM-DD and stores strings
  const onRangeChange = (
    dates: null | [Dayjs, Dayjs],
    _dateStrings: [string, string] | null
  ) => {
    if (!dates) {
      setRangeDates(null);
      setRangeStrings(null);
      console.log("Date range cleared");
      return;
    }
    const start = dates[0].format("YYYY-MM-DD");
    const end = dates[1].format("YYYY-MM-DD");
    setRangeDates(dates);
    setRangeStrings([start, end]);
    console.log("Selected date range:", start, end);
    // TODO: if you want to trigger filtering/fetching using these dates, call your api here
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.fullName}!</h1>
        <p className="dashboard-subtitle">
          Here's what's happening with your{" "}
          {user?.userType === "super_admin"
            ? "entire platform network"
            : "club"}{" "}
          today.
        </p>
      </div>

      <div className="search-filter-container" style={{ marginBottom: "20px" }}>
        {/* <div className="filter-controls"> */}
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

        <DatePicker.RangePicker
          value={rangeDates ?? undefined}
          onChange={onRangeChange}
          format="YYYY-MM-DD"
          allowClear
          placeholder={["Start date", "End date"]}
          className="dashboard-range-picker"
          style={{ minWidth: 260 }}
        />
        {/* </div> */}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title stat-title-unde-transform">
              Total Revenue
            </span>
            <DollarSign size={20} style={{ color: "#20c997" }} />
          </div>
          <div className="stat-value">
            ${stats?.totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title stat-title-unde-transform">
              Tickets vs Capacity All Events
            </span>
            <Calendar size={20} style={{ color: "#405189" }} />
          </div>
          <div className="stat-value">
            {stats?.tickets?.bookedCount} / {stats?.tickets?.totalCount}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title stat-title-unde-transform">
              Tables Booked{" "}
            </span>
            <Users size={20} style={{ color: "#ffc107" }} />
          </div>
          <div className="stat-value">
            {stats?.tables?.bookedCount} / {stats?.tables?.totalCount}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title stat-title-unde-transform">
              Avg Spend / Guest Incl. bar
            </span>
            <UserCheck size={20} style={{ color: "#ef4444" }} />
          </div>
          <div className="stat-value">{stats?.averageSpentPerGuest}</div>
        </div>
      </div>

      <div className="events-card">
        <div className="header-row">
          <div className="title-section">
            <h2>Upcoming Events Performance</h2>
            <p>Next 3 events based on tickets & tables.</p>
          </div>
          {/* <button className="view-all">View all events</button> */}
        </div>

        <table className="events-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Event Date</th>
              <th>Tables Booked</th>
              <th>Tickets Sold</th>
              <th>Total Tables</th>
              <th>Total Tickets</th>
              <th>Event Start Time</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats?.allEvents?.map((e, i) => (
              <tr key={i}>
                <td>{e.eventName}</td>
                <td>{new Date(e.eventDate).toLocaleDateString()}</td>
                <td>{e.tablesBooked}</td>
                <td>{e.ticketsSold}</td>
                <td>{e.totalTables}</td>
                <td>{e.totalTickets}</td>
                <td>{new Date(e.startTime).toLocaleDateString()}</td>
                <td>{e.revenue}</td>
                <td>
                  <span className={`status-badge ${e.statusClass}`}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
