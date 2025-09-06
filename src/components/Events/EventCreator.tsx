import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, MapPin, DollarSign, Users, Save, X } from 'lucide-react';
import '../../styles/components.css';

interface EventCreatorProps {
  onEventCreated: () => void;
}

interface EventFormData {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  clubId: string;
  capacity: number;
  ticketTiers: Array<{
    name: string;
    price: number;
    quantity: number;
    description: string;
  }>;
}

const EventCreator: React.FC<EventCreatorProps> = ({ onEventCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    date: '',
    startTime: '21:00',
    endTime: '03:00',
    clubId: user?.clubId || '',
    capacity: 500,
    ticketTiers: [
      { name: 'General Admission', price: 25, quantity: 200, description: 'Standard entry' },
      { name: 'VIP', price: 75, quantity: 50, description: 'VIP access with premium benefits' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTicketTierChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };

  const addTicketTier = () => {
    setFormData(prev => ({
      ...prev,
      ticketTiers: [...prev.ticketTiers, { name: '', price: 0, quantity: 0, description: '' }]
    }));
  };

  const removeTicketTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Event date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
    if (formData.ticketTiers.length === 0) newErrors.ticketTiers = 'At least one ticket tier is required';

    formData.ticketTiers.forEach((tier, index) => {
      if (!tier.name.trim()) newErrors[`tier_${index}_name`] = 'Ticket name is required';
      if (tier.price <= 0) newErrors[`tier_${index}_price`] = 'Price must be greater than 0';
      if (tier.quantity <= 0) newErrors[`tier_${index}_quantity`] = 'Quantity must be greater than 0';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Mock API call - in real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Event created successfully!');
      onEventCreated();
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Calendar size={24} style={{ display: 'inline-block', marginRight: '8px', color: '#405189' }} />
            Create New Event
          </h2>
          <p className="card-subtitle">Set up a new event with ticket tiers and details</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Event Information */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Event Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Saturday Night Fever"
                />
                {errors.name && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.name}</span>}
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event, music style, special features..."
                  rows={3}
                />
                {errors.description && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.description}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
                {errors.startTime && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.startTime}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
                {errors.endTime && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.endTime}</span>}
              </div>

              {user?.userType === 'super_admin' && (
                <div className="form-group">
                  <label className="form-label">Club *</label>
                  <select
                    className="form-select"
                    value={formData.clubId}
                    onChange={(e) => handleInputChange('clubId', e.target.value)}
                  >
                    <option value="">Select Club</option>
                    <option value="1">Club Paradise</option>
                    <option value="2">Electric Nights</option>
                    <option value="3">Neon Dreams</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                  min="1"
                />
                {errors.capacity && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.capacity}</span>}
              </div>
            </div>
          </div>

          {/* Ticket Tiers */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                Ticket Tiers
              </h3>
              <button
                type="button"
                onClick={addTicketTier}
                className="btn btn-secondary"
              >
                <DollarSign size={16} />
                Add Tier
              </button>
            </div>

            {formData.ticketTiers.map((tier, index) => (
              <div key={index} style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '16px',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                    Ticket Tier {index + 1}
                  </h4>
                  {formData.ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketTier(index)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={12} />
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Tier Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={tier.name}
                      onChange={(e) => handleTicketTierChange(index, 'name', e.target.value)}
                      placeholder="General Admission"
                    />
                    {errors[`tier_${index}_name`] && (
                      <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors[`tier_${index}_name`]}</span>
                    )}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Price ($) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={tier.price}
                      onChange={(e) => handleTicketTierChange(index, 'price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                    {errors[`tier_${index}_price`] && (
                      <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors[`tier_${index}_price`]}</span>
                    )}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={tier.quantity}
                      onChange={(e) => handleTicketTierChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                    {errors[`tier_${index}_quantity`] && (
                      <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors[`tier_${index}_quantity`]}</span>
                    )}
                  </div>

                  <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={tier.description}
                      onChange={(e) => handleTicketTierChange(index, 'description', e.target.value)}
                      placeholder="What's included with this ticket..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {errors.ticketTiers && (
              <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.ticketTiers}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onEventCreated}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreator;