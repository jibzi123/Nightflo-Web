import React, { useState, useEffect } from 'react';
import { Club } from '../../types/api';
import { apiClient } from '../../services/apiClient';
import { X, Upload, Eye, EyeOff } from 'lucide-react';
import '../../styles/components.css';

interface ClubEditorProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (club: Club) => void;
}

interface ClubFormData extends Club {
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerProfilePicture: string;
  newPassword: string;
  confirmPassword: string;
  gallery: string[];
  profilePicture: string;
  description: string;
  website: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  operatingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

const ClubEditor: React.FC<ClubEditorProps> = ({ club, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<ClubFormData>({
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    capacity: 0,
    status: 'active',
    createdAt: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerProfilePicture: '',
    newPassword: '',
    confirmPassword: '',
    gallery: [],
    profilePicture: '',
    description: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    operatingHours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: '9:00 PM - 2:00 AM',
      thursday: '9:00 PM - 2:00 AM',
      friday: '9:00 PM - 3:00 AM',
      saturday: '9:00 PM - 3:00 AM',
      sunday: '8:00 PM - 1:00 AM'
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (club) {
      setFormData({
        ...club,
        ownerFirstName: 'John',
        ownerLastName: 'Doe',
        ownerEmail: 'john.doe@email.com',
        ownerPhone: '+1 555-0100',
        ownerProfilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        newPassword: '',
        confirmPassword: '',
        gallery: [
          'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        profilePicture: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
        description: 'Premium nightclub experience with world-class DJs and VIP services.',
        website: 'https://www.clubwebsite.com',
        socialMedia: {
          facebook: 'https://facebook.com/club',
          instagram: 'https://instagram.com/club',
          twitter: 'https://twitter.com/club'
        },
        operatingHours: {
          monday: 'Closed',
          tuesday: 'Closed',
          wednesday: '9:00 PM - 2:00 AM',
          thursday: '9:00 PM - 2:00 AM',
          friday: '9:00 PM - 3:00 AM',
          saturday: '9:00 PM - 3:00 AM',
          sunday: '8:00 PM - 1:00 AM'
        }
      });
    } else {
      // Reset form for new club
      setFormData({
        id: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        capacity: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        ownerFirstName: '',
        ownerLastName: '',
        ownerEmail: '',
        ownerPhone: '',
        ownerProfilePicture: '',
        newPassword: '',
        confirmPassword: '',
        gallery: [],
        profilePicture: '',
        description: '',
        website: '',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: ''
        },
        operatingHours: {
          monday: 'Closed',
          tuesday: 'Closed',
          wednesday: '9:00 PM - 2:00 AM',
          thursday: '9:00 PM - 2:00 AM',
          friday: '9:00 PM - 3:00 AM',
          saturday: '9:00 PM - 3:00 AM',
          sunday: '8:00 PM - 1:00 AM'
        }
      });
    }
    setErrors({});
  }, [club]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof ClubFormData] as any,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (type: 'profile' | 'owner' | 'gallery') => {
    // Mock image upload - in real app, this would handle file upload
    const mockImageUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400`;
    
    if (type === 'profile') {
      handleInputChange('profilePicture', mockImageUrl);
    } else if (type === 'owner') {
      handleInputChange('ownerProfilePicture', mockImageUrl);
    } else if (type === 'gallery') {
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, mockImageUrl]
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Club name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
    
    if (!formData.ownerFirstName.trim()) newErrors.ownerFirstName = 'Owner first name is required';
    if (!formData.ownerLastName.trim()) newErrors.ownerLastName = 'Owner last name is required';
    if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Owner email is required';
    
    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

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
      
      const updatedClub: Club = {
        id: formData.id || Date.now().toString(),
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        capacity: formData.capacity,
        status: formData.status,
        createdAt: formData.createdAt || new Date().toISOString()
      };
      
      onSave(updatedClub);
      onClose();
    } catch (error) {
      console.error('Failed to save club:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'owner', label: 'Owner Details' },
    { id: 'media', label: 'Media & Gallery' },
    { id: 'hours', label: 'Operating Hours' },
    { id: 'security', label: 'Security' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{club ? 'Edit Club' : 'Add New Club'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`modal-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {activeTab === 'basic' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Club Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter club name"
                  />
                  {errors.name && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter full address"
                  />
                  {errors.address && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 555-0100"
                  />
                  {errors.phone && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@club.com"
                  />
                  {errors.email && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                    placeholder="500"
                    min="1"
                  />
                  {errors.capacity && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.capacity}</span>}
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the club atmosphere, music style, target audience..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.clubwebsite.com"
                  />
                </div>
              </div>
            )}

            {activeTab === 'owner' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    background: formData.ownerProfilePicture ? `url(${formData.ownerProfilePicture})` : '#f1f5f9',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #e2e8f0'
                  }}>
                    {!formData.ownerProfilePicture && (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Image</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImageUpload('owner')}
                    className="btn btn-secondary"
                      className="btn btn-secondary" /* Keep as is */
                  >
                    <Upload size={14} />
                    Upload Photo
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.ownerFirstName}
                    onChange={(e) => handleInputChange('ownerFirstName', e.target.value)}
                    placeholder="John"
                  />
                  {errors.ownerFirstName && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.ownerFirstName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.ownerLastName}
                    onChange={(e) => handleInputChange('ownerLastName', e.target.value)}
                    placeholder="Doe"
                  />
                  {errors.ownerLastName && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.ownerLastName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                    placeholder="owner@email.com"
                  />
                  {errors.ownerEmail && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.ownerEmail}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.ownerPhone}
                    onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                    placeholder="+1 555-0100"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    Social Media Links
                  </h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Facebook</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleNestedInputChange('socialMedia', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/club"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Instagram</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleNestedInputChange('socialMedia', 'instagram', e.target.value)}
                    placeholder="https://instagram.com/club"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Twitter</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleNestedInputChange('socialMedia', 'twitter', e.target.value)}
                    placeholder="https://twitter.com/club"
                  />
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div>
                {/* Profile Picture */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    Club Profile Picture
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      background: formData.profilePicture ? `url(${formData.profilePicture})` : '#f1f5f9',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #e2e8f0'
                    }}>
                      {!formData.profilePicture && (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Image</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageUpload('profile')}
                      className="btn btn-secondary" /* Keep as is */
                    >
                      <Upload size={16} />
                      Upload Picture
                    </button>
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                      Photo Gallery
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleImageUpload('gallery')}
                      className="btn btn-primary" /* Changed to primary button */
                    >
                      <Upload size={16} />
                      Add Photo
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '12px'
                  }}>
                    {formData.gallery.map((image, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <div style={{
                          width: '100%',
                          height: '120px',
                          borderRadius: '6px',
                          background: `url(${image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '1px solid #e2e8f0'
                        }} />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center', /* Keep as is */
                            cursor: 'pointer',
                            color: 'white'
                          }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {formData.gallery.length === 0 && (
                    <div style={{
                      padding: '32px',
                      textAlign: 'center',
                      border: '2px dashed #d1d5db',
                      borderRadius: '6px',
                      color: '#9ca3af',
                      fontSize: '13px'
                    }}>
                      No photos in gallery. Click "Add Photo" to upload images.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'hours' && (
              <div>
                <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                  Operating Hours
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {Object.entries(formData.operatingHours).map(([day, hours]) => (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{
                        color: '#1e293b',
                        fontWeight: '600',
                        minWidth: '80px',
                        textTransform: 'capitalize',
                        fontSize: '13px'
                      }}>
                        {day}:
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={hours}
                        onChange={(e) => handleNestedInputChange('operatingHours', day, e.target.value)}
                        placeholder="9:00 PM - 2:00 AM or Closed"
                        style={{ flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password (optional)"
                      style={{ paddingRight: '36px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.newPassword && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                      style={{ paddingRight: '36px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.confirmPassword}</span>}
                </div>

                <div style={{ gridColumn: '1 / -1', padding: '12px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a' }}>
                  <h4 style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                    Security Notice
                  </h4>
                  <p style={{ color: '#92400e', fontSize: '12px', margin: 0 }}>
                    Changing the password will require the club owner to log in with the new credentials. 
                    Make sure to communicate the new password securely.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (club ? 'Update Club' : 'Create Club')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubEditor;