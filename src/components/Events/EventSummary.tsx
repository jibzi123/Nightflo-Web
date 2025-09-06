import React, { useState, useEffect } from 'react';
import { Event } from '../../types/api';
import { X, Users, UserCheck, Target, QrCode, Calendar, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

interface EventSummaryProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EventSummaryData {
  doorTeamCount: number;
  qrScansCompleted: number;
  promoterCount: number;
  promoterTicketsSold: number;
  guestsCheckedIn: number;
  totalTicketsSold: number;
  tablesBooked: number;
  expectedGuests: number;
  doorTeam: Array<{
    id: string;
    name: string;
    role: string;
    scansCompleted: number;
    profileImage?: string;
  }>;
  promoters: Array<{
    id: string;
    name: string;
    ticketsSold: number;
    commission: number;
    profileImage?: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'scan' | 'booking' | 'checkin';
    description: string;
    timestamp: string;
    user: string;
  }>;
}

const EventSummary: React.FC<EventSummaryProps> = ({ event, isOpen, onClose }) => {
  const [summaryData, setSummaryData] = useState<EventSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && event) {
      fetchEventSummary();
    }
  }, [isOpen, event]);

  const fetchEventSummary = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setSummaryData({
        doorTeamCount: 3,
        qrScansCompleted: 245,
        promoterCount: 2,
        promoterTicketsSold: 120,
        guestsCheckedIn: 245,
        totalTicketsSold: 315,
        tablesBooked: 8,
        expectedGuests: 315,
        doorTeam: [
          {
            id: '1',
            name: 'Mike Wilson',
            role: 'Head Security',
            scansCompleted: 120,
            profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            role: 'Door Staff',
            scansCompleted: 85,
            profileImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          {
            id: '3',
            name: 'Alex Rodriguez',
            role: 'Door Staff',
            scansCompleted: 40
          }
        ],
        promoters: [
          {
            id: '1',
            name: 'Lisa Chen',
            ticketsSold: 75,
            commission: 1125,
            profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          {
            id: '2',
            name: 'David Rodriguez',
            ticketsSold: 45,
            commission: 540
          }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'checkin',
            description: 'VIP guest checked in',
            timestamp: '2025-01-25T22:30:00Z',
            user: 'Mike Wilson'
          },
          {
            id: '2',
            type: 'booking',
            description: 'Table VIP-5 booked for 6 guests',
            timestamp: '2025-01-25T22:15:00Z',
            user: 'Sarah Johnson'
          },
          {
            id: '3',
            type: 'scan',
            description: 'General admission ticket scanned',
            timestamp: '2025-01-25T22:10:00Z',
            user: 'Alex Rodriguez'
          }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch event summary:', error);
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
          <h2 className="modal-title">Event Summary - {event.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Event Info */}
          <div style={{ 
            padding: '16px', 
            background: '#f8fafc', 
            borderRadius: '8px', 
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                {event.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                <span>
                  <Calendar size={14} style={{ display: 'inline-block', marginRight: '4px' }} />
                  {new Date(event.date).toLocaleDateString()}
                </span>
                <span>
                  {event.startTime} - {event.endTime}
                </span>
                <span className={`badge ${event.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                  {event.status}
                </span>
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
              <div className="stat-value" style={{ fontSize: '20px' }}>{summaryData?.guestsCheckedIn}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                of {summaryData?.expectedGuests} expected
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Total Tickets Sold</span>
                <DollarSign size={18} style={{ color: '#405189' }} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{summaryData?.totalTicketsSold}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                ${event.totalSales.toLocaleString()} revenue
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Tables Booked</span>
                <MapPin size={18} style={{ color: '#ffc107' }} />
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>{summaryData?.tablesBooked}</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Door Team */}
            <div className="card" style={{ margin: 0 }}>
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <h3 className="card-title" style={{ fontSize: '16px' }}>
                  Door Team ({summaryData?.doorTeamCount})
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {summaryData?.doorTeam.map((member) => (
                  <div key={member.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ProfileImage 
                        firstName={member.name.split(' ')[0]}
                        lastName={member.name.split(' ')[1] || ''}
                        imageUrl={member.profileImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                        {member.scansCompleted}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        scans
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promoters */}
            <div className="card" style={{ margin: 0 }}>
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <h3 className="card-title" style={{ fontSize: '16px' }}>
                  Promoters ({summaryData?.promoterCount})
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {summaryData?.promoters.map((promoter) => (
                  <div key={promoter.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ProfileImage 
                        firstName={promoter.name.split(' ')[0]}
                        lastName={promoter.name.split(' ')[1] || ''}
                        imageUrl={promoter.profileImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                          {promoter.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          ${promoter.commission} commission
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                        {promoter.ticketsSold}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        tickets sold
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h3 className="card-title" style={{ fontSize: '16px' }}>Recent Activity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {summaryData?.recentActivity.map((activity) => (
                <div key={activity.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: activity.type === 'scan' ? '#e6f7ff' : 
                                 activity.type === 'booking' ? '#f0f9ff' : '#e6ffed',
                      color: activity.type === 'scan' ? '#1890ff' : 
                             activity.type === 'booking' ? '#3b82f6' : '#52c41a'
                    }}>
                      {activity.type === 'scan' && <QrCode size={16} />}
                      {activity.type === 'booking' && <Calendar size={16} />}
                      {activity.type === 'checkin' && <UserCheck size={16} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                        {activity.description}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        by {activity.user}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
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