import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, FileText, Download, Eye, CheckCircle, X, AlertTriangle, MessageSquare, Building2 } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

interface ComplianceDocument {
  id: string;
  clubId: string;
  clubName: string;
  ownerName: string;
  ownerEmail: string;
  ownerImage?: string;
  documentName: string;
  documentType: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  fileUrl: string;
  adminComments?: string;
  notes?: string;
}

interface ReviewModalProps {
  document: ComplianceDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onReview: (documentId: string, status: 'approved' | 'rejected', comments: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ document, isOpen, onClose, onReview }) => {
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [comments, setComments] = useState('');

  React.useEffect(() => {
    if (document) {
      setComments(document.adminComments || '');
      setReviewStatus('approved');
    }
  }, [document]);

  const handleSubmit = () => {
    if (!document) return;
    onReview(document.id, reviewStatus, comments);
    onClose();
  };

  if (!isOpen || !document) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Review Compliance Document</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          {/* Document Info */}
          <div style={{ 
            padding: '16px', 
            background: '#f8fafc', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <ProfileImage 
                firstName={document.ownerName.split(' ')[0]}
                lastName={document.ownerName.split(' ')[1] || ''}
                imageUrl={document.ownerImage}
                size="sm"
              />
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>
                  {document.clubName}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Owner: {document.ownerName} • {document.ownerEmail}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div>
                <strong>Document:</strong> {document.documentName}
              </div>
              <div>
                <strong>Type:</strong> {document.documentType.replace('_', ' ')}
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
              <div style={{ marginTop: '12px', fontSize: '13px' }}>
                <strong>Club Notes:</strong> {document.notes}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="form-group">
            <label className="form-label">Review Decision</label>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="reviewStatus"
                  value="approved"
                  checked={reviewStatus === 'approved'}
                  onChange={(e) => setReviewStatus(e.target.value as 'approved')}
                  style={{ accentColor: '#10b981' }}
                />
                <span style={{ color: '#10b981', fontWeight: '600' }}>Approve</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="reviewStatus"
                  value="rejected"
                  checked={reviewStatus === 'rejected'}
                  onChange={(e) => setReviewStatus(e.target.value as 'rejected')}
                  style={{ accentColor: '#ef4444' }}
                />
                <span style={{ color: '#ef4444', fontWeight: '600' }}>Reject</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Comments {reviewStatus === 'rejected' && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <textarea
              className="form-input form-textarea"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                reviewStatus === 'approved' 
                  ? 'Optional: Add any comments about the approval...'
                  : 'Required: Explain why this document is being rejected and what needs to be corrected...'
              }
              rows={4}
            />
          </div>

          <div style={{
            padding: '12px',
            background: reviewStatus === 'approved' ? '#f0fdf4' : '#fef2f2',
            borderRadius: '6px',
            border: `1px solid ${reviewStatus === 'approved' ? '#bbf7d0' : '#fecaca'}`,
            fontSize: '13px',
            color: reviewStatus === 'approved' ? '#166534' : '#dc2626'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {reviewStatus === 'approved' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              <strong>
                {reviewStatus === 'approved' ? 'Approval Notice:' : 'Rejection Notice:'}
              </strong>
            </div>
            <div>
              {reviewStatus === 'approved' 
                ? 'The club owner will be notified that their document has been approved and is now valid for compliance purposes.'
                : 'The club owner will be notified about the rejection and will need to upload a corrected version of this document.'
              }
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className={`btn ${reviewStatus === 'approved' ? 'btn-success' : 'btn-danger'}`}
            onClick={handleSubmit}
            disabled={reviewStatus === 'rejected' && !comments.trim()}
          >
            {reviewStatus === 'approved' ? 'Approve Document' : 'Reject Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ComplianceManager: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clubFilter, setClubFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<ComplianceDocument | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setDocuments([
        {
          id: '1',
          clubId: '1',
          clubName: 'Club Paradise',
          ownerName: 'John Smith',
          ownerEmail: 'john.smith@clubparadise.com',
          ownerImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          documentName: 'Liquor License 2024',
          documentType: 'liquor_license',
          uploadDate: '2025-01-15',
          expiryDate: '2026-01-15',
          status: 'pending',
          fileUrl: '#',
          notes: 'Updated license for 2024-2025 period'
        },
        {
          id: '2',
          clubId: '2',
          clubName: 'Electric Nights',
          ownerName: 'Sarah Johnson',
          ownerEmail: 'sarah.j@electricnights.com',
          ownerImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          documentName: 'Fire Safety Certificate',
          documentType: 'fire_safety',
          uploadDate: '2025-01-10',
          expiryDate: '2026-01-10',
          status: 'approved',
          fileUrl: '#',
          adminComments: 'Document approved. All safety requirements met.',
          notes: 'Annual fire safety inspection completed'
        },
        {
          id: '3',
          clubId: '1',
          clubName: 'Club Paradise',
          ownerName: 'John Smith',
          ownerEmail: 'john.smith@clubparadise.com',
          ownerImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          documentName: 'Business Insurance Policy',
          documentType: 'insurance',
          uploadDate: '2025-01-05',
          expiryDate: '2026-01-05',
          status: 'rejected',
          fileUrl: '#',
          adminComments: 'Coverage amount insufficient. Please update policy to minimum $2M liability coverage.',
          notes: 'Current policy covers $1M liability'
        },
        {
          id: '4',
          clubId: '3',
          clubName: 'Neon Dreams',
          ownerName: 'Mike Rodriguez',
          ownerEmail: 'mike.r@neondreams.com',
          documentName: 'Health Permit',
          documentType: 'health_permit',
          uploadDate: '2024-12-20',
          expiryDate: '2025-02-15',
          status: 'expired',
          fileUrl: '#',
          adminComments: 'Document has expired. Please upload renewed permit.',
          notes: 'Renewal in progress'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch compliance documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDocument = (document: ComplianceDocument) => {
    setSelectedDocument(document);
    setShowReviewModal(true);
  };

  const handleDocumentReview = (documentId: string, status: 'approved' | 'rejected', comments: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, status, adminComments: comments }
        : doc
    ));
    
    // In real app, this would send notification to club owner
    alert(`Document ${status}! Club owner will be notified via email.`);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesClub = clubFilter === 'all' || doc.clubName === clubFilter;
    const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesClub && matchesType;
  });

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

  // Calculate stats
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const expiredCount = documents.filter(d => d.status === 'expired').length;
  const expiringSoonCount = documents.filter(d => d.expiryDate && isDocumentExpiringSoon(d.expiryDate)).length;

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending Review</span>
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Awaiting your review
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Expired Documents</span>
            <X size={20} style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-value">{expiredCount}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Need immediate attention
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Expiring Soon</span>
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-value">{expiringSoonCount}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Within 30 days
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Documents</span>
            <FileText size={20} style={{ color: '#405189' }} />
          </div>
          <div className="stat-value">{documents.length}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              All compliance docs
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Compliance Documentation Management</h2>
          <p className="card-subtitle">Review and manage compliance documents from all clubs</p>
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
              placeholder="Search documents, clubs, or owners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <select
            className="filter-select"
            value={clubFilter}
            onChange={(e) => setClubFilter(e.target.value)}
          >
            <option value="all">All Clubs</option>
            <option value="Club Paradise">Club Paradise</option>
            <option value="Electric Nights">Electric Nights</option>
            <option value="Neon Dreams">Neon Dreams</option>
          </select>
          
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="liquor_license">Liquor License</option>
            <option value="fire_safety">Fire Safety</option>
            <option value="insurance">Insurance</option>
            <option value="health_permit">Health Permit</option>
            <option value="music_license">Music License</option>
          </select>
          
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Club & Owner</th>
                <th>Document</th>
                <th>Type</th>
                <th>Upload Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ProfileImage 
                        firstName={document.ownerName.split(' ')[0]}
                        lastName={document.ownerName.split(' ')[1] || ''}
                        imageUrl={document.ownerImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                          {document.clubName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {document.ownerName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {document.ownerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                        {document.documentName}
                      </div>
                      {document.notes && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {document.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{getDocumentTypeLabel(document.documentType)}</td>
                  <td>{new Date(document.uploadDate).toLocaleDateString()}</td>
                  <td>
                    <div>
                      {document.expiryDate ? (
                        <>
                          <div style={{ fontSize: '13px', color: '#1e293b' }}>
                            {new Date(document.expiryDate).toLocaleDateString()}
                          </div>
                          {isDocumentExpiringSoon(document.expiryDate) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '11px' }}>
                              <AlertTriangle size={10} />
                              Expires Soon
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>No expiry</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(document.status)}`}>
                      {document.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => window.open(document.fileUrl, '_blank')}
                      >
                        <Eye size={10} />
                        View
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        <Download size={10} />
                        Download
                      </button>
                      {document.status === 'pending' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleReviewDocument(document)}
                        >
                          <MessageSquare size={10} />
                          Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="empty-state">
            <FileText size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <div className="empty-state-title">No Documents Found</div>
            <div className="empty-state-description">
              {searchTerm || statusFilter !== 'all' || clubFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No compliance documents have been uploaded yet'
              }
            </div>
          </div>
        )}
      </div>

      <ReviewModal
        document={selectedDocument}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onReview={handleDocumentReview}
      />
    </div>
  );
};

export default ComplianceManager;