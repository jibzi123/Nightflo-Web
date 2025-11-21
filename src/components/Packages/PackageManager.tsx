import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Package, CheckCircle, X, DollarSign, Users, Zap, Building2, Crown } from 'lucide-react';
import '../../styles/components.css';

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxClubs: number;
  maxEvents: number;
  maxStaff: number;
  status: 'active' | 'inactive';
  createdAt: string;
  subscriberCount: number;
  isPopular?: boolean;
}

interface PackageEditorProps {
  package: SubscriptionPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: SubscriptionPackage) => void;
}

const PackageEditor: React.FC<PackageEditorProps> = ({ package: pkg, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<SubscriptionPackage>({
    id: '',
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    features: [''],
    maxClubs: 1,
    maxEvents: 10,
    maxStaff: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
    subscriberCount: 0,
    isPopular: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pkg) {
      setFormData(pkg);
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        price: 0,
        billingCycle: 'monthly',
        features: [''],
        maxClubs: 1,
        maxEvents: 10,
        maxStaff: 5,
        status: 'active',
        createdAt: new Date().toISOString(),
        subscriberCount: 0,
        isPopular: false
      });
    }
    setErrors({});
  }, [pkg]);

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Package name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.maxClubs <= 0) newErrors.maxClubs = 'Max clubs must be greater than 0';
    if (formData.maxEvents <= 0) newErrors.maxEvents = 'Max events must be greater than 0';
    if (formData.maxStaff <= 0) newErrors.maxStaff = 'Max staff must be greater than 0';
    
    const validFeatures = formData.features.filter(f => f.trim());
    if (validFeatures.length === 0) newErrors.features = 'At least one feature is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const updatedPackage = {
      ...formData,
      id: formData.id || Date.now().toString(),
      features: formData.features.filter(f => f.trim())
    };
    
    onSave(updatedPackage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{pkg ? 'Edit Package' : 'Create New Package'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Package Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Basic, Premium, Enterprise"
                />
                {errors.name && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input form-textarea"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this package offers..."
                rows={3}
              />
              {errors.description && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.description}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                />
                {errors.price && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.price}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Billing Cycle *</label>
                <select
                  className="form-select"
                  value={formData.billingCycle}
                  onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Max Clubs *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.maxClubs}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxClubs: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
                {errors.maxClubs && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.maxClubs}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Max Events/Month *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.maxEvents}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxEvents: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
                {errors.maxEvents && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.maxEvents}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Max Staff *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.maxStaff}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxStaff: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
                {errors.maxStaff && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.maxStaff}</span>}
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                  style={{ accentColor: '#405189' }}
                />
                <span className="form-label" style={{ margin: 0 }}>Mark as Popular Plan</span>
              </label>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="form-label">Features *</label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  <Plus size={12} />
                  Add Feature
                </button>
              </div>
              
              {formData.features.map((feature, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Enter feature description"
                    style={{ flex: 1 }}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {errors.features && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.features}</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {pkg ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PackageManager: React.FC = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [showPackageEditor, setShowPackageEditor] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setPackages([
        {
          id: '1',
          name: 'Basic',
          description: 'Perfect for small clubs getting started with digital management',
          price: 99,
          billingCycle: 'monthly',
          features: [
            'Event Management',
            'Basic Analytics',
            'Customer Database',
            'Email Support',
            'Mobile App Access'
          ],
          maxClubs: 1,
          maxEvents: 10,
          maxStaff: 5,
          status: 'active',
          createdAt: '2024-01-01',
          subscriberCount: 15
        },
        {
          id: '2',
          name: 'Premium',
          description: 'Advanced features for growing clubs with comprehensive needs',
          price: 199,
          billingCycle: 'monthly',
          features: [
            'All Basic Features',
            'Advanced Analytics',
            'Staff Management',
            'Promoter Network',
            'Priority Support',
            'Unlimited Events',
            'Custom Branding',
            'API Access'
          ],
          maxClubs: 3,
          maxEvents: -1, // Unlimited
          maxStaff: 25,
          status: 'active',
          createdAt: '2024-01-01',
          subscriberCount: 8,
          isPopular: true
        },
        {
          id: '3',
          name: 'Enterprise',
          description: 'Complete solution for large club networks and franchises',
          price: 399,
          billingCycle: 'monthly',
          features: [
            'All Premium Features',
            'Multi-location Support',
            'Dedicated Account Manager',
            '24/7 Phone Support',
            'Custom Integrations',
            'White-label Solution',
            'Advanced Security',
            'Data Export Tools'
          ],
          maxClubs: -1, // Unlimited
          maxEvents: -1, // Unlimited
          maxStaff: -1, // Unlimited
          status: 'active',
          createdAt: '2024-01-01',
          subscriberCount: 3
        },
        {
          id: '4',
          name: 'Starter',
          description: 'Trial package for new customers',
          price: 49,
          billingCycle: 'monthly',
          features: [
            'Basic Event Management',
            'Limited Analytics',
            'Customer Database (100 contacts)',
            'Email Support'
          ],
          maxClubs: 1,
          maxEvents: 3,
          maxStaff: 2,
          status: 'inactive',
          createdAt: '2024-06-01',
          subscriberCount: 0
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPackage = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
    setShowPackageEditor(true);
  };

  const handleCreatePackage = () => {
    setSelectedPackage(null);
    setShowPackageEditor(true);
  };

  const handleSavePackage = (pkg: SubscriptionPackage) => {
    if (selectedPackage) {
      setPackages(prev => prev.map(p => p.id === pkg.id ? pkg : p));
    } else {
      setPackages(prev => [...prev, pkg]);
    }
  };

  const handleDeletePackage = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    if (pkg.subscriberCount > 0) {
      alert(`Cannot delete package "${pkg.name}" because it has ${pkg.subscriberCount} active subscribers. Please migrate subscribers to another package first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the "${pkg.name}" package?`)) {
      setPackages(prev => prev.filter(p => p.id !== packageId));
    }
  };

  const handleStatusToggle = (packageId: string) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, status: pkg.status === 'active' ? 'inactive' : 'active' }
        : pkg
    ));
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getPlanIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('basic') || lowerName.includes('starter')) {
      return <Package size={20} style={{ color: '#3b82f6' }} />;
    } else if (lowerName.includes('premium')) {
      return <Crown size={20} style={{ color: '#f59e0b' }} />;
    } else if (lowerName.includes('enterprise')) {
      return <Building2 size={20} style={{ color: '#10b981' }} />;
    }
    return <Package size={20} style={{ color: '#6b7280' }} />;
  };

  const formatLimit = (value: number) => {
    return value === -1 ? 'Unlimited' : value.toString();
  };

  // Calculate stats
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.status === 'active').length;
  const totalSubscribers = packages.reduce((sum, pkg) => sum + pkg.subscriberCount, 0);
  const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.price * pkg.subscriberCount), 0);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Packages</span>
            <Package size={20} style={{ color: '#405189' }} />
          </div>
          <div className="stat-value">{totalPackages}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {activePackages} active
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Subscribers</span>
            <Users size={20} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-value">{totalSubscribers}</div>
          <div className="stat-change positive">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Across all packages
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Monthly Revenue</span>
            <DollarSign size={20} style={{ color: '#20c997' }} />
          </div>
          <div className="stat-value">${totalRevenue.toLocaleString()}</div>
          <div className="stat-change positive">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              From subscriptions
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Packages</span>
            <CheckCircle size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-value">{activePackages}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Available for purchase
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Subscription Packages</h2>
          <p className="card-subtitle">Create and manage subscription packages for club owners</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={handleCreatePackage}>
            <Plus size={16} />
            Create New Package
          </button>
        </div>

        <div className="search-filter-container">
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#fff' 
            }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search packages..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Package Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="card" style={{ margin: 0, position: 'relative' }}>
              {pkg.isPopular && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                }}>
                  MOST POPULAR
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getPlanIcon(pkg.name)}
                  <div>
                    <h3 style={{ color: '#1e293b', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                      {pkg.name}
                    </h3>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>
                      ${pkg.price}/{pkg.billingCycle}
                    </div>
                  </div>
                </div>
                <span className={`badge ${getStatusBadgeClass(pkg.status)}`}>
                  {pkg.status}
                </span>
              </div>

              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                {pkg.description}
              </p>

              {/* Package Limits */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '12px', 
                marginBottom: '16px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                    {formatLimit(pkg.maxClubs)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Clubs</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                    {formatLimit(pkg.maxEvents)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Events/Month</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                    {formatLimit(pkg.maxStaff)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Staff</div>
                </div>
              </div>

              {/* Features */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Features Included:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pkg.features.slice(0, 4).map((feature, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#374151'
                    }}>
                      <CheckCircle size={12} style={{ color: '#10b981' }} />
                      {feature}
                    </div>
                  ))}
                  {pkg.features.length > 4 && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '20px' }}>
                      +{pkg.features.length - 4} more features
                    </div>
                  )}
                </div>
              </div>

              {/* Subscriber Count */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px',
                padding: '8px 12px',
                background: '#e6f7ff',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
                  Active Subscribers
                </span>
                <span style={{ fontSize: '14px', color: '#0369a1', fontWeight: '700' }}>
                  {pkg.subscriberCount}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                  onClick={() => handleEditPackage(pkg)}
                >
                  <Edit size={12} />
                  Edit
                </button>
                <button 
                  className={`btn ${pkg.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                  style={{ padding: '8px 12px', fontSize: '12px' }}
                  onClick={() => handleStatusToggle(pkg.id)}
                >
                  {pkg.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className="btn btn-danger" 
                  style={{ padding: '8px 12px', fontSize: '12px' }}
                  onClick={() => handleDeletePackage(pkg.id)}
                  disabled={pkg.subscriberCount > 0}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="empty-state">
            <Package size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <div className="empty-state-title">No Packages Found</div>
            <div className="empty-state-description">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first subscription package to get started'
              }
            </div>
            {!searchTerm && statusFilter === 'all' && (
              <button className="btn btn-primary" onClick={handleCreatePackage}>
                Create First Package
              </button>
            )}
          </div>
        )}
      </div>

      <PackageEditor
        package={selectedPackage}
        isOpen={showPackageEditor}
        onClose={() => setShowPackageEditor(false)}
        onSave={handleSavePackage}
      />
    </div>
  );
};

export default PackageManager;