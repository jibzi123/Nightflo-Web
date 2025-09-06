import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CreditCard, Calendar, DollarSign, CheckCircle, X, AlertTriangle, Edit, Crown, Zap, Building2 } from 'lucide-react';
import '../../styles/components.css';

interface Subscription {
  id: string;
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
  trialDaysLeft?: number;
}

interface PlanChangeModalProps {
  isOpen: boolean;
  currentPlan: 'basic' | 'premium' | 'enterprise';
  onClose: () => void;
  onConfirm: (newPlan: 'basic' | 'premium' | 'enterprise') => void;
}

const PlanChangeModal: React.FC<PlanChangeModalProps> = ({ isOpen, currentPlan, onClose, onConfirm }) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'enterprise'>(currentPlan);

  const plans = {
    basic: {
      name: 'Basic',
      price: 99,
      icon: <CreditCard size={24} />,
      color: '#3b82f6',
      features: [
        'Event Management',
        'Basic Analytics',
        'Customer Database',
        'Email Support',
        'Up to 10 events/month'
      ]
    },
    premium: {
      name: 'Premium',
      price: 199,
      icon: <Crown size={24} />,
      color: '#f59e0b',
      features: [
        'All Basic Features',
        'Advanced Analytics',
        'Staff Management',
        'Promoter Network',
        'Priority Support',
        'Unlimited events',
        'Custom branding'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: 399,
      icon: <Building2 size={24} />,
      color: '#10b981',
      features: [
        'All Premium Features',
        'Multi-location Support',
        'API Access',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'Custom integrations',
        'White-label solution'
      ]
    }
  };

  const isUpgrade = (newPlan: string) => {
    const planOrder = { basic: 1, premium: 2, enterprise: 3 };
    return planOrder[newPlan as keyof typeof planOrder] > planOrder[currentPlan];
  };

  const isDowngrade = (newPlan: string) => {
    const planOrder = { basic: 1, premium: 2, enterprise: 3 };
    return planOrder[newPlan as keyof typeof planOrder] < planOrder[currentPlan];
  };

  const handleConfirm = () => {
    onConfirm(selectedPlan);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Change Subscription Plan</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {Object.entries(plans).map(([planKey, plan]) => (
              <div
                key={planKey}
                onClick={() => setSelectedPlan(planKey as any)}
                style={{
                  border: selectedPlan === planKey ? `2px solid ${plan.color}` : '2px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  background: selectedPlan === planKey ? `${plan.color}08` : '#ffffff',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {currentPlan === planKey && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: plan.color,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    CURRENT
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ color: plan.color }}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 style={{ color: '#1e293b', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                      {plan.name}
                    </h3>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>
                      ${plan.price}/month
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  {plan.features.map((feature, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      fontSize: '13px',
                      color: '#374151'
                    }}>
                      <CheckCircle size={14} style={{ color: plan.color }} />
                      {feature}
                    </div>
                  ))}
                </div>

                {selectedPlan === planKey && (
                  <div style={{
                    padding: '12px',
                    background: `${plan.color}15`,
                    borderRadius: '8px',
                    border: `1px solid ${plan.color}30`
                  }}>
                    <div style={{ fontSize: '12px', color: plan.color, fontWeight: '600' }}>
                      {currentPlan === planKey ? 'Current Plan' : 
                       isUpgrade(planKey) ? 'Upgrade Selected' : 
                       isDowngrade(planKey) ? 'Downgrade Selected' : 'Plan Selected'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedPlan !== currentPlan && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: isUpgrade(selectedPlan) ? '#f0f9ff' : '#fef3c7',
              borderRadius: '8px',
              border: `1px solid ${isUpgrade(selectedPlan) ? '#bae6fd' : '#fde68a'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: isUpgrade(selectedPlan) ? '#0369a1' : '#92400e',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {isUpgrade(selectedPlan) ? <Zap size={16} /> : <AlertTriangle size={16} />}
                {isUpgrade(selectedPlan) ? 'Plan Upgrade' : 'Plan Downgrade'}
              </div>
              <div style={{
                fontSize: '13px',
                color: isUpgrade(selectedPlan) ? '#0369a1' : '#92400e'
              }}>
                {isUpgrade(selectedPlan) 
                  ? `You'll be charged the prorated difference immediately and your next billing cycle will be at the new rate.`
                  : `Your plan will be downgraded at the end of your current billing cycle. You'll continue to have access to current features until then.`
                }
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm}
            disabled={selectedPlan === currentPlan}
          >
            {isUpgrade(selectedPlan) ? 'Upgrade Plan' : 
             isDowngrade(selectedPlan) ? 'Downgrade Plan' : 'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SubscriptionSettings: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      // Mock subscription data
      setSubscription({
        id: '1',
        planType: 'premium',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        monthlyPrice: 199,
        features: [
          'All Basic Features',
          'Advanced Analytics',
          'Staff Management',
          'Promoter Network',
          'Priority Support',
          'Unlimited events',
          'Custom branding'
        ],
        paymentMethod: 'Credit Card ending in 4242',
        lastPayment: '2024-12-01',
        nextBilling: '2025-01-01',
        autoRenew: true
      });
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (newPlan: 'basic' | 'premium' | 'enterprise') => {
    if (!subscription) return;
    
    const planPrices = { basic: 99, premium: 199, enterprise: 399 };
    const planFeatures = {
      basic: ['Event Management', 'Basic Analytics', 'Customer Database', 'Email Support'],
      premium: ['All Basic Features', 'Advanced Analytics', 'Staff Management', 'Promoter Network', 'Priority Support', 'Unlimited events', 'Custom branding'],
      enterprise: ['All Premium Features', 'Multi-location Support', 'API Access', 'Dedicated Account Manager', '24/7 Phone Support', 'Custom integrations', 'White-label solution']
    };

    setSubscription(prev => prev ? {
      ...prev,
      planType: newPlan,
      monthlyPrice: planPrices[newPlan],
      features: planFeatures[newPlan]
    } : null);

    alert(`Plan changed to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} successfully!`);
  };

  const handleCancelSubscription = () => {
    if (!subscription) return;
    
    setSubscription(prev => prev ? {
      ...prev,
      status: 'cancelled',
      autoRenew: false
    } : null);

    setShowCancelModal(false);
    alert('Subscription cancelled. You will continue to have access until your current billing period ends.');
  };

  const toggleAutoRenew = () => {
    if (!subscription) return;
    
    setSubscription(prev => prev ? {
      ...prev,
      autoRenew: !prev.autoRenew
    } : null);

    alert(`Auto-renewal ${subscription.autoRenew ? 'disabled' : 'enabled'} successfully!`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'trial': return 'badge-info';
      case 'expired': return 'badge-danger';
      case 'cancelled': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic': return <CreditCard size={20} style={{ color: '#3b82f6' }} />;
      case 'premium': return <Crown size={20} style={{ color: '#f59e0b' }} />;
      case 'enterprise': return <Building2 size={20} style={{ color: '#10b981' }} />;
      default: return <CreditCard size={20} />;
    }
  };

  const isSubscriptionExpiringSoon = () => {
    if (!subscription?.endDate) return false;
    const expiry = new Date(subscription.endDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expiry <= thirtyDaysFromNow && expiry > today;
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (!subscription) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Subscription</h2>
          <p className="card-subtitle">No active subscription found</p>
        </div>
        <div className="empty-state">
          <CreditCard size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
          <div className="empty-state-title">No Active Subscription</div>
          <div className="empty-state-description">
            Contact support to set up your subscription plan
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Subscription Management</h2>
          <p className="card-subtitle">Manage your subscription plan and billing</p>
        </div>

        {/* Current Plan Overview */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {getPlanIcon(subscription.planType)}
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: 'white' }}>
                  {subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)} Plan
                </h3>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>
                  ${subscription.monthlyPrice}/month
                </div>
              </div>
            </div>
            <span className={`badge ${getStatusBadgeClass(subscription.status)}`}>
              {subscription.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>BILLING CYCLE</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.endDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>NEXT BILLING</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {subscription.nextBilling ? new Date(subscription.nextBilling).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>PAYMENT METHOD</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {subscription.paymentMethod}
              </div>
            </div>
          </div>

          {isSubscriptionExpiringSoon() && subscription.status === 'active' && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: '13px' }}>
                Your subscription expires soon. Make sure auto-renewal is enabled to avoid service interruption.
              </span>
            </div>
          )}
        </div>

        {/* Plan Features */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Current Plan Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {subscription.features.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                background: '#f8fafc',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#374151'
              }}>
                <CheckCircle size={14} style={{ color: '#10b981' }} />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Billing Information */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Billing Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Last Payment</label>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                {subscription.lastPayment ? new Date(subscription.lastPayment).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Auto Renewal</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={subscription.autoRenew}
                    onChange={toggleAutoRenew}
                    style={{ accentColor: '#405189' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowPlanChangeModal(true)}
          >
            <Edit size={16} />
            Change Plan
          </button>
          
          {subscription.status === 'active' && (
            <button 
              className="btn btn-danger"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Subscription
            </button>
          )}
          
          <button className="btn btn-secondary">
            <DollarSign size={16} />
            View Billing History
          </button>
          
          <button className="btn btn-secondary">
            <Calendar size={16} />
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Plan Change Modal */}
      <PlanChangeModal
        isOpen={showPlanChangeModal}
        currentPlan={subscription.planType}
        onClose={() => setShowPlanChangeModal(false)}
        onConfirm={handlePlanChange}
      />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Cancel Subscription</h2>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                padding: '16px',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={16} style={{ color: '#dc2626' }} />
                  <strong style={{ color: '#dc2626' }}>Are you sure you want to cancel?</strong>
                </div>
                <div style={{ fontSize: '13px', color: '#dc2626' }}>
                  You will lose access to all premium features at the end of your current billing cycle 
                  ({new Date(subscription.endDate).toLocaleDateString()}).
                </div>
              </div>
              
              <p style={{ color: '#374151', fontSize: '14px' }}>
                Your subscription will remain active until {new Date(subscription.endDate).toLocaleDateString()}, 
                and you'll continue to have access to all features until then.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                Keep Subscription
              </button>
              <button className="btn btn-danger" onClick={handleCancelSubscription}>
                Yes, Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSettings;