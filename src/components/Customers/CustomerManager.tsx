import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, Plus } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalSpent: number;
  eventsAttended: number;
  lastVisit: string;
  vipStatus: boolean;
  profileImage?: string;
}

const CustomerManager: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [vipFilter, setVipFilter] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Mock data for demonstration
      setCustomers([
        {
          id: '1',
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice.smith@email.com',
          phone: '+1 555-0201',
          totalSpent: 1250,
          eventsAttended: 8,
          lastVisit: '2025-01-15',
          vipStatus: true,
          profileImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        {
          id: '2',
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@email.com',
          phone: '+1 555-0202',
          totalSpent: 750,
          eventsAttended: 5,
          lastVisit: '2025-01-10',
          vipStatus: false,
          profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        {
          id: '3',
          firstName: 'Carol',
          lastName: 'Williams',
          email: 'carol.w@email.com',
          phone: '+1 555-0203',
          totalSpent: 2100,
          eventsAttended: 12,
          lastVisit: '2025-01-18',
          vipStatus: true
        },
        // Additional customers for super admin view
        ...(user?.userType === 'super_admin' ? [
          {
            id: '4',
            firstName: 'Daniel',
            lastName: 'Kim',
            email: 'daniel.k@email.com',
            phone: '+1 555-0204',
            totalSpent: 1800,
            eventsAttended: 9,
            lastVisit: '2025-01-19',
            vipStatus: true,
            profileImage: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          {
            id: '5',
            firstName: 'Maria',
            lastName: 'Garcia',
            email: 'maria.g@email.com',
            phone: '+1 555-0205',
            totalSpent: 950,
            eventsAttended: 6,
            lastVisit: '2025-01-16',
            vipStatus: false
          },
          {
            id: '6',
            firstName: 'James',
            lastName: 'Brown',
            email: 'james.b@email.com',
            phone: '+1 555-0206',
            totalSpent: 3200,
            eventsAttended: 18,
            lastVisit: '2025-01-20',
            vipStatus: true,
            profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
          }
        ] : [])
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVip = vipFilter === 'all' || 
                      (vipFilter === 'vip' && customer.vipStatus) ||
                      (vipFilter === 'regular' && !customer.vipStatus);
    
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
          <p className="card-subtitle">Manage your customer database and loyalty programs</p>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">
            <span>+</span>
            Add Customer
          </button>
          <button className="btn btn-secondary">Export Data</button>
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
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <select
            className="filter-select"
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
          >
            <option value="all">All Customers</option>
            <option value="vip">VIP Only</option>
            <option value="regular">Regular Only</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Spent</th>
                <th>Events</th>
                <th>Last Visit</th>
                <th>VIP Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ProfileImage 
                        firstName={customer.firstName}
                        lastName={customer.lastName}
                        imageUrl={customer.profileImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>${customer.totalSpent.toLocaleString()}</td>
                  <td>{customer.eventsAttended}</td>
                  <td>{new Date(customer.lastVisit).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${customer.vipStatus ? 'badge-success' : 'badge-info'}`}>
                      {customer.vipStatus ? 'VIP' : 'Regular'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        View
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
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

export default CustomerManager;