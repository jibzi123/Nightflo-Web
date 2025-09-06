import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, CreditCard, Calendar, DollarSign, Users, CheckCircle, X, AlertTriangle, Edit, Eye } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

interface Subscription {
  id: string;
  clubId: string;
  clubName: string;
  ownerName: string;
  ownerEmail: string;
  ownerImage?: string;
  planType: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  features: string[];
  paymentMethod: string;
  lastPayment?: string;
  nextBilling?: string;
  autoRenew: boolean;
}

interface SubscriptionEditorProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Subscription) => void;
}

const SubscriptionEditor: React.FC<SubscriptionEditorProps> = ({ subscription, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Subscription>({
    id: '',
    clubId: '',
    clubName: '',
    ownerName: '',
    ownerEmail: '',
    planType: 'basic',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyPrice: 99,
    features: [],
    paymentMethod: 'Credit Card',
    autoRenew: true
  });

  const planFeatures = {
    basic: ['Event Management', 'Basic Analytics', 'Customer Database', 'Email Support'],
    premium: ['Event Management', 'Advanced Analytics', 'Customer Database', 'Staff Management', 'Promoter Network', 'Priority Support'],
    enterprise: ['All Premium Features', 'Multi-location Support', 'Custom Branding', 'API Access', 'Dedicated Account Manager', '24/7 Phone Support']
  };

  const planPrices = {
    basic: 99,
    premium: 199,
    enterprise: 399
  };

  React.useEffect(() => {
    if (subscription) {
      setFormData(subscription);
    } else {
      setFormData({
        id: '',
        clubId: '',
        clubName: '',
        ownerName: '',
        ownerEmail: '',
        planType: 'basic',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyPrice: 99,
        features: planFeatures.basic,
        paymentMethod: 'Credit Card',
        autoRenew: true
      });
    }
  }, [subscription]);

  const handlePlanChange = (planType: 'basic' | 'premium' | 'enterprise') => {
    setFormData(prev => ({
      ...prev,
      planType,
      monthlyPrice: planPrices[planType],
      features: planFeatures[planType]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSubscription = {
      ...formData,
      id: formData.id || Date.now().toString()
    };
    onSave(updatedSubscription);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{subscription ? 'Edit Subscription' : 'Create New Subscription'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Club Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.clubName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clubName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Owner Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.ownerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Plan Type</label>
                <select
                  className="form-select"
                  value={formData.planType}
                  onChange={(e) => handlePlanChange(e.target.value as any)}
                >
                  <option value="basic">Basic - $99/month</option>
                  <option value="premium">Premium - $199/month</option>
                  <option value="enterprise">Enterprise - $399/month</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Monthly Price ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Invoice">Invoice</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                  style={{ accentColor: '#405189' }}
                />
                <span className="form-label" style={{ margin: 0 }}>Auto-renew subscription</span>
              </label>
            </div>
            
            <div className="form-group">
              <label className="form-label">Plan Features</label>
              <div style={{ 
                padding: '12px', 
                background: '#f8fafc', 
                borderRadius: '6px', 
                border: '1px solid #e2e8f0' 
              }}>
                {formData.features.map((feature, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '4px',
                    fontSize: '13px',
                    color: '#374151'
                  }}>
                    <CheckCircle size={14} style={{ color: '#10b981' }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {subscription ? 'Update Subscription' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showSubscriptionEditor, setShowSubscriptionEditor] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setSubscriptions([
        {
          id: '1',
          clubId: '1',
          clubName: 'Club Paradise',
          ownerName: 'John Smith',
          ownerEmail: 'john.smith@clubparadise.com',
          ownerImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          planType: 'premium',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2025-01-01',
          monthlyPrice: 199,
          features: ['Event Management', 'Advanced Analytics', 'Customer Database', 'Staff Management', 'Promoter Network', 'Priority Support'],
          paymentMethod: 'Credit Card',
          lastPayment: '2024-12-01',
          nextBilling: '2025-01-01',
          autoRenew: true
        },
        {
          id: '2',
          clubId: '2',
          clubName: 'Electric Nights',
          ownerName: 'Sarah Johnson',
          ownerEmail: 'sarah.j@electricnights.com',
          ownerImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          planType: 'basic',
          status: 'active',
          startDate: '2024-06-15',
          endDate: '2025-06-15',
          monthlyPrice: 99,
          features: ['Event Management', 'Basic Analytics', 'Customer Database', 'Email Support'],
          paymentMethod: 'Bank Transfer',
          lastPayment: '2024-12-15',
          nextBilling: '2025-01-15',
          autoRenew: true
        },
        {
          id: '3',
          clubId: '3',
          clubName: 'Neon Dreams',
          ownerName: 'Mike Rodriguez',
          ownerEmail: 'mike.r@neondreams.com',
          planType: 'enterprise',
          status: 'trial',
          startDate: '2024-12-01',
          endDate: '2024-12-31',
          monthlyPrice: 399,
          features: ['All Premium Features', 'Multi-location Support', 'Custom Branding', 'API Access', 'Dedicated Account Manager', '24/7 Phone Support'],
          paymentMethod: 'Credit Card',
          autoRenew: false
        },
        {
          id: '4',
          clubId: '4',
          clubName: 'Midnight Lounge',
          ownerName: 'Lisa Chen',
          ownerEmail: 'lisa.c@midnightlounge.com',
          planType: 'premium',
          status: 'expired',
          startDate: '2023-08-01',
          endDate: '2024-08-01',
          monthlyPrice: 199,
          features: ['Event Management', 'Advanced Analytics', 'Customer Database', 'Staff Management', 'Promoter Network', 'Priority Support'],
          paymentMethod: 'PayPal',
          lastPayment: '2024-07-01',
          autoRenew: false
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowSubscriptionEditor(true);
  };

  const handleCreateSubscription = () => {
    setSelectedSubscription(null);
    setShowSubscriptionEditor(true);
  };

  const handleSaveSubscription = (subscription: Subscription) => {
    if (selectedSubscription) {
      setSubscriptions(prev => prev.map(s => s.id === subscription.id ? subscription : s));
    } else {
      setSubscriptions(prev => [...prev, subscription]);
    }
  };

  const handleStatusChange = (subscriptionId: string, newStatus: 'active' | 'expired' | 'cancelled' | 'trial') => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subscriptionId ? { ...sub, status: newStatus } : sub
    ));
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || subscription.planType === planFilter;
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'trial': return 'badge-info';
      case 'expired': return 'badge-danger';
      case 'cancelled': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getPlanBadgeClass = (plan: string) => {
    switch (plan) {
      case 'basic': return 'badge-info';
      case 'premium': return 'badge-warning';
      case 'enterprise': return 'badge-success';
      default: return 'badge-info';
    }
  };

  const isSubscriptionExpiringSoon = (endDate: string) => {
    const expiry = new Date(endDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expiry <= thirtyDaysFromNow && expiry > today;
  };

  // Calculate stats
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const trialSubscriptions = subscriptions.filter(s => s.status === 'trial').length;
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired').length;
  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.monthlyPrice, 0);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Subscriptions</span>
            <CheckCircle size={20} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-value">{activeSubscriptions}</div>
          <div className="stat-change positive">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Currently paying customers
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Trial Subscriptions</span>
            <Users size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-value">{trialSubscriptions}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Potential conversions
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Expired/Cancelled</span>
            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-value">{expiredSubscriptions}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Need attention
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Monthly Revenue</span>
            <DollarSign size={20} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-value">${totalRevenue.toLocaleString()}</div>
          <div className="stat-change positive">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Recurring revenue
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Subscription Management</h2>
          <p className="card-subtitle">Manage club owner subscriptions and billing</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={handleCreateSubscription}>
            <CreditCard size={16} />
            Add New Subscription
          </button>
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
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <select
            className="filter-select"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="all">All Plans</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
          
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Club & Owner</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Billing</th>
                <th>End Date</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ProfileImage 
                        firstName={subscription.ownerName.split(' ')[0]}
                        lastName={subscription.ownerName.split(' ')[1] || ''}
                        imageUrl={subscription.ownerImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {subscription.clubName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {subscription.ownerName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {subscription.ownerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getPlanBadgeClass(subscription.planType)}`}>
                      {subscription.planType}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span className={`badge ${getStatusBadgeClass(subscription.status)}`}>
                        {subscription.status}
                      </span>
                      {isSubscriptionExpiringSoon(subscription.endDate) && subscription.status === 'active' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '11px', marginTop: '4px' }}>
                          <AlertTriangle size={10} />
                          Expires Soon
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        ${subscription.monthlyPrice}/month
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {subscription.paymentMethod}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {subscription.autoRenew ? 'Auto-renew' : 'Manual'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontSize: '13px', color: '#1e293b' }}>
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </div>
                      {subscription.nextBilling && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Next: {new Date(subscription.nextBilling).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: '600', color: '#10b981' }}>
                    ${subscription.monthlyPrice}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleEditSubscription(subscription)}
                      >
                        <Edit size={10} />
                        Edit
                      </button>
                      <select
                        value={subscription.status}
                        onChange={(e) => handleStatusChange(subscription.id, e.target.value as any)}
                        style={{
                          padding: '4px 6px',
                          fontSize: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          background: '#ffffff'
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="empty-state">
            <CreditCard size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <div className="empty-state-title">No Subscriptions Found</div>
            <div className="empty-state-description">
              {searchTerm || planFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No subscriptions have been created yet'
              }
            </div>
            {!searchTerm && planFilter === 'all' && statusFilter === 'all' && (
              <button className="btn btn-primary" onClick={handleCreateSubscription}>
                Create First Subscription
              </button>
            )}
          </div>
        )}
      </div>

      <SubscriptionEditor
        subscription={selectedSubscription}
        isOpen={showSubscriptionEditor}
        onClose={() => setShowSubscriptionEditor(false)}
        onSave={handleSaveSubscription}
      />
    </div>
  );
};

export default SubscriptionManager;