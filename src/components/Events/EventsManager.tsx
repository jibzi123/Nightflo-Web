import React, { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";
import { Event, Table, TicketTier } from "../../types/api";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Search,
  Calendar,
  DollarSign,
  UserCheck,
  MapPin,
  CheckCircle,
  Delete,
} from "lucide-react";
import EventStaffManager from "./EventStaffManager";
import GuestList from "./GuestList";
import EventSummary from "./EventSummary";
import "../../styles/events.css";
import "../../styles/components.css";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

interface TicketEditorProps {
  ticket: TicketTier | null;
  isOpen: boolean;
  eventId: any;
  onClose: () => void;
  onSave: (ticket: TicketTier) => void;
}

const TicketEditor: React.FC<TicketEditorProps> = ({
  ticket,
  isOpen,
  eventId,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<TicketTier>({
    id: "",
    name: "",
    price: 0,
    count: 0,
    sold: 0,
    description: ["", "", ""],
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        ...ticket,
        description: [...ticket.description, "", "", ""].slice(0, 3), // always 3 slots
      });
    } else {
      setFormData({
        id: "",
        name: "",
        price: 0,
        count: 0,
        sold: 0,
        description: ["", "", ""],
      });
    }
  }, [ticket]);

  const handleClose = () => {
    setFormData({
      id: "",
      name: "",
      price: 0,
      count: 0,
      sold: 0,
      description: ["", "", ""],
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🧹 Clean description (remove empty slots)
    const cleanedDescriptions = formData.description.filter(
      (d) => d.trim() !== ""
    );

    try {
      if (formData.id) {
        // 🔄 Update Ticket
        const response = await apiClient.updateTicket({
          name: formData.name,
          price: formData.price,
          count: formData.count,
          description: cleanedDescriptions,
          ticketId: formData.id,
        });

        if (response.status === "Success") {
          onSave(response.payLoad); // update list in parent
        }
      } else {
        // 🆕 Create Ticket
        const response = await apiClient.createTicket({
          eventId: eventId, // ✅ required only for new ticket
          name: formData.name,
          price: formData.price,
          count: formData.count,
          description: cleanedDescriptions,
        });

        if (response.status === "Success") {
          onSave(response.payLoad); // add to list in parent
        }
      }
      handleClose();
      onClose(); // ✅ close modal only after success
    } catch (err) {
      console.error("❌ Failed to save ticket:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {ticket ? "Edit Ticket" : "Create New Ticket"}
          </h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Ticket Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., General Admission, VIP, Early Bird"
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.count}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      count: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descriptions (up to 3)</label>
              {formData.description.map((desc, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="form-input"
                  value={desc}
                  placeholder={`Description ${idx + 1}`}
                  onChange={(e) => {
                    const newDescriptions = [...formData.description];
                    newDescriptions[idx] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      description: newDescriptions,
                    }));
                  }}
                />
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary-outlined"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {ticket ? "Update Ticket" : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface TableEditorProps {
  table: Table | null;
  isOpen: boolean;
  eventId: string;
  clubId: string;
  onClose: () => void;
  onSave: (table: Table) => void;
}

const TableEditor: React.FC<TableEditorProps> = ({
  table,
  isOpen,
  eventId,
  clubId,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Table>({
    id: "",
    tableNumber: "",
    price: 0,
    capacity: 0,
    tableCount: 1,
    description: ["", "", ""],
    status: "available",
  });

  useEffect(() => {
    if (table) {
      setFormData({
        ...table,
        description: [...(table.description || []), "", "", ""].slice(0, 3),
      });
    } else {
      setFormData({
        id: "",
        tableNumber: "",
        price: 0,
        capacity: 0,
        tableCount: 1,
        description: ["", "", ""],
        status: "available",
      });
    }
  }, [table]);

  const handleClose = () => {
    setFormData({
      id: "",
      tableNumber: "",
      price: 0,
      capacity: 0,
      tableCount: 1,
      description: ["", "", ""],
      status: "available",
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedDescriptions = formData.description.filter(
      (d) => d.trim() !== ""
    );

    try {
      if (formData.id) {
        // update
        const response = await apiClient.updateTable({
          tableId: formData.id,
          tableNumber: formData.tableNumber,
          price: formData.price,
          capacity: formData.capacity,
          tableCount: formData.tableCount,
          description: cleanedDescriptions,
          clubId,
          status: "available",
        });

        if (response.status === "Success") {
          onSave(response.payLoad);
        }
      } else {
        // create
        const response = await apiClient.createTable({
          eventId,
          tableNumber: formData.tableNumber,
          price: formData.price,
          capacity: formData.capacity,
          tableCount: formData.tableCount,
          description: cleanedDescriptions,
          clubId,
        });

        if (response.status === "Success") {
          onSave(response.payLoad);
        }
      }
      handleClose();
    } catch (err) {
      console.error("❌ Failed to save table:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {table ? "Edit Table" : "Create New Table"}
          </h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Table Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.tableNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tableNumber: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                className="form-input"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                className="form-input"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    capacity: parseInt(e.target.value) || 0,
                  }))
                }
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Table Count</label>
              <input
                type="number"
                className="form-input"
                value={formData.tableCount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tableCount: parseInt(e.target.value) || 1,
                  }))
                }
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Descriptions (up to 3)</label>
              {formData.description.map((desc, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="form-input"
                  value={desc}
                  placeholder={`Description ${idx + 1}`}
                  onChange={(e) => {
                    const newDescriptions = [...formData.description];
                    newDescriptions[idx] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      description: newDescriptions,
                    }));
                  }}
                />
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {table ? "Update Table" : "Create Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EventsManagerProps {
  onModuleChange?: (module: string) => void;
  onEditEvent: (event: any) => void;
  upcomingEvents: any[];
  pastEvents: any[];
}

const EventsManager: React.FC<EventsManagerProps> = ({
  onModuleChange,
  onEditEvent,
  upcomingEvents,
  pastEvents,
}) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [clubFilter, setClubFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showTickets, setShowTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketTier | null>(null);
  const [showTicketEditor, setShowTicketEditor] = useState(false);
  const [showStaffManager, setShowStaffManager] = useState(false);
  const [staffManagerEvent, setStaffManagerEvent] = useState<Event | null>(
    null
  );
  const [showGuestList, setShowGuestList] = useState(false);
  const [guestListEvent, setGuestListEvent] = useState<Event | null>(null);
  const [showEventSummary, setShowEventSummary] = useState(false);
  const [summaryEvent, setSummaryEvent] = useState<Event | null>(null);
  const [showTables, setShowTables] = useState(false);
  const { user } = useAuth();

  const [upcomingEventsList, setUpcomingEvents] = useState<any[]>([]);
  const [pastEventsList, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableEditor, setShowTableEditor] = useState(false);

  // const [updatedEvent, setUpdatedEvent] = useState<any | null>(null); // to watch for updates from App.tsx

  useEffect(() => {
    console.log("Club Id", user?.club?.id);
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const [upcomingRes, pastRes] = await Promise.all([
          apiClient.getUpcomingEvents(),
          apiClient.getPastEvents(),
        ]);

        setUpcomingEvents(upcomingRes.payLoad || []);
        setPastEvents(pastRes.payLoad || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (showTickets && selectedEvent?.id) {
      const fetchTickets = async () => {
        try {
          setLoadingTickets(true);
          setTickets([]); // clear previous tickets
          const response = await apiClient.getTicketsByEvent(selectedEvent.id);
          setTickets(response.payLoad || []);
        } catch (err) {
          console.error("❌ Failed to load tickets", err);
        } finally {
          setLoadingTickets(false);
        }
      };
      fetchTickets();
    }
  }, [showTickets, selectedEvent]);

  useEffect(() => {
    const fetchTables = async () => {
      if (!selectedEvent || !showTables) return;

      try {
        setTables([]);
        const response = await apiClient.getTablesByEvent(selectedEvent.id);

        setTables(response.payLoad); // ✅ correct path
      } catch (err) {
        console.error("Failed to fetch tables", err);
        setTables([]);
      }
    };

    fetchTables();
  }, [selectedEvent, showTables]);

  const handleCreateEvent = () => {
    if (onModuleChange) {
      onModuleChange("create-event");
    }
  };

  const handleViewTickets = (event: Event) => {
    setSelectedEvent(event);
    setShowTickets(true);
  };

  const handleEditTicket = (ticket: TicketTier) => {
    setSelectedTicket(ticket);
    setShowTicketEditor(true);
  };

  const handleCreateTicket = (eventId: string) => {
    setSelectedTicket(null);
    setSelectedEventId(eventId); // 🔹 store event id in state
    setShowTicketEditor(true);
  };

  const handleSaveTicket = (ticket: TicketTier) => {
    if (!selectedEvent) return;

    const updatedEvent = {
      ...selectedEvent,
      ticketTiers: selectedTicket
        ? (selectedEvent.ticketTiers ?? []).map((t) =>
            t.id === ticket.id ? ticket : t
          )
        : [...(selectedEvent.ticketTiers ?? []), ticket],
    };

    setUpcomingEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    setSelectedEvent(updatedEvent);
  };

  const handleDeleteTicket = async (ticket: TicketTier) => {
    if (!selectedEvent) return;

    if (confirm("Are you sure you want to delete this ticket tier?")) {
      try {
        await apiClient.deleteTicket(ticket.id); // ✅ just pass ticketId
        setSelectedTicket(ticket);
        toast.success("Ticket has been deleted.");

        // update event tickets list
        const updatedEvent = {
          ...selectedEvent,
          ticketTiers: selectedEvent.ticketTiers.filter(
            (t) => t.id !== ticket.id
          ),
        };

        setUpcomingEvents((prev) =>
          prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        );
        setSelectedEvent(updatedEvent);
      } catch (err) {
        toast.error("Failed to delete ticket");
        console.error(err);
      } finally {
        setLoadingDeleteId(null);
      }
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setLoadingDeleteId(eventId);
      await apiClient.deleteEvent(`${eventId}`);
      toast.success("Your event has been deleted.");

      // remove from UI
      setUpcomingEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      setPastEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (err) {
      toast.error("Failed to delete event");
      console.error(err);
    } finally {
      setLoadingDeleteId(null);
    }
  };
  const handleManageStaff = (event: Event) => {
    setStaffManagerEvent(event);
    setShowStaffManager(true);
  };

  const handleViewGuestList = (event: Event) => {
    setGuestListEvent(event);
    setShowGuestList(true);
  };

  const handleViewSummary = (event: Event) => {
    setSummaryEvent(event);
    setShowEventSummary(true);
  };

  const handleViewTables = (event: Event) => {
    setSelectedEvent(event);
    setShowTables(true); // ✅ open tables modal
  };

  const handleCreateTable = (eventId: string) => {
    setSelectedTable(null);
    setSelectedEventId(eventId);
    setShowTableEditor(true);
  };

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setShowTableEditor(true);
  };

  const handleSaveTable = (table: Table) => {
    if (!selectedEvent) return;
    const updatedEvent = {
      ...selectedEvent,
      tables: selectedTable
        ? (selectedEvent.tables ?? []).map((t) =>
            t.id === table.id ? table : t
          )
        : [...(selectedEvent.tables ?? []), table],
    };

    setUpcomingEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    setSelectedEvent(updatedEvent);
  };

  const handleDeleteTable = async (table: Table) => {
    if (!selectedEvent) return;

    if (!confirm("Are you sure you want to delete this table?")) {
      return;
    }

    try {
      await apiClient.deleteTable(table.id);

      const updatedEvent = {
        ...selectedEvent,
        tables: (selectedEvent.tables ?? []).filter((t) => t.id !== table.id),
      };

      setUpcomingEvents((prev) =>
        prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
      );
      setSelectedEvent(updatedEvent);

      toast.success("Table has been deleted."); // ✅ success only after state update
    } catch (err) {
      console.error("❌ Failed to delete table:", err);
      toast.error("Failed to delete table"); // ✅ only error if API fails
    }
  };

  const filteredEvents = pastEventsList.filter((event) => {
    const matchesFilter = filter === "all" || event.status === filter;
    // const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //                      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClub = clubFilter === "all" || event.clubId === clubFilter;
    const matchesDate = !dateFilter || event.date === dateFilter;
    return matchesFilter && matchesClub && matchesDate;
  });

  // Calculate stats based on current filters
  const getFilteredStats = () => {
    const eventsToCalculate = pastEventsList;
    const eventsToCalculateUpcoming = upcomingEventsList;

    const totalEvents =
      eventsToCalculate.length + eventsToCalculateUpcoming.length;
    const totalRevenue = eventsToCalculate.reduce(
      (sum, event) => sum + event.totalSales,
      0
    );
    const upcomingEvents = eventsToCalculate.filter(
      (event) =>
        new Date(event.date) > new Date() && event.status === "published"
    ).length;

    return { totalEvents, totalRevenue, upcomingEvents };
  };

  const stats = getFilteredStats();

  if (loading) {
    return (
      <div className="events-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1 className="events-title">Events Management</h1>
        <button className="create-event-button" onClick={handleCreateEvent}>
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {/* Stats Tiles */}
      <div className="stats-grid" style={{ marginBottom: "32px" }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Events</span>
            <Calendar size={20} style={{ color: "#405189" }} />
          </div>
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-change">
            <span style={{ fontSize: "12px", color: "#fff" }}>
              {user?.userType === "Super-Admin"
                ? "All Clubs"
                : user?.club?.name}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Upcoming Events</span>
            <UserCheck size={20} style={{ color: "#10b981" }} />
          </div>
          <div className="stat-change">
            <span style={{ fontSize: "25px", color: "#fff" }}>
              {upcomingEventsList.length}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Past Events</span>
            <DollarSign size={20} style={{ color: "#20c997" }} />
          </div>
          <div className="stat-change">
            <span style={{ fontSize: "25px", color: "#fff" }}>
              {pastEventsList.length}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Club Location</span>
            <Calendar size={20} style={{ color: "#ffc107" }} />
          </div>
          <div className="stat-value" style={{ fontSize: "12px" }}>
            {user?.club?.location}
          </div>
          <div className="stat-change">
            <span style={{ fontSize: "12px", color: "#fff" }}>
              Next 30 days
            </span>
          </div>
        </div>
      </div>

      {user?.userType === "Super-Admin" && (
        <div className="events-filters">
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
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>

          <select
            className="filter-select"
            value={clubFilter}
            onChange={(e) => setClubFilter(e.target.value)}
          >
            <option value="all">All Clubs</option>
            <option value="1">Club Paradise</option>
            <option value="2">Electric Nights</option>
            <option value="3">Neon Dreams</option>
          </select>

          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ minWidth: "150px" }}
          />
        </div>
      )}

      <div>
        {/* 🔹 Upcoming Events */}
        <h2 style={{ margin: "20px 0", color: "#fff" }}>Upcoming Events</h2>
        <div className="events-grid">
          {upcomingEventsList.length === 0 ? (
            <p style={{ color: "#323232" }}>No upcoming events.</p>
          ) : (
            upcomingEventsList.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-image">
                  <img
                    src={`${event.imageUrl}?t=${new Date().getTime()}`}
                    alt={event.name}
                    className="event-image"
                  />
                </div>
                <div className="event-content">
                  <h3 className="event-title">{event.eventName}</h3>
                  <p className="event-description">{event.description}</p>

                  <div className="event-meta">
                    <span className="event-date">
                      {new Date(event.eventDate).toLocaleDateString()} at{" "}
                      {new Date(event.startTime).toLocaleTimeString()}
                    </span>
                  </div>

                  <div
                    style={{
                      marginBottom: "12px",
                      fontSize: "12px",
                      color: "#878787",
                    }}
                  >
                    {event.club?.name} - {event.club?.location}
                  </div>

                  <div className="event-actions">
                    <button className="btn btn-secondary-outlined event-action-button">
                       Summary
                    </button>
                    <button className="btn btn-secondary-outlined event-action-button">
                      <Eye size={14} /> Tickets
                    </button>
                    <button className="btn btn-secondary-outlined event-action-button">
                      <Users size={14} /> Guests
                    </button>
                    <button className="btn btn-secondary-outlined event-action-button">
                      <MapPin size={14} /> Tables
                    </button>
                  </div>

                  <div className="event-actions" style={{ marginTop: "8px" }}>
                    <button className="btn btn-secondary-outlined event-action-button">
                      <Users size={14} /> Staff
                    </button>
                    <button className="btn btn-secondary-outlined event-action-button">
                      <Edit size={14} /> Edit
                    </button>
                    <button className="btn btn-secondary-outlined event-action-button">
                      <Delete size={14} /> Delete
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* 🔹 Past Events */}
        <h2 style={{ margin: "20px 0", color: "#fff" }}>Past Events</h2>
        <div className="events-grid">
          {pastEventsList.length === 0 ? (
            <p style={{ color: "#323232" }}>No past events.</p>
          ) : (
            pastEventsList.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-image">
                  <img src={event.imageUrl} alt={event.eventName} />
                </div>
                <div className="event-content">
                  <h3 className="event-title">{event.eventName}</h3>
                  <p className="event-description">{event.description}</p>

                  <div className="event-meta">
                    <span className="event-date">
                      {new Date(event.eventDate).toLocaleDateString()} at{" "}
                      {new Date(event.startTime).toLocaleTimeString()}
                    </span>
                  </div>

                  <div
                    style={{
                      marginBottom: "12px",
                      fontSize: "12px",
                      color: "#878787",
                    }}
                  >
                    {event.club?.name} - {event.club?.location}
                  </div>

                  {/* <div className="event-actions">
                  <button>Summary</button>
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    onClick={() => {
                      onEditEvent(event); // stores the selected event
                      onModuleChange("tickets"); // go to tickets page
                    }}
                  >
                    Tickets
                  </button>
                  <button>Guests</button>
                  <button>Tables</button>
                  <button>Staff</button>
                  <button>Edit</button>
                </div> */}
                  <div className="event-actions" style={{ display: "none" }}>
                    <button
                      className="event-action-button"
                      onClick={() => handleViewSummary(event)}
                    >
                      <Eye size={14} />
                      Summary
                    </button>
                    <button
                      className="event-action-button"
                      onClick={() => handleViewTickets(event)}
                    >
                      <Eye size={14} />
                      Tickets
                    </button>
                    <button
                      className="event-action-button"
                      onClick={() => handleViewGuestList(event)}
                    >
                      <Users size={14} />
                      Guests
                    </button>
                    <button
                      className="event-action-button"
                      onClick={() => handleViewTables(event)}
                    >
                      <MapPin size={14} />
                      Tables
                    </button>
                  </div>
                  <div
                    className="event-actions"
                    style={{ marginTop: "8px", display: "none" }}
                  >
                    <button
                      className="event-action-button"
                      onClick={() => handleManageStaff(event)}
                    >
                      <Users size={14} />
                      Staff
                    </button>
                    <button
                      className="event-action-button"
                      onClick={() => onEditEvent(event)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      className="event-action-button"
                      onClick={() => deleteEvent(event.id)}
                      disabled={loadingDeleteId === event.id}
                    >
                      <Delete size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">No Events Found</div>
          <div className="empty-state-description">
            {searchTerm ||
            filter !== "all" ||
            clubFilter !== "all" ||
            dateFilter
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first event"}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleCreateTicket(event.id)}
          >
            <Plus size={16} />
            Add Ticket Tier
          </button>
        </div>
      )}

      {/* Tickets Modal */}
      {showTickets && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <h2 className="modal-title">Tickets for {selectedEvent.name}</h2>
              <button
                className="modal-close"
                onClick={() => setShowTickets(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "24px" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleCreateTicket(selectedEvent.id)}
                >
                  <Plus size={16} />
                  Add Ticket Tier
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ticket Name</th>
                      <th>Price</th>
                      <th>Sold / Total</th>
                      <th>Revenue</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <div>
                            <div
                              style={{ fontWeight: "600", color: "#1e293b" }}
                            >
                              {ticket.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              {ticket.description}
                            </div>
                          </div>
                        </td>
                        <td>${ticket.price}</td>
                        <td>
                          <div>
                            <div
                              style={{ fontWeight: "600", color: "#1e293b" }}
                            >
                              {ticket.bookedTickets || 0} / {ticket.count || 0}
                            </div>
                            {/* <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {Math.round(((ticket.sold || 0) / (ticket.quantity || 1)) * 100)}% sold
                            </div> */}
                          </div>
                        </td>
                        <td>
                          $
                          {(() => {
                            const sold = Number(ticket.sold) || 0;
                            const price = Number(ticket.price) || 0;
                            const revenue = sold * price;
                            return typeof revenue === "number" &&
                              !isNaN(revenue)
                              ? revenue.toLocaleString()
                              : "0";
                          })()}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                              onClick={() => handleEditTicket(ticket)}
                            >
                              <Edit size={10} /> Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                              onClick={() => handleDeleteTicket(ticket)}
                            >
                              <Trash2 size={10} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* {!loadingTickets && tickets.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-title">No Ticket Tiers</div>
                  <div className="empty-state-description">
                    Create ticket tiers to start selling tickets for this event
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleCreateTicket(selectedEvent.id)}
                  >
                    <Plus size={16} />
                    Add Ticket Tier
                  </button>

                </div>
              )} */}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowTickets(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <TicketEditor
        ticket={selectedTicket}
        isOpen={showTicketEditor}
        eventId={selectedEventId} // 🔹 add this
        onClose={() => setShowTicketEditor(false)}
        onSave={handleSaveTicket}
      />

      <EventStaffManager
        eventId={staffManagerEvent?.id || ""}
        eventName={staffManagerEvent?.name || ""}
        isOpen={showStaffManager}
        onClose={() => setShowStaffManager(false)}
      />

      <GuestList
        event={guestListEvent}
        isOpen={showGuestList}
        onClose={() => setShowGuestList(false)}
      />

      <EventSummary
        event={summaryEvent}
        isOpen={showEventSummary}
        onClose={() => setShowEventSummary(false)}
      />

      {/* Tables Modal */}
      {showTables && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <h2 className="modal-title">Tables for {selectedEvent.name}</h2>
              <button
                className="modal-close"
                onClick={() => setShowTables(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "24px" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleCreateTable(selectedEvent.id)}
                >
                  <Plus size={16} /> Add Table
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Table #</th>
                      <th>Price</th>
                      <th>Capacity</th>
                      <th>Count</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((table) => (
                      <tr key={table.id}>
                        <td>{table.tableNumber}</td>
                        <td>${table.price}</td>
                        <td>{table.capacity}</td>
                        <td>{table.tableCount}</td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEditTable(table)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteTable(table)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowTables(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <TableEditor
        table={selectedTable}
        isOpen={showTableEditor}
        eventId={selectedEventId}
        clubId={user?.club?.id}
        onClose={() => setShowTableEditor(false)}
        onSave={handleSaveTable}
      />
    </div>
  );
};

export default EventsManager;
