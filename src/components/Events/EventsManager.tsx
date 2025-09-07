import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { Event, TicketTier } from '../../types/api';
import { Plus, Edit, Trash2, Eye, Copy, Users, Search, Filter, Calendar, DollarSign, TrendingUp, UserCheck, Building2, MapPin, CheckCircle } from 'lucide-react';
import EventStaffManager from './EventStaffManager';
import GuestList from './GuestList';
import EventSummary from './EventSummary';
import '../../styles/events.css';
import '../../styles/components.css';
import { toast } from "react-toastify";

interface TicketEditorProps {
  ticket: TicketTier | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: TicketTier) => void;
}

const TicketEditor: React.FC<TicketEditorProps> = ({ ticket, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<TicketTier>({
    id: '',
    name: '',
    price: 0,
    quantity: 0,
    sold: 0,
    description: ''
  });

  useEffect(() => {
    if (ticket) {
      setFormData(ticket);
    } else {
      setFormData({
        id: '',
        name: '',
        price: 0,
        quantity: 0,
        sold: 0,
        description: ''
      });
    }
  }, [ticket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTicket = {
      ...formData,
      id: formData.id || Date.now().toString()
    };
    onSave(updatedTicket);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{ticket ? 'Edit Ticket' : 'Create New Ticket'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Ticket Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., General Admission, VIP, Early Bird"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
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
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what's included with this ticket..."
                rows={3}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {ticket ? 'Update Ticket' : 'Create Ticket'}
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
  pastEvents
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [clubFilter, setClubFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showTickets, setShowTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketTier | null>(null);
  const [showTicketEditor, setShowTicketEditor] = useState(false);
  const [showStaffManager, setShowStaffManager] = useState(false);
  const [staffManagerEvent, setStaffManagerEvent] = useState<Event | null>(null);
  const [showGuestList, setShowGuestList] = useState(false);
  const [guestListEvent, setGuestListEvent] = useState<Event | null>(null);
  const [showEventSummary, setShowEventSummary] = useState(false);
  const [summaryEvent, setSummaryEvent] = useState<Event | null>(null);
  const [showTables, setShowTables] = useState(false);

  const [upcomingEventsList, setUpcomingEvents] = useState<any[]>([]);
  const [pastEventsList, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  

  useEffect(() => {
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

  // 👇 Watch for updatedEvent coming from App.tsx
  // useEffect(() => {
  //   if (updatedEvent) {
  //     setUpcomingEvents(prev =>
  //       prev.map(ev => ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev)
  //     );

  //     setPastEvents(prev =>
  //       prev.map(ev => ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev)
  //     );

  //   }
  // }, [updatedEvent]);


  // useEffect(() => {
  //   fetchEvents();
  // }, []);

  // const fetchEvents = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await apiClient.getEvents();
  //     setEvents(response.data || []);
  //   } catch (error) {
  //     console.error('Failed to fetch events:', error);
  //     // Mock data for demonstration
  //     setEvents([
  //       {
  //         id: '1',
  //         clubId: '1',
  //         name: 'Saturday Night Fever',
  //         description: 'The hottest party of the weekend with top DJs',
  //         date: '2025-01-25',
  //         startTime: '22:00',
  //         endTime: '04:00',
  //         status: 'published',
  //         totalSales: 15000,
  //         attendees: 250,
  //         ticketTiers: [
  //           { id: '1', name: 'General Admission', price: 25, quantity: 200, sold: 180, description: 'Standard entry with access to main floor' },
  //           { id: '2', name: 'VIP', price: 75, quantity: 50, sold: 35, description: 'VIP table, premium drinks, and priority entry' },
  //           { id: '3', name: 'Early Bird', price: 20, quantity: 100, sold: 100, description: 'Limited time discount pricing' }
  //         ],
  //         tableBookings: [
  //           { id: 'tb1', tableNumber: 'VIP-1', capacity: 6, price: 500, booked: true, customerName: 'Alice Smith', customerEmail: 'alice.smith@email.com' },
  //           { id: 'tb2', tableNumber: 'VIP-2', capacity: 8, price: 800, booked: true, customerName: 'Bob Johnson', customerEmail: 'bob.johnson@email.com' },
  //           { id: 'tb3', tableNumber: 'VIP-3', capacity: 4, price: 400, booked: false },
  //           { id: 'tb4', tableNumber: 'T-1', capacity: 4, price: 200, booked: false },
  //           { id: 'tb5', tableNumber: 'T-2', capacity: 6, price: 300, booked: true, customerName: 'Carol Williams', customerEmail: 'carol.w@email.com' }
  //         ]
  //       },
  //       {
  //         id: '2',
  //         clubId: '1',
  //         name: 'EDM Explosion',
  //         description: 'Electronic music festival featuring international artists',
  //         date: '2025-02-01',
  //         startTime: '20:00',
  //         endTime: '03:00',
  //         status: 'draft',
  //         totalSales: 0,
  //         attendees: 0,
  //         ticketTiers: [
  //           { id: '4', name: 'Standard', price: 30, quantity: 300, sold: 0, description: 'General admission to all areas' },
  //           { id: '5', name: 'Premium', price: 60, quantity: 100, sold: 0, description: 'Premium viewing area and complimentary drinks' }
  //         ],
  //         tableBookings: [
  //           { id: 'tb6', tableNumber: 'VIP-1', capacity: 6, price: 600, booked: false },
  //           { id: 'tb7', tableNumber: 'VIP-2', capacity: 8, price: 900, booked: false },
  //           { id: 'tb8', tableNumber: 'T-1', capacity: 4, price: 250, booked: false }
  //         ]
  //       },
  //       {
  //         id: '3',
  //         clubId: '2',
  //         name: 'Hip Hop Night',
  //         description: 'Best hip hop artists and DJs in the city',
  //         date: '2025-01-28',
  //         startTime: '21:00',
  //         endTime: '02:00',
  //         status: 'published',
  //         totalSales: 8500,
  //         attendees: 180,
  //         ticketTiers: [
  //           { id: '6', name: 'General', price: 20, quantity: 150, sold: 120, description: 'Standard entry' },
  //           { id: '7', name: 'VIP', price: 50, quantity: 40, sold: 25, description: 'VIP experience' }
  //         ],
  //         tableBookings: [
  //           { id: 'tb9', tableNumber: 'VIP-1', capacity: 6, price: 400, booked: true, customerName: 'Daniel Kim', customerEmail: 'daniel.k@email.com' },
  //           { id: 'tb10', tableNumber: 'T-1', capacity: 4, price: 150, booked: false }
  //         ]
  //       },
  //       {
  //         id: '4',
  //         clubId: '2',
  //         name: 'Techno Underground',
  //         description: 'Underground techno experience',
  //         date: '2025-02-05',
  //         startTime: '23:00',
  //         endTime: '05:00',
  //         status: 'published',
  //         totalSales: 12000,
  //         attendees: 300,
  //         ticketTiers: [
  //           { id: '8', name: 'Standard', price: 35, quantity: 250, sold: 200, description: 'General admission' },
  //           { id: '9', name: 'VIP', price: 80, quantity: 60, sold: 45, description: 'VIP access' }
  //         ],
  //         tableBookings: [
  //           { id: 'tb11', tableNumber: 'VIP-1', capacity: 8, price: 800, booked: true, customerName: 'Maria Garcia', customerEmail: 'maria.g@email.com' },
  //           { id: 'tb12', tableNumber: 'VIP-2', capacity: 6, price: 600, booked: false },
  //           { id: 'tb13', tableNumber: 'T-1', capacity: 4, price: 200, booked: false }
  //         ]
  //       }
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCreateEvent = () => {
    if (onModuleChange) {
      onModuleChange('create-event');
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

  const handleCreateTicket = () => {
    setSelectedTicket(null);
    setShowTicketEditor(true);
  };

  const handleSaveTicket = (ticket: TicketTier) => {
    if (!selectedEvent) return;

    const updatedEvent = {
      ...selectedEvent,
      ticketTiers: selectedTicket
        ? selectedEvent.ticketTiers.map(t => t.id === ticket.id ? ticket : t)
        : [...selectedEvent.ticketTiers, ticket]
    };

    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setSelectedEvent(updatedEvent);
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (!selectedEvent) return;
    
    if (confirm('Are you sure you want to delete this ticket tier?')) {
      const updatedEvent = {
        ...selectedEvent,
        ticketTiers: selectedEvent.ticketTiers.filter(t => t.id !== ticketId)
      };
      
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      setSelectedEvent(updatedEvent);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setLoadingDeleteId(eventId);
      await apiClient.deleteEvent(`${eventId}`);
      toast.success("Your event has been deleted.");

      // remove from UI
      setUpcomingEvents(prev => prev.filter(ev => ev.id !== eventId));
      setPastEvents(prev => prev.filter(ev => ev.id !== eventId));
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
    setShowTables(true);
  };

  const getClubName = (clubId: string) => {
    const clubs: Record<string, string> = {
      '1': 'Club Paradise',
      '2': 'Electric Nights',
      '3': 'Neon Dreams'
    };
    return clubs[clubId] || 'Unknown Club';
  };

  const filteredEvents = pastEventsList.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    // const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //                      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClub = clubFilter === 'all' || event.clubId === clubFilter;
    const matchesDate = !dateFilter || event.date === dateFilter;
    return matchesFilter && matchesClub && matchesDate;
  });

  // Calculate stats based on current filters
  const getFilteredStats = () => {
    const eventsToCalculate = clubFilter === 'all' ? pastEventsList : pastEventsList.filter(e => e.clubId === clubFilter);
    
    const totalEvents = eventsToCalculate.length;
    // const totalTicketsSold = eventsToCalculate.reduce((sum, event) => 
    //   sum + event.ticketTiers.reduce((tierSum, tier) => tierSum + (tier.sold || 0), 0), 0
    // );
    const totalRevenue = eventsToCalculate.reduce((sum, event) => sum + event.totalSales, 0);
    const upcomingEvents = eventsToCalculate.filter(event => 
      new Date(event.date) > new Date() && event.status === 'published'
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
        <button 
          className="create-event-button"
          onClick={handleCreateEvent}
        >
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {/* Stats Tiles */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Events</span>
            <Calendar size={20} style={{ color: '#405189' }} />
          </div>
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {clubFilter === 'all' ? 'All clubs' : getClubName(clubFilter)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tickets Sold</span>
            <UserCheck size={20} style={{ color: '#10b981' }} />
          </div>
          {/* <div className="stat-value">{stats.totalTicketsSold.toLocaleString()}</div> */}
          <div className="stat-change positive">
            <TrendingUp size={14} />
            +15.2% from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Revenue</span>
            <DollarSign size={20} style={{ color: '#20c997' }} />
          </div>
          <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            +22.8% from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Upcoming Events</span>
            <Calendar size={20} style={{ color: '#ffc107' }} />
          </div>
          <div className="stat-value">{stats.upcomingEvents}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Next 30 days
            </span>
          </div>
        </div>
      </div>

      <div className="events-filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#64748b' 
          }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
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
          style={{ minWidth: '150px' }}
        />
      </div>

      <div>
      {/* 🔹 Upcoming Events */}
      <h2 style={{ margin: "20px 0" }}>Upcoming Events</h2>
      <div className="events-grid">
        {upcomingEventsList.length === 0 ? (
          <p style={{ color: "#64748b" }}>No upcoming events.</p>
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
                    color: "#64748b",
                  }}
                >
                  {event.club?.name} - {event.club?.location}
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button className="btn btn-outline-primary btn-sm rounded-pill">Summary</button>
                  <button className="btn btn-outline-secondary btn-sm rounded-pill">Tickets</button>
                  <button className="btn btn-outline-success btn-sm rounded-pill">Guests</button>
                  <button className="btn btn-outline-warning btn-sm rounded-pill">Tables</button>
                  <button className="btn btn-outline-info btn-sm rounded-pill">Staff</button>
                  <button
                    className="btn btn-outline-dark btn-sm rounded-pill"
                    onClick={() => onEditEvent(event)}   // ✅ now defined
                  >
                    Edit
                  </button>


                  <button
                    className="btn btn-danger btn-sm rounded-pill"
                    onClick={() => deleteEvent(event.id)} // ✅ pass event.id directly
                    disabled={loadingDeleteId === event.id} // ✅ disable only this one
                  >
                    {loadingDeleteId === event.id ? "Deleting..." : "Delete"}
                  </button>
                </div>


              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔹 Past Events */}
      <h2 style={{ margin: "20px 0" }}>Past Events</h2>
      <div className="events-grid">
        {pastEventsList.length === 0 ? (
          <p style={{ color: "#64748b" }}>No past events.</p>
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
                    color: "#64748b",
                  }}
                >
                  {event.club?.name} - {event.club?.location}
                </div>

                <div className="event-actions">
                  <button>Summary</button>
                  <button>Tickets</button>
                  <button>Guests</button>
                  <button>Tables</button>
                  <button>Staff</button>
                  <button>Edit</button>
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
            {searchTerm || filter !== 'all' || clubFilter !== 'all' || dateFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first event'
            }
          </div>
          <button className="btn btn-primary" onClick={handleCreateEvent}>
            Create Your First Event
          </button>
        </div>
      )}

      {/* Tickets Modal */}
      {showTickets && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Tickets for {selectedEvent.name}</h2>
              <button className="modal-close" onClick={() => setShowTickets(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '24px' }}>
                <button className="btn btn-primary" onClick={handleCreateTicket}>
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
                    {selectedEvent.ticketTiers.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{ticket.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{ticket.description}</div>
                          </div>
                        </td>
                        <td>${ticket.price}</td>
                        <td>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {ticket.sold || 0} / {ticket.quantity || 0}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {Math.round(((ticket.sold || 0) / (ticket.quantity || 1)) * 100)}% sold
                            </div>
                          </div>
                        </td>
                        <td>
                          ${(() => {
                            const sold = Number(ticket.sold) || 0;
                            const price = Number(ticket.price) || 0;
                            const revenue = sold * price;
                            return typeof revenue === 'number' && !isNaN(revenue) ? revenue.toLocaleString() : '0';
                          })()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleEditTicket(ticket)}
                            >
                              <Edit size={10} />
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleDeleteTicket(ticket.id)}
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {selectedEvent.ticketTiers.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-title">No Ticket Tiers</div>
                  <div className="empty-state-description">
                    Create ticket tiers to start selling tickets for this event
                  </div>
                  <button className="btn btn-primary" onClick={handleCreateTicket}>
                    <Plus size={16} />
                    Create First Ticket Tier
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowTickets(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <TicketEditor
        ticket={selectedTicket}
        isOpen={showTicketEditor}
        onClose={() => setShowTicketEditor(false)}
        onSave={handleSaveTicket}
      />

      <EventStaffManager
        eventId={staffManagerEvent?.id || ''}
        eventName={staffManagerEvent?.name || ''}
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
          <div className="modal-content" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Table Bookings - {selectedEvent.name}</h2>
              <button className="modal-close" onClick={() => setShowTables(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Table Stats */}
              <div className="stats-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Total Tables</span>
                    <MapPin style={{ color: '#405189' }} size={18} />
                  </div>
                  <div className="stat-value" style={{ fontSize: '20px' }}>
                    {selectedEvent.tableBookings?.length || 0}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Booked Tables</span>
                    <CheckCircle style={{ color: '#20c997' }} size={18} />
                  </div>
                  <div className="stat-value" style={{ fontSize: '20px' }}>
                    {selectedEvent.tableBookings?.filter(t => t.booked).length || 0}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Available Tables</span>
                    <Calendar style={{ color: '#ffc107' }} size={18} />
                  </div>
                  <div className="stat-value" style={{ fontSize: '20px' }}>
                    {selectedEvent.tableBookings?.filter(t => !t.booked).length || 0}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Table Revenue</span>
                    <DollarSign style={{ color: '#20c997' }} size={18} />
                  </div>
                  <div className="stat-value" style={{ fontSize: '20px' }}>
                    ${selectedEvent.tableBookings?.filter(t => t.booked).reduce((sum, t) => sum + t.price, 0).toLocaleString() || '0'}
                  </div>
                </div>
              </div>

              {/* Tables Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {selectedEvent.tableBookings?.map((table) => (
                  <div key={table.id} style={{
                    border: `2px solid ${table.booked ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    background: table.booked ? '#f0fdf4' : '#ffffff',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                        {table.tableNumber}
                      </h4>
                      <span className={`badge ${table.booked ? 'badge-success' : 'badge-info'}`}>
                        {table.booked ? 'Booked' : 'Available'}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                      Capacity: {table.capacity} people
                    </div>
                    
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
                      ${table.price}
                    </div>
                    
                    {table.booked && table.customerName && (
                      <div style={{ 
                        padding: '8px', 
                        background: '#ffffff', 
                        borderRadius: '6px',
                        border: '1px solid #d1fae5'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {table.customerName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {table.customerEmail}
                        </div>
                      </div>
                    )}
                    
                    {!table.booked && (
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '6px 12px', fontSize: '11px' }}
                      >
                        Book Table
                      </button>
                    )}
                  </div>
                )) || (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                    <MapPin size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                    <div style={{ color: '#374151', fontSize: '16px', fontWeight: '600' }}>
                      No tables configured for this event
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowTables(false)}>
                Close
              </button>
              <button className="btn btn-primary">
                Manage Tables
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;