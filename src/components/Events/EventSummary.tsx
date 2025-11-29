import React, { useState, useEffect } from 'react';
import { Event, EventSummaryData } from '../../types/api';
import { X, Users, UserCheck, Target, QrCode, Calendar, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';
import { apiClient } from '../../services/apiClient';

interface EventSummaryProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventSummary: React.FC<EventSummaryProps> = ({ event, isOpen, onClose }) => {
  const [summaryData, setSummaryData] = useState<EventSummaryData | null>(null);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (isOpen && event?.id) {
      fetchEventSummary(event.id);
      fetchEventTeams(event.id);
      // fetchDoorTeam(event.id);
      // fetchPromotersTeam(event.id);
    }
  }, [isOpen, event]);

  const fetchEventSummary = async (eventId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getEventSummary(eventId);

      setSummaryData((prev) => ({
        ...prev,
        ...response?.payLoad, // ✅ merge instead of overwrite
      }));
    } catch (error) {
      console.error("Failed to fetch event summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTeams = async (eventId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getAllEventsOrganizers(eventId);
      const data = response?.payLoad;

      setSummaryData((prev) => ({
        ...prev,
        admins: (data?.admins ?? []).map((a: any) => ({
          id: a.id,
          name: a.organizer?.fullName || "",
          email: a.organizer?.email || "",
          role: a.organizer?.userType || "",
          profileImage: a.organizer?.imageUrl || "",
        })),
        doormen: (data?.doorman ?? []).map((d: any) => ({
          id: d.id,
          name: d.organizer?.fullName || "",
          email: d.organizer?.email || "",
          role: d.organizer?.userType || "",
          profileImage: d.organizer?.imageUrl || "",
          scansCompleted: 0, // or API value if available
        })),
        promoters: (data?.promotors ?? []).map((p: any) => ({
          id: p.id,
          name: p.organizer?.fullName || "",
          email: p.organizer?.email || "",
          role: p.organizer?.userType || "",
          profileImage: p.organizer?.imageUrl || "",
          ticketsSold: 0, // update if API gives
          tablesSold: 0,  // update if API gives
        })),
        staff: (data?.staff ?? []).map((s: any) => ({
          id: s.id,
          name: s.organizer?.fullName || "",
          email: s.organizer?.email || "",
          role: s.organizer?.userType || "",
          profileImage: s.organizer?.imageUrl || "",
        })),
      }));
    } catch (err) {
      console.error("Failed to fetch event teams:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '1000px' }}>
          <div className="modal-header">
            <h2 className="modal-title">Event Summary</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '1000px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Event Summary - {event?.eventName}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Event Info */}
          <div className='BannerTop'>
            <div>
              <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                {event.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px'}}>
                <span>
                  <Calendar size={14} style={{ display: 'inline-block', marginRight: '4px' }} />
                  {new Date(event?.eventDate).toLocaleDateString()}
                </span>
                <span>
                  {event.startTime} - {event.endTime}
                </span>
                {/* <span className={`badge ${event.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                  {event.status}
                </span> */}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="stats-grid" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Guests Checked In</span>
                <UserCheck size={18} style={{ color: '#10b981' }} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{summaryData?.totalGuestsCheckedIn}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                of {summaryData?.totalExpectedGuests} expected
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Total Tickets Sold</span>
                <DollarSign size={18} style={{ color: '#405189' }} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{summaryData?.totalTicketSold}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                $ revenue
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Tables Booked</span>
                <MapPin size={18} style={{ color: '#ffc107' }} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{summaryData?.totalTableSold}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                VIP and premium tables
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">QR Scans</span>
                <QrCode size={18} style={{ color: '#ef4444' }} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{summaryData?.qrScansCompleted}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Entry validations
              </div>
            </div>
          </div>

          {/* Team Performance */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Row 1: Admins + Promoters */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Admins ({summaryData?.admins?.length || 0})</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {summaryData?.admins?.map((admin) => (
                  <div key={admin.id} style={{ display: "flex", alignItems: "center", padding: "12px", background: "#444", borderRadius: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ProfileImage
                      firstName={admin.name.split(" ")[0]}
                      lastName={admin.name.split(" ")[1] || ""}
                      imageUrl={admin.profileImage}
                      size="sm"
                    />
                    <div>
                      <div style={{ fontWeight: "600", color: "#fff" }}>{admin.name}</div>
                      <div style={{ fontSize: "11px", color: "#fff" }}>{admin.email}</div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Promoters ({summaryData?.promoters?.length || 0})</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {summaryData?.promoters?.map((promoter) => (
                  <div key={promoter.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#444", borderRadius: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ProfileImage
                        firstName={promoter.name.split(" ")[0]}
                        lastName={promoter.name.split(" ")[1] || ""}
                        imageUrl={promoter.profileImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: "600", color: "#fff" }}>{promoter.name}</div>
                        <div style={{ fontSize: "11px", color: "#fff" }}>{promoter.email}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "600", color: "#fff" }}>{promoter.tablesSold} tables</div>
                      <div style={{ fontSize: "12px", color: "#fff" }}>{promoter.ticketsSold} tickets</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Doormen + Staff */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Door Team ({summaryData?.doormen?.length || 0})</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {summaryData?.doormen?.map((member) => (
                  <div key={member.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#444", borderRadius: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ProfileImage
                        firstName={member.name.split(" ")[0]}
                        lastName={member.name.split(" ")[1] || ""}
                        imageUrl={member.profileImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: "600", color: "#fff" }}>{member.name}</div>
                        <div style={{ fontSize: "11px", color: "#fff" }}>{member.role}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "600", color: "#fff" }}>{member.scansCompleted || 0}</div>
                      <div style={{ fontSize: "10px", color: "#fff" }}>scans</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Staff ({summaryData?.staff?.length || 0})</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {summaryData?.staff?.map((member) => (
                  <div key={member.id} style={{ display: "flex", alignItems: "center", padding: "12px", background: "#444", borderRadius: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ProfileImage
                      firstName={member.name.split(" ")[0]}
                      lastName={member.name.split(" ")[1] || ""}
                      imageUrl={member.profileImage}
                      size="sm"
                    />
                    <div>
                      <div style={{ fontWeight: "600", color: "#fff" }}>{member.name}</div>
                      <div style={{ fontSize: "11px", color: "#fff" }}>{member.email}</div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">
            Export Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventSummary;