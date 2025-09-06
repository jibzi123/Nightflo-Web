import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, DollarSign } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

interface Refund {
  id: string;
  customerName: string;
  customerEmail: string;
  customerImage?: string;
  eventName: string;
  ticketType: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestDate: string;
  processedDate?: string;
}

const RefundsManager: React.FC = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      // Mock data
      setRefunds([
        {
          id: '1',
          customerName: 'Alice Smith',
          customerEmail: 'alice.smith@email.com',
          customerImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          eventName: 'Saturday Night Fever',
          ticketType: 'VIP',
          originalAmount: 75,
          refundAmount: 75,
          reason: 'Event cancelled due to weather',
          status: 'pending',
          requestDate: '2025-01-20'
        },
        {
          id: '2',
          customerName: 'Bob Johnson',
          customerEmail: 'bob.johnson@email.com',
          eventName: 'EDM Explosion',
          ticketType: 'General',
          originalAmount: 30,
          refundAmount: 25,
          reason: 'Unable to attend due to illness',
          status: 'approved',
          requestDate: '2025-01-18',
          processedDate: '2025-01-19'
        },
        {
          id: '3',
          customerName: 'Carol Williams',
          customerEmail: 'carol.w@email.com',
          customerImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
          eventName: 'Hip Hop Night',
          ticketType: 'Premium',
          originalAmount: 50,
          refundAmount: 0,
          reason: 'Requested refund after event started',
          status: 'rejected',
          requestDate: '2025-01-15',
          processedDate: '2025-01-16'
        },
        // Additional refunds for super admin view
        ...(user?.userType === 'super_admin' ? [
          {
            id: '4',
            customerName: 'Daniel Kim',
            customerEmail: 'daniel.k@email.com',
            customerImage: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
            eventName: 'Techno Underground',
            ticketType: 'VIP',
            originalAmount: 85,
            refundAmount: 85,
            reason: 'Double booking error',
            status: 'pending',
            requestDate: '2025-01-21'
          },
          {
            id: '5',
            customerName: 'Maria Garcia',
            customerEmail: 'maria.g@email.com',
            eventName: 'Latin Night',
            ticketType: 'General',
            originalAmount: 25,
            refundAmount: 20,
            reason: 'Partial refund for late start',
            status: 'approved',
            requestDate: '2025-01-17',
            processedDate: '2025-01-18'
          }
        ] : [])
      ]);
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundAction = (refundId: string, action: 'approve' | 'reject') => {
    setRefunds(prev => prev.map(refund => 
      refund.id === refundId 
        ? { 
            ...refund, 
            status: action === 'approve' ? 'approved' : 'rejected',
            processedDate: new Date().toISOString().split('T')[0]
          }
        : refund
    ));
  };

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = 
      refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      case 'processed': return 'badge-info';
      default: return 'badge-info';
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Refunds Management</h2>
          <p className="card-subtitle">Process customer refund requests and track refund history</p>
        </div>

        <div className="search-filter-container">
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
              placeholder="Search refunds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processed">Processed</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Event</th>
                <th>Ticket</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((refund) => (
                <tr key={refund.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ProfileImage 
                        firstName={refund.customerName.split(' ')[0]}
                        lastName={refund.customerName.split(' ')[1] || ''}
                        imageUrl={refund.customerImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {refund.customerName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {refund.customerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{refund.eventName}</td>
                  <td>{refund.ticketType}</td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        ${refund.refundAmount}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        of ${refund.originalAmount}
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {refund.reason}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(refund.status)}`}>
                      {refund.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ color: '#1e293b' }}>
                        {new Date(refund.requestDate).toLocaleDateString()}
                      </div>
                      {refund.processedDate && (
                        <div style={{ color: '#64748b' }}>
                          Processed: {new Date(refund.processedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {refund.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleRefundAction(refund.id, 'approve')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleRefundAction(refund.id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {refund.status !== 'pending' && (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {refund.status === 'approved' ? 'Approved' : 
                         refund.status === 'rejected' ? 'Rejected' : 'Processed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRefunds.length === 0 && (
          <div className="empty-state">
            <DollarSign size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <div className="empty-state-title">No Refunds Found</div>
            <div className="empty-state-description">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No refund requests at this time'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundsManager;