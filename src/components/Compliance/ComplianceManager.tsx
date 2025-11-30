import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle,
  X,
  AlertTriangle,
  MessageSquare,
  Building2,
} from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

interface ComplianceDocument {
  id: string;
  clubId: string;
  clubName: string;
  ownerName: string;
  ownerEmail: string;
  ownerImage?: string | null;
  documentName: string;
  documentType: string;
  uploadDate: string;
  expiryDate?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  fileUrl: string;
  adminComments?: string | null;
  notes?: string | null;
}

/* ---------------------- ReviewModal ---------------------- */
interface ReviewModalProps {
  document: ComplianceDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onReview: (documentId: string, status: 'approved' | 'rejected', comments: string) => Promise<void>;
  apiBaseUrl: string;
  authToken?: string | null;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ document, isOpen, onClose, onReview }) => {
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (document) {
      setComments(document.adminComments || '');
      setReviewStatus('approved');
    }
  }, [document]);

  const handleSubmit = async () => {
    if (!document) return;
    await onReview(document.id, reviewStatus, comments);
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
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <ProfileImage
                firstName={document.ownerName.split(' ')[0] || ''}
                lastName={document.ownerName.split(' ')[1] || ''}
                imageUrl={document.ownerImage || undefined}
                size="sm"
              />
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{document.clubName}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Owner: {document.ownerName} • {document.ownerEmail}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontSize: '13px',
              }}
            >
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
                  onChange={() => setReviewStatus('approved')}
                  style={{ accentColor: '#10b981' }}
                />
                <span style={{ color: '#10b981', fontWeight: 600 }}>Approve</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="reviewStatus"
                  value="rejected"
                  checked={reviewStatus === 'rejected'}
                  onChange={() => setReviewStatus('rejected')}
                  style={{ accentColor: '#ef4444' }}
                />
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Reject</span>
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

          <div
            style={{
              padding: '12px',
              background: reviewStatus === 'approved' ? '#f0fdf4' : '#fef2f2',
              borderRadius: '6px',
              border: `1px solid ${reviewStatus === 'approved' ? '#bbf7d0' : '#fecaca'}`,
              fontSize: '13px',
              color: reviewStatus === 'approved' ? '#166534' : '#dc2626',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {reviewStatus === 'approved' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              <strong>{reviewStatus === 'approved' ? 'Approval Notice:' : 'Rejection Notice:'}</strong>
            </div>
            <div>
              {reviewStatus === 'approved'
                ? 'The club owner will be notified that their document has been approved and is now valid for compliance purposes.'
                : 'The club owner will be notified about the rejection and will need to upload a corrected version of this document.'}
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

/* ---------------------- ComplianceManager ---------------------- */

const API_BASE_URL = 'http://34.229.148.155:4000/api'; // set this in env or leave empty to use relative paths

const ComplianceManager: React.FC = () => {
  const { user } = useAuth();
  // adapt below if your token property differs
  const authToken = (user as any)?.token || (user as any)?.accessToken || null;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------ API: GET documents ------------------ */
  const fetchDocuments = async (clubId?: string) => {
    try {
      setLoading(true);
      // If you want to fetch by clubId, pass query param ?clubId=...
      const url = new URL(`${API_BASE_URL}/compliance/documents`, window.location.origin);
      if (clubId) url.searchParams.set('clubId', clubId);

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (!res.ok) {
        // Try to parse error body if provided
        const errText = await res.text();
        console.error('Fetch documents error:', res.status, errText);
        alert('Failed to fetch compliance documents');
        setDocuments([]);
        return;
      }

      const data = await res.json();

      // Map server response to ComplianceDocument[].
      // If your API returns { data: [...] } or different fields, adjust accordingly.
      let docs: any[] = Array.isArray(data) ? data : data.data || [];

      // Example mapping attempt: tries to normalize fields names to what UI expects.
      const normalized: ComplianceDocument[] = docs.map((d: any) => ({
        id: d.id || d._id || d.documentId || '',
        clubId: d.clubId || d.club || '',
        clubName: d.clubName || d.clubName || d.club?.name || d.clubName || 'Unknown Club',
        ownerName: d.ownerName || (d.owner && `${d.owner.firstName || ''} ${d.owner.lastName || ''}`) || 'Unknown',
        ownerEmail: d.ownerEmail || d.owner?.email || '',
        ownerImage: d.ownerImage || d.owner?.imageUrl || d.owner?.avatar || null,
        documentName: d.documentTitle || d.documentName || d.name || 'Untitled Document',
        documentType: (d.documentType || d.documentType || d.type || 'other').toString().toLowerCase().replace(' ', '_'),
        uploadDate: d.uploadDate || d.createdAt || d.created_at || new Date().toISOString(),
        expiryDate: d.expiryDate || d.expiresAt || d.expiry || null,
        status: (d.status || d.reviewStatus || 'pending').toString().toLowerCase() as
          | 'pending'
          | 'approved'
          | 'rejected'
          | 'expired',
        fileUrl: d.documentUrl || d.fileUrl || (d.downloadUrl ? d.downloadUrl : '#'),
        adminComments: d.adminComments || d.clubComments || null,
        notes: d.notes || d.clubNotes || null,
      }));

      setDocuments(normalized);
    } catch (error) {
      console.error('Failed to fetch compliance documents:', error);
      alert('Failed to fetch compliance documents (network error)');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ API: Create document (example helper) ------------------ */
  // If you need a UI to upload/create documents, call this from that UI.
  const createComplianceDocument = async (payload: {
    clubId: string;
    documentTitle: string;
    documentType: string;
    notes?: string;
    uploadDate: string;
    expiryDate?: string;
    documentUrl: string;
    clubComments?: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/compliance/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('Create document failed', res.status, txt);
        alert('Failed to create document');
        return;
      }
      // refresh list
      await fetchDocuments();
      alert('Document created');
    } catch (err) {
      console.error('Create document error', err);
      alert('Failed to create document (network)');
    }
  };

  /* ------------------ API: Review document (PUT) ------------------ */
  const handleDocumentReview = async (documentId: string, status: 'approved' | 'rejected', comments: string) => {
    // Map our UI values to API payload values (example: "Approve" / "Reject")
    const body = {
      reviewDecision: status === 'approved' ? 'Approve' : 'Reject',
      adminComments: comments,
      reviewedDate: new Date().toISOString().split('T')[0], // "YYYY-MM-DD" format similar to your example
    };

    try {
      const res = await fetch(`${API_BASE_URL}/compliance/documents/${documentId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('Review update failed', res.status, txt);
        alert('Failed to submit review');
        return;
      }

      // Update local state to reflect change
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? { ...doc, status: status, adminComments: comments } : doc))
      );

      // notify
      alert(`Document ${status === 'approved' ? 'approved' : 'rejected'}! Club owner will be notified via email.`);
    } catch (err) {
      console.error('Review error', err);
      alert('Failed to submit review (network)');
    }
  };

  /* ------------------ Download helper ------------------ */
  const handleDownload = async (document: ComplianceDocument) => {
    // If your API exposes a direct download endpoint, prefer opening that.
    // Provided download endpoint example: GET /compliance/documents/{id}/download
    try {
      const downloadEndpoint = `${API_BASE_URL}/compliance/documents/${document.id}/download`;

      // Try fetching the dedicated download endpoint first
      const res = await fetch(downloadEndpoint, {
        method: 'GET',
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (res.ok) {
        // If response is a file (blob)
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application') || contentType.includes('pdf') || contentType.includes('octet-stream')) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          // try to derive filename
          const disposition = res.headers.get('content-disposition') || '';
          const match = disposition.match(/filename="?([^"]+)"?/);
          a.download = match ? match[1] : document.documentName || 'document.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          return;
        }

        // if it's JSON that contains a direct fileUrl, open it
        const json = await res.json();
        if (json && json.documentUrl) {
          window.open(json.documentUrl, '_blank');
          return;
        }
      }

      // Fallback: open fileUrl property if provided
      if (document.fileUrl && document.fileUrl !== '#') {
        window.open(document.fileUrl, '_blank');
        return;
      }

      alert('Unable to download document');
    } catch (err) {
      console.error('Download error', err);
      alert('Failed to download document (network)');
    }
  };

  /* ------------------ Helpers & filters ------------------ */
  const filteredDocuments = documents.filter((doc) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      doc.clubName.toLowerCase().includes(q) ||
      doc.ownerName.toLowerCase().includes(q) ||
      doc.documentName.toLowerCase().includes(q) ||
      doc.ownerEmail.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesClub = clubFilter === 'all' || doc.clubName === clubFilter;
    const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;

    return matchesSearch && matchesStatus && matchesClub && matchesType;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'rejected':
        return 'badge-danger';
      case 'expired':
        return 'badge-danger';
      default:
        return 'badge-info';
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
      other: 'Other',
    };
    return types[type] || type;
  };

  const isDocumentExpiringSoon = (expiryDate?: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow;
  };

  // Stats
  const pendingCount = documents.filter((d) => d.status === 'pending').length;
  const expiredCount = documents.filter((d) => d.status === 'expired').length;
  const expiringSoonCount = documents.filter((d) => d.expiryDate && isDocumentExpiringSoon(d.expiryDate)).length;

  if (loading) {
    return <div className="loading-spinner" />;
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
            <span style={{ fontSize: '12px', color: '#64748b' }}> Awaiting your review </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Expired Documents</span>
            <X size={20} style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-value">{expiredCount}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}> Need immediate attention </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Expiring Soon</span>
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-value">{expiringSoonCount}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}> Within 30 days </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Documents</span>
            <FileText size={20} style={{ color: '#405189' }} />
          </div>
          <div className="stat-value">{documents.length}</div>
          <div className="stat-change">
            <span style={{ fontSize: '12px', color: '#64748b' }}> All compliance docs </span>
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
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search documents, clubs, or owners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <select className="filter-select" value={clubFilter} onChange={(e) => setClubFilter(e.target.value)}>
            <option value="all">All Clubs</option>
            {/* You may want to populate this dynamically */}
            <option value="Club Paradise">Club Paradise</option>
            <option value="Electric Nights">Electric Nights</option>
            <option value="Neon Dreams">Neon Dreams</option>
          </select>

          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="liquor_license">Liquor License</option>
            <option value="fire_safety">Fire Safety</option>
            <option value="insurance">Insurance</option>
            <option value="health_permit">Health Permit</option>
            <option value="music_license">Music License</option>
          </select>

          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                        firstName={document.ownerName.split(' ')[0] || ''}
                        lastName={document.ownerName.split(' ')[1] || ''}
                        imageUrl={document.ownerImage || undefined}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>{document.clubName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{document.ownerName}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{document.ownerEmail}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>{document.documentName}</div>
                      {document.notes && <div style={{ fontSize: '11px', color: '#64748b' }}>{document.notes}</div>}
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
                              <AlertTriangle size={10} /> Expires Soon
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>No expiry</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className={`badge ${getStatusBadgeClass(document.status)}`}>{document.status}</span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => window.open(document.fileUrl, '_blank')}
                      >
                        <Eye size={10} /> View
                      </button>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleDownload(document)}
                      >
                        <Download size={10} /> Download
                      </button>

                      {document.status === 'pending' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => {
                            setSelectedDocument(document);
                            setShowReviewModal(true);
                          }}
                        >
                          <MessageSquare size={10} /> Review
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
                : 'No compliance documents have been uploaded yet'}
            </div>
          </div>
        )}
      </div>

      <ReviewModal
        document={selectedDocument}
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedDocument(null);
        }}
        onReview={handleDocumentReview}
        apiBaseUrl={API_BASE_URL}
        authToken={authToken}
      />
    </div>
  );
};

export default ComplianceManager;
