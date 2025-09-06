import React, { useState } from 'react';
import { Upload, Camera, Clock, MapPin, Phone, Mail, Globe, FileText, Download, Eye, X, AlertTriangle, CheckCircle } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import SubscriptionSettings from './SubscriptionSettings';

interface ClubData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  capacity: number;
  description: string;
  profileImage: string;
  gallery: string[];
  operatingHours: {
    [key: string]: string;
  };
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage: string;
  };
  complianceDocuments: ComplianceDocument[];
}

interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  fileUrl: string;
  adminComments?: string;
  notes?: string;
}

const ClubSettings: React.FC = () => {
  const [clubData, setClubData] = useState<ClubData>({
    name: 'Club Paradise',
    address: '123 Main Street, Downtown',
    phone: '+1 555-0100',
    email: 'info@clubparadise.com',
    website: 'https://www.clubparadise.com',
    capacity: 500,
    description: 'Premium nightclub experience with world-class DJs and VIP services.',
    profileImage: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
    gallery: [
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    operatingHours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: '9:00 PM - 2:00 AM',
      thursday: '9:00 PM - 2:00 AM',
      friday: '9:00 PM - 3:00 AM',
      saturday: '9:00 PM - 3:00 AM',
      sunday: '8:00 PM - 1:00 AM'
    },
    owner: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@clubparadise.com',
      phone: '+1 555-0150',
      profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    complianceDocuments: [
      {
        id: '1',
        name: 'Liquor License',
        type: 'liquor_license',
        uploadDate: '2024-01-15',
        expiryDate: '2025-01-15',
        status: 'approved',
        fileUrl: '#',
        adminComments: 'Document approved. Valid until expiry date.',
        notes: 'Annual renewal required'
      },
      {
        id: '2',
        name: 'Fire Safety Certificate',
        type: 'fire_safety',
        uploadDate: '2024-03-10',
        expiryDate: '2025-03-10',
        status: 'pending',
        fileUrl: '#',
        notes: 'Updated after recent inspection'
      },
      {
        id: '3',
        name: 'Business Insurance',
        type: 'insurance',
        uploadDate: '2024-02-01',
        expiryDate: '2025-02-01',
        status: 'rejected',
        fileUrl: '#',
        adminComments: 'Coverage amount insufficient. Please update policy to minimum $2M liability.',
        notes: 'Need to increase coverage'
      }
    ]
  });

  const [activeTab, setActiveTab] = useState('club');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'liquor_license',
    expiryDate: '',
    notes: '',
    file: null as File | null
  });

  const handleImageUpload = (type: 'club' | 'owner' | 'gallery') => {
    const mockImageUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400`;
    
    if (type === 'club') {
      setClubData(prev => ({ ...prev, profileImage: mockImageUrl }));
    } else if (type === 'owner') {
      setClubData(prev => ({ 
        ...prev, 
        owner: { ...prev.owner, profileImage: mockImageUrl }
      }));
    } else if (type === 'gallery') {
      setClubData(prev => ({
        ...prev,
        gallery: [...prev.gallery, mockImageUrl]
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setClubData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleDocumentUpload = () => {
    if (!newDocument.name || !newDocument.file) {
      alert('Please fill in all required fields and select a file.');
      return;
    }

    const document: ComplianceDocument = {
      id: Date.now().toString(),
      name: newDocument.name,
      type: newDocument.type,
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: newDocument.expiryDate || undefined,
      status: 'pending',
      fileUrl: '#',
      notes: newDocument.notes
    };

    setClubData(prev => ({
      ...prev,
      complianceDocuments: [...prev.complianceDocuments, document]
    }));

    setNewDocument({
      name: '',
      type: 'liquor_license',
      expiryDate: '',
      notes: '',
      file: null
    });
    setShowUploadModal(false);
    alert('Document uploaded successfully! It will be reviewed by our compliance team.');
  };

  const removeDocument = (documentId: string) => {
    if (confirm('Are you sure you want to remove this document?')) {
      setClubData(prev => ({
        ...prev,
        complianceDocuments: prev.complianceDocuments.filter(doc => doc.id !== documentId)
      }));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-danger';
      case 'expired': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      liquor_license: 'Liquor License',
      fire_safety: 'Fire Safety Certificate',
      insurance: 'Business Insurance',
      health_permit: 'Health Permit',
      music_license: 'Music License',
      building_permit: 'Building Permit',
      other: 'Other'
    };
    return types[type] || type;
  };

  const isDocumentExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expiry <= thirtyDaysFromNow;
  };

  const handleSave = () => {
    // Mock save functionality
    alert('Club settings saved successfully!');
  };

  const tabs = [
    { id: 'club', label: 'Club Details', icon: <MapPin size={16} /> },
    { id: 'owner', label: 'Owner Profile', icon: <Camera size={16} /> },
    { id: 'subscription', label: 'Subscription', icon: <FileText size={16} /> },
    { id: 'hours', label: 'Operating Hours', icon: <Clock size={16} /> },
    { id: 'gallery', label: 'Gallery', icon: <Upload size={16} /> },
    { id: 'compliance', label: 'Compliance', icon: <FileText size={16} /> }
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Club Settings</h2>
          <p className="card-subtitle">Manage your club information and settings</p>
        </div>

        <div className="modal-tabs" style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`modal-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'club' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '12px',
                margin: '0 auto 12px',
                background: clubData.profileImage ? `url(${clubData.profileImage})` : '#f1f5f9',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #e2e8f0'
              }}>
                {!clubData.profileImage && (
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Image</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleImageUpload('club')}
                className="btn btn-secondary" /* Keep as is */
              >
                <Upload size={16} />
                Upload Club Photo
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Club Name</label>
              <input
                type="text"
                className="form-input"
                value={clubData.name}
                onChange={(e) => setClubData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input
                type="number"
                className="form-input"
                value={clubData.capacity}
                onChange={(e) => setClubData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                value={clubData.address}
                onChange={(e) => setClubData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={clubData.phone}
                onChange={(e) => setClubData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={clubData.email}
                onChange={(e) => setClubData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="url"
                className="form-input"
                value={clubData.website}
                onChange={(e) => setClubData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={clubData.description}
                onChange={(e) => setClubData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        )}

        {activeTab === 'owner' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '20px' }}>
              <ProfileImage 
                firstName={clubData.owner.firstName}
                lastName={clubData.owner.lastName}
                imageUrl={clubData.owner.profileImage}
                size="lg"
                className="mx-auto mb-3"
              />
              <button
                type="button"
                onClick={() => handleImageUpload('owner')}
                className="btn btn-secondary"
              > {/* Keep as is */}
                <Camera size={16} />
                Update Photo
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={clubData.owner.firstName}
                onChange={(e) => setClubData(prev => ({ 
                  ...prev, 
                  owner: { ...prev.owner, firstName: e.target.value }
                }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={clubData.owner.lastName}
                onChange={(e) => setClubData(prev => ({ 
                  ...prev, 
                  owner: { ...prev.owner, lastName: e.target.value }
                }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={clubData.owner.email}
                onChange={(e) => setClubData(prev => ({ 
                  ...prev, 
                  owner: { ...prev.owner, email: e.target.value }
                }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={clubData.owner.phone}
                onChange={(e) => setClubData(prev => ({ 
                  ...prev, 
                  owner: { ...prev.owner, phone: e.target.value }
                }))}
              />
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <SubscriptionSettings />
        )}

        {activeTab === 'hours' && (
          <div>
            <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Operating Hours
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {Object.entries(clubData.operatingHours).map(([day, hours]) => (
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
                    onChange={(e) => setClubData(prev => ({
                      ...prev,
                      operatingHours: { ...prev.operatingHours, [day]: e.target.value }
                    }))}
                    placeholder="9:00 PM - 2:00 AM or Closed"
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                Club Photo Gallery
              </h3>
              <button
                type="button"
                onClick={() => handleImageUpload('gallery')}
                className="btn btn-primary"
              >
                <Upload size={16} />
                Add Photo
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              {clubData.gallery.map((image, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <div style={{
                    width: '100%',
                    height: '150px',
                    borderRadius: '8px',
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
                      top: '8px',
                      right: '8px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {clubData.gallery.length === 0 && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No photos in gallery. Click "Add Photo" to upload images.
              </div>
            )}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                  Compliance Documentation
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  Upload and manage required compliance documents for your club
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
              >
                <Upload size={16} />
                Upload Document
              </button>
            </div>

            {/* Documents List */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {clubData.complianceDocuments.map((document) => (
                <div key={document.id} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  background: '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ color: '#1e293b', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                          {document.name}
                        </h4>
                        <span className={`badge ${getStatusBadgeClass(document.status)}`}>
                          {document.status}
                        </span>
                        {document.expiryDate && isDocumentExpiringSoon(document.expiryDate) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                            <AlertTriangle size={14} />
                            <span style={{ fontSize: '11px', fontWeight: '600' }}>Expires Soon</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                        <div>
                          <strong>Type:</strong> {getDocumentTypeLabel(document.type)}
                        </div>
                        <div>
                          <strong>Uploaded:</strong> {new Date(document.uploadDate).toLocaleDateString()}
                        </div>
                        {document.expiryDate && (
                          <div>
                            <strong>Expires:</strong> {new Date(document.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {document.notes && (
                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                          <strong>Notes:</strong> {document.notes}
                        </div>
                      )}
                      {document.adminComments && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: document.status === 'rejected' ? '#fef2f2' : '#f0f9ff',
                          borderRadius: '6px',
                          borderLeft: `3px solid ${document.status === 'rejected' ? '#ef4444' : '#3b82f6'}`
                        }}>
                          <div style={{ fontSize: '11px', color: document.status === 'rejected' ? '#dc2626' : '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
                            Admin Comments:
                          </div>
                          <div style={{ fontSize: '13px', color: '#374151' }}>
                            {document.adminComments}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => window.open(document.fileUrl, '_blank')}
                      >
                        <Eye size={12} />
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Download size={12} />
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDocument(document.id)}
                        style={{
                          padding: '6px 8px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {clubData.complianceDocuments.length === 0 && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                color: '#9ca3af'
              }}>
                <FileText size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
                <h3 style={{ color: '#374151', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  No Compliance Documents
                </h3>
                <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                  Upload your required compliance documents to get started
                </p>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="btn btn-primary"
                >
                  <Upload size={16} />
                  Upload First Document
                </button>
              </div>
            )}
          </div>
        )}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Upload Compliance Document</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Document Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Liquor License 2024"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Type *</label>
                <select
                  className="form-select"
                  value={newDocument.type}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="liquor_license">Liquor License</option>
                  <option value="fire_safety">Fire Safety Certificate</option>
                  <option value="insurance">Business Insurance</option>
                  <option value="health_permit">Health Permit</option>
                  <option value="music_license">Music License</option>
                  <option value="building_permit">Building Permit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={newDocument.expiryDate}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, expiryDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">File *</label>
                <input
                  type="file"
                  className="form-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setNewDocument(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Accepted formats: PDF, JPEG, PNG (Max 10MB)
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  value={newDocument.notes}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes about this document..."
                  rows={3}
                />
              </div>

              <div style={{
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '6px',
                border: '1px solid #bae6fd',
                fontSize: '13px',
                color: '#0369a1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CheckCircle size={14} />
                  <strong>Upload Guidelines:</strong>
                </div>
                <ul style={{ margin: '4px 0 0 22px', paddingLeft: 0 }}>
                  <li>Documents will be reviewed by our compliance team</li>
                  <li>You'll receive email notifications about the review status</li>
                  <li>Ensure documents are clear and all text is readable</li>
                  <li>Upload the most recent version of each document</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDocumentUpload}
              >
                <Upload size={16} />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubSettings;