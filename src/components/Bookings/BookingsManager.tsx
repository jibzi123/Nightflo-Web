import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Calendar, Users, MapPin, DollarSign, Clock } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';
import { apiClient } from '../../services/apiClient';

interface Booking {
  id: string;
  bookingType: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerImage?: string;
  totalAmount: number;
  eventDate: string;
  paymentStatus: string;
  status: string;
  ticketType?: string;
  quantity?: number;
  tableNumber?: string;
  tableCapacity?: number;
  clubName?: string;
  specialRequests?: string;
}

const BookingsManager: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'event-tickets' | 'table-bookings'>('event-tickets');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [pageLoading, setPageLoading] = useState(true);  // for events
  const [tableLoading, setTableLoading] = useState(false); // for bookings


  // 🔹 Event Dropdown State
  const [clubEvents, setClubEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateFilter, setDateFilter] = useState('');

  // 🔹 Fetch Club Events once
  useEffect(() => {
    const fetchClubEvents = async () => {
      try {
        setPageLoading(true);
        console.log(user?.club?.id);
        const [upcomingRes, pastRes] = await Promise.all([
          apiClient.getUpcomingEvents(),
          apiClient.getPastEvents(),
        ]);

        // merge and normalize
        const allEvents = [
          ...(upcomingRes.payLoad || []),
          ...(pastRes.payLoad || []),
        ].map(ev => ({
          ...ev,
          name: ev.eventName,   // 👈 map eventName → name
          value: ev.id          // 👈 for dropdown value
        }));

        setClubEvents(allEvents);

        if (allEvents.length > 0) {
          setSelectedEventId(allEvents[0].id);
          console.log("Default selected event ID:", allEvents[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch club events", err);
      }
      finally {
        setPageLoading(false);
      }
    };

    fetchClubEvents();
  }, []);


useEffect(() => {
    const fetchBookings = async () => {
      try {
        setTableLoading(true);

        let res: any = { payLoad: { tickets: [], tables: [] } };

        if (activeTab === "event-tickets" && selectedEventId) {
          console.log("Fetching bookings for event ID:", selectedEventId);
          res = await apiClient.getBookingsByEventId(
            selectedEventId,
            user?.club?.id || "",
            statusFilter !== "all" ? statusFilter : undefined,
            dateFilter || undefined
            
          );
        } else if (activeTab === "table-bookings" && user?.club?.id) {
          res = await apiClient.getBookingsByClubId(
            user?.club?.id,
            statusFilter !== "all" ? statusFilter : undefined,
            dateFilter || undefined
          );
        }

        const allBookings = [
          ...(res?.payLoad?.tickets || []),
          ...(res?.payLoad?.tables || []),
        ].map((item: any): Booking => ({
          id: item._id || item.id,
          bookingType:
            item.bookingType?.toLowerCase() ||
            (item.ticket ? "event-ticket" : item.tableNumber ? "general-table" : "unknown"),
          eventName: item.ticket?.eventName || item.eventName || "N/A",
          customerName: item.bookedBy?.fullName || "Unknown",
          customerEmail: item.bookedBy?.email || "",
          customerPhone: item.bookedBy?.phone || "",
          customerImage: item.bookedBy?.imageUrl,
          totalAmount: item.transaction?.price || item.totalAmount || 0,
          eventDate: item.transaction?.purchaseDate || item.purchaseDate || "",
          paymentStatus: item.transaction?.paymentStatus || "N/A",
          status: item.checkedInStatus || item.status || "pending",
          ticketType: item.ticket?.name,
          quantity: item.transaction?.tickets || 0,
          tableNumber: item.tableNumber,
          tableCapacity: item.tableCapacity,
          clubName: item.clubName || "N/A",
          specialRequests: item.specialRequests || "",
        }));

        setBookings(allBookings);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setTableLoading(false);
      }
    };

    fetchBookings();
  }, [activeTab, selectedEventId, statusFilter, dateFilter]);


  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // trigger API only when YYYY-MM-DD (full date) is chosen
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setDateFilter(value);
    }
  };



  // ...rest of your existing code for filters, rendering etc.


  // const filteredBookings = bookings.filter((booking) => {
  //   const matchesSearch =
  //     booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (user?.userType === "super_admin" &&
  //       booking.clubName?.toLowerCase().includes(searchTerm.toLowerCase()));

  //   const matchesClub = clubFilter === "all" || booking.clubName === clubFilter;
  //   const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
  //   const matchesDate = !dateFilter || booking.eventDate?.startsWith(dateFilter);

  //   const matchesTab =
  //     activeTab === "event-tickets"
  //       ? booking.bookingType === "event-ticket" || booking.bookingType === "event-table"
  //       : booking.bookingType === "general-table";

  //   return matchesSearch && matchesClub && matchesStatus && matchesDate && matchesTab;
  // });


  const filteredBookings = bookings.filter((booking) => {
    console.log('Filtering booking:', booking);
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.userType === "super_admin" &&
        booking.clubName?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.eventDate?.startsWith(dateFilter);


    const matchesTab =
      activeTab === "event-tickets"
        ? booking.bookingType === "ticket" || booking.bookingType === "table"
        : booking.bookingType === "unknown";

    return matchesSearch && matchesTab && matchesStatus && matchesDate;
  });


  // ✅ Badge Helpers
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "verified":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "refunded":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "refunded":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const handleStatusChange = (
    bookingId: string,
    newStatus: "confirmed" | "pending" | "cancelled" | "checked_in"
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
  };
  if (pageLoading) {
    return <div className="loading-spinner"></div>;
  }


  return (
    <div>
        <div className="card">
          {/* Header */}
          <div className="card-header">
            <h2 className="card-title">Bookings Management</h2>
            <p className="card-subtitle">
              Manage event tickets and table reservations
            </p>
          </div>

          {/* Tabs */}
          <div
            className="modal-tabs"
            style={{ borderBottom: "1px solid #e2e8f0", marginBottom: "24px" }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("event-tickets")}
              className={`modal-tab-button ${
                activeTab === "event-tickets" ? "active" : ""
              }`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px", // adds space between icon and text
                paddingRight: "12px", // extra right space for neatness
              }}
            >
              <Calendar size={16} />
              <span>
                Event Bookings
                {activeTab === "event-tickets" && (
                  <>
                    {" ("}
                    {
                      bookings.filter(
                        (b) => b.bookingType === "ticket" || b.bookingType === "table"
                      ).length
                    }
                    {")"}
                  </>
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("table-bookings")}
              className={`modal-tab-button ${
                activeTab === "table-bookings" ? "active" : ""
              }`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                paddingRight: "12px",
              }}
            >
              <MapPin size={16} />
              <span>
                Table Reservations
                {activeTab === "table-bookings" && (
                  <>
                    {" ("}
                    {bookings.filter((b) => b.bookingType === "unknown").length}
                    {")"}
                  </>
                )}
              </span>
            </button>
          </div>


          {/* Filters */}
          <div className="search-filter-container">
            {/* Search Input */}
            <div style={{ position: "relative", flex: 1, maxWidth: "250px" }}>
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
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
            </div>

            {/* Status Filter */}
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Date Filter */}
           <input
              type="date"
              className="filter-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            />

            {activeTab === "event-tickets" && (
              <select
                className="filter-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="">Select Event</option>
                {clubEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            )}

          </div>

          {/* Table */}
          <div
            className="table-section"
            style={{ position: "relative", minHeight: "200px" }}
          >
            {tableLoading  && (
              <div className="table-loader-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            {!tableLoading  && filteredBookings.length > 0 && (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>
                        {activeTab === "event-tickets"
                          ? "Event"
                          : "Reservation"}
                      </th>
                      {user?.userType === "super_admin" && <th>Club</th>}
                      <th>Booking Details</th>
                      <th>Amount</th>
                      <th>
                        {activeTab === "event-tickets"
                          ? "Event Date"
                          : "Reservation Date"}
                      </th>
                      <th>Status</th>
                      <th>Payment</th>
                      {/* <th>Actions</th> */}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        {/* Customer Info */}
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <ProfileImage
                              firstName={booking.customerName.split(" ")[0]}
                              lastName={
                                booking.customerName.split(" ")[1] || ""
                              }
                              imageUrl={booking.customerImage}
                              size="sm"
                            />
                            <div>
                              <div
                                style={{ fontWeight: "600", color: "#1e293b" }}
                              >
                                {booking.customerName}
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#64748b" }}
                              >
                                {booking.customerEmail}
                              </div>
                              <div
                                style={{ fontSize: "11px", color: "#9ca3af" }}
                              >
                                {booking.customerPhone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Event/Reservation */}
                        <td>
                          {activeTab === "event-tickets"
                            ? booking.eventName
                            : booking.bookingType === "general-table"
                            ? "Table Reservation"
                            : booking.eventName}
                        </td>

                        {/* Club (admin only) */}
                        {user?.userType === "super_admin" && (
                          <td>{booking.clubName}</td>
                        )}

                        {/* Booking Details */}
                        <td>
                          <div>
                            <div
                              style={{ fontWeight: "600", color: "#1e293b" }}
                            >
                              {booking.bookingType === "event-ticket"
                                ? booking.ticketType
                                : `Table ${booking.tableNumber || "N/A"}`}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              {booking.bookingType === "event-ticket"
                                ? `${booking.quantity} tickets`
                                : `Capacity: ${
                                    booking.tableCapacity || "?"
                                  } people`}
                            </div>
                            {booking.specialRequests && (
                              <div
                                style={{ fontSize: "11px", color: "#9ca3af" }}
                              >
                                {booking.specialRequests}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td style={{ fontWeight: "600", color: "#1e293b" }}>
                          ${booking.totalAmount}
                        </td>

                        {/* Date */}
                        <td>
                          {booking.eventDate
                            ? new Date(booking.eventDate).toLocaleDateString()
                            : "N/A"}
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`badge ${getStatusBadgeClass(
                              booking.status
                            )}`}
                          >
                            {booking.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Payment */}
                        <td>
                          <span
                            className={`badge ${getPaymentBadgeClass(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        {/* <td>
                          <select
                            value={booking.status}
                            onChange={(e) =>
                              handleStatusChange(booking.id, e.target.value)
                            }
                            style={{
                              padding: "4px 6px",
                              fontSize: "10px",
                              border: "1px solid #d1d5db",
                              borderRadius: "4px",
                              background: "#ffffff",
                            }}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="checked_in">Checked In</option>
                          </select>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!tableLoading  && filteredBookings.length === 0 && (
              <div className="empty-state">
                <Calendar
                  size={48}
                  style={{ color: "#9ca3af", margin: "0 auto 16px" }}
                />
                <div className="empty-state-title">No Bookings Found</div>
                <div className="empty-state-description">
                  {searchTerm ||
                  clubFilter !== "all" ||
                  statusFilter !== "all" ||
                  dateFilter
                    ? "Try adjusting your search or filter criteria"
                    : activeTab === "event-tickets"
                    ? "No event bookings available yet"
                    : "No table reservations available yet"}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default BookingsManager;