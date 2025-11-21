import React, { useState } from 'react';
import { Upload, Camera, Clock, MapPin, Phone, Mail, Globe, FileText, Download, Eye, X, AlertTriangle, CheckCircle } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import SubscriptionSettings from './SubscriptionSettings';
import { useAuth } from "../../contexts/AuthContext";
import { toast } from 'react-toastify';


interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate?: string;
  status: "pending" | "approved" | "rejected" | "expired";
  fileUrl: string;
  adminComments?: string;
  notes?: string;
}

interface GalleryImage {
  file: File;
  preview: string;
}

const ClubSettings: React.FC = () => {
  const { user } = useAuth();
  debugger;
  user;
  const [clubData, setClubData] = useState<any>();

  const [activeTab, setActiveTab] = useState('club');
  const MAX_IMAGES = 10;
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "liquor_license",
    expiryDate: "",
    notes: "",
    file: null as File | null,
  });

  // ===== Upload gallery images (limit = 10) =====
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files);

    // Check remaining capacity
    const remainingSlots = MAX_IMAGES - gallery.length;

    if (remainingSlots <= 0) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    // Slice extra images
    const allowedFiles = selectedFiles.slice(0, remainingSlots);

    // Create preview URLs
    const newImages = allowedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    // Update state
    setGallery((prev) => [...prev, ...newImages]);
  };

  // ===== Remove image =====
  const removeGalleryImage = (index: number) => {
    setGallery((prev) => {
      // Revoke preview URL to avoid memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };


  const handleDocumentUpload = () => {
    if (!newDocument.name || !newDocument.file) {
      alert("Please fill in all required fields and select a file.");
      return;
    }

    const document: ComplianceDocument = {
      id: Date.now().toString(),
      name: newDocument.name,
      type: newDocument.type,
      uploadDate: new Date().toISOString().split("T")[0],
      expiryDate: newDocument.expiryDate || undefined,
      status: "pending",
      fileUrl: "#",
      notes: newDocument.notes,
    };

    setClubData((prev) => ({
      ...prev,
      complianceDocuments: [...prev.complianceDocuments, document],
    }));

    setNewDocument({
      name: "",
      type: "liquor_license",
      expiryDate: "",
      notes: "",
      file: null,
    });
    setShowUploadModal(false);
    alert(
      "Document uploaded successfully! It will be reviewed by our compliance team."
    );
  };

  const removeDocument = (documentId: string) => {
    if (confirm("Are you sure you want to remove this document?")) {
      setClubData((prev) => ({
        ...prev,
        complianceDocuments: prev.complianceDocuments.filter(
          (doc) => doc.id !== documentId
        ),
      }));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "rejected":
        return "badge-danger";
      case "expired":
        return "badge-danger";
      default:
        return "badge-info";
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      liquor_license: "Liquor License",
      fire_safety: "Fire Safety Certificate",
      insurance: "Business Insurance",
      health_permit: "Health Permit",
      music_license: "Music License",
      building_permit: "Building Permit",
      other: "Other",
    };
    return types[type] || type;
  };

  const isDocumentExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    return expiry <= thirtyDaysFromNow;
  };

  const handleSave = () => {
    // Mock save functionality
    alert("Club settings saved successfully!");
  };

  const tabs = [
    { id: "club", label: "Club Details", icon: <MapPin size={16} /> },
    { id: "owner", label: "Owner Profile", icon: <Camera size={16} /> },
    { id: "subscription", label: "Subscription", icon: <FileText size={16} /> },
    { id: "hours", label: "Operating Hours", icon: <Clock size={16} /> },
    { id: "gallery", label: "Gallery", icon: <Upload size={16} /> },
    { id: "compliance", label: "Compliance", icon: <FileText size={16} /> },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Club Settings</h2>
          <p className="card-subtitle">
            Manage your club information and settings
          </p>
        </div>

        <div
          className="modal-tabs"
          style={{ borderBottom: "1px solid #e2e8f0", marginBottom: "24px" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`modal-tab-button ${
                activeTab === tab.id ? "active" : ""
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

       {activeTab === 'club' && user?.club && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* ─────────────── CLUB BASIC INFO (Your Existing Code) ─────────────── */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px' 
          }}>

            {/* Club Image */}
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '12px',
                  margin: '0 auto 12px',
                  background: user.club.imageUrl ? `url(${user.club.imageUrl})` : '#f1f5f9',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #e2e8f0'
                }}
              >
                {!user.club.imageUrl && (
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>No Image</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleImageUpload('club')}
                className="btn btn-secondary"
              >
                <Upload size={16} />
                Change Club Photo
              </button>
            </div>

            {/* Club Name */}
            <div className="form-group">
              <label className="form-label">Club Name</label>
              <input
                type="text"
                className="form-input"
                value={user.club.name || ''}
                readOnly
              />
            </div>

            {/* Club City */}
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={user.club.city || ''}
                readOnly
              />
            </div>

            {/* Club Location */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                value={user.club.location || ''}
                readOnly
              />
            </div>

            {/* Opening Hours */}
            <div className="form-group">
              <label className="form-label">Opens At</label>
              <input
                type="text"
                className="form-input"
                value={user.club.openTime || ''}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Closes At</label>
              <input
                type="text"
                className="form-input"
                value={user.club.closeTime || ''}
                readOnly
              />
            </div>

            {/* Subscription Info */}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
  <label className="form-label">Subscribed Plan</label>

  <div
    className="plan-button"
    onClick={() => setActiveTab("subscription")} // your handler here
  >
    <span className="plan-title">
      {user.club.subscribedPlan?.planName || "No Active Plan"}
    </span>

    {user.club.subscribedPlan?.planPrice && (
      <span className="plan-price">
        ${user.club.subscribedPlan.planPrice}
      </span>
    )}

    <span className="plan-arrow">→</span>
  </div>
</div>


            {/* Subscription Expiry */}
            <div className="form-group">
              <label className="form-label">Subscription Ends</label>
              <input
                type="text"
                className="form-input"
                value={
                  user.club.subscriptionExpiryDate
                    ? new Date(user.club.subscriptionExpiryDate).toLocaleDateString()
                    : '—'
                }
                readOnly
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <input
                type="text"
                className="form-input"
                value={user.club.status || 'inactive'}
                readOnly
              />
            </div>
          </div>


          {/* ─────────────── MERGED GALLERY (Your Gallery Tab Merged Here) ─────────────── */}

          <div style={styles.container}>
      <h2 style={styles.title}>Gallery (Max 10 Images)</h2>

      {/* Upload Button */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleGalleryUpload}
        style={styles.fileInput}
      />

      {/* Gallery Grid */}
      <div style={styles.grid}>
        {gallery.map((img, index) => (
          <div key={index} style={styles.card}>
            <img src={img.preview} alt="gallery" style={styles.image} />

            <button
              onClick={() => removeGalleryImage(index)}
              style={styles.deleteBtn}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Debug Section */}
      <pre style={styles.debug}>
        Files ready to upload: {gallery.length}
      </pre>
    </div>


        </div>
      )}



        {activeTab === 'owner' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '20px' }}>
              <ProfileImage 
                firstName={user?.fullName.split(' ')[0] || ''}
                lastName={user?.fullName.split(' ')[1] || ''}
                imageUrl={user?.imageUrl || ''}
                size="lg"
                className="mx-auto mb-3"
              />
              <button
                type="button"
                onClick={() => handleImageUpload("owner")}
                className="btn btn-secondary-outlined"
              >
                {" "}
                {/* Keep as is */}
                <Camera size={16} />
                Update Photo
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={user?.fullName.split(' ')[0] || ''}
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
                value={user?.fullName.split(' ')[1] || ''}
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
                value={user?.email || ''}
                onChange={(e) => setClubData(prev => ({ 
                  ...prev, 
                  owner: { ...prev.owner, email: e.target.value }
                }))}
              />
            </div>

            {/* <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={clubData.owner.phone}
                onChange={(e) =>
                  setClubData((prev) => ({
                    ...prev,
                    owner: { ...prev.owner, phone: e.target.value },
                  }))
                }
              />
            </div> */}
          </div>
        )}

        {activeTab === "subscription" && <SubscriptionSettings />}

        {/* {activeTab === 'hours' && (
          <div>
            <h3
              style={{
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Operating Hours
            </h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {Object.entries(clubData.operatingHours).map(([day, hours]) => (
                <div
                  key={day}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <label
                    style={{
                      color: "#818181",
                      fontWeight: "600",
                      minWidth: "80px",
                      textTransform: "capitalize",
                      fontSize: "13px",
                    }}
                  >
                    {day}:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={hours}
                    onChange={(e) =>
                      setClubData((prev) => ({
                        ...prev,
                        operatingHours: {
                          ...prev.operatingHours,
                          [day]: e.target.value,
                        },
                      }))
                    }
                    placeholder="9:00 PM - 2:00 AM or Closed"
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>
          </div>
        )} */}

        {activeTab === "gallery" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  color: "#818181",
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                Club Photo Gallery
              </h3>
              <button
                type="button"
                onClick={() => handleImageUpload("gallery")}
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
              {clubData?.gallery?.map((image, index) => (
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
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(239, 68, 68, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "white",
                      fontSize: "14px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {clubData?.gallery?.length === 0 && (
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

        {activeTab === "compliance" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  Compliance Documentation
                </h3>
                <p style={{ color: "#B9BAB5", fontSize: "14px", margin: 0 }}>
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
            <div style={{ display: "grid", gap: "16px" }}>
              {clubData.complianceDocuments.map((document) => (
                <div
                  key={document.id}
                  style={{
                    // border: '1px solid #e2e8f0',
                    borderRadius: "8px",
                    padding: "20px",
                    background: "#222222",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <h4
                          style={{
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: "600",
                            margin: 0,
                          }}
                        >
                          {document.name}
                        </h4>
                        <span
                          className={`badge ${getStatusBadgeClass(
                            document.status
                          )}`}
                        >
                          {document.status}
                        </span>
                        {document.expiryDate &&
                          isDocumentExpiringSoon(document.expiryDate) && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#f59e0b",
                              }}
                            >
                              <AlertTriangle size={14} />
                              <span
                                style={{ fontSize: "11px", fontWeight: "600" }}
                              >
                                Expires Soon
                              </span>
                            </div>
                          )}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "12px",
                          fontSize: "13px",
                          color: "#fff",
                        }}
                      >
                        <div>
                          <strong>Type:</strong>{" "}
                          {getDocumentTypeLabel(document.type)}
                        </div>
                        <div>
                          <strong>Uploaded:</strong>{" "}
                          {new Date(document.uploadDate).toLocaleDateString()}
                        </div>
                        {document.expiryDate && (
                          <div>
                            <strong>Expires:</strong>{" "}
                            {new Date(document.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {document.notes && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "13px",
                            color: "#fff",
                          }}
                        >
                          <strong>Notes:</strong> {document.notes}
                        </div>
                      )}
                      {document.adminComments && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px",
                            background:
                              document.status === "rejected"
                                ? "rgb(82 53 53)"
                                : "rgba(0, 231, 190, 0.05)",

                            borderRadius: "6px",
                            borderLeft: `3px solid ${
                              document.status === "rejected"
                                ? "#ef4444"
                                : "#00E7BE"
                            }`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color:
                                document.status === "rejected"
                                  ? "#dc2626"
                                  : "#00E7BE",
                              fontWeight: "600",
                              marginBottom: "4px",
                            }}
                          >
                            Admin Comments:
                          </div>
                          <div style={{ fontSize: "13px", color: "#A5A5A5" }}>
                            {document.adminComments}
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginLeft: "16px",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-secondary-outlined"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => window.open(document.fileUrl, "_blank")}
                      >
                        <Eye size={12} />
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary-outlined"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <Download size={12} />
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDocument(document.id)}
                        className="btn-secondary-outlined"
                        style={{
                          padding: "6px 8px",
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
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  color: "#9ca3af",
                }}
              >
                <FileText
                  size={48}
                  style={{ margin: "0 auto 16px", color: "#9ca3af" }}
                />
                <h3
                  style={{
                    color: "#374151",
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  No Compliance Documents
                </h3>
                <p style={{ fontSize: "14px", marginBottom: "16px" }}>
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
        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #323232",
          }}
        >
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h2 className="modal-title">Upload Compliance Document</h2>
              <button
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Document Name *</label>
                <input
                  type="text"
                  className="form-input modal-input"
                  value={newDocument.name}
                  onChange={(e) =>
                    setNewDocument((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Liquor License 2024"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Type *</label>
                <select
                  className="form-select modal-input"
                  value={newDocument.type}
                  onChange={(e) =>
                    setNewDocument((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
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
                  className="form-input modal-input"
                  value={newDocument.expiryDate}
                  onChange={(e) =>
                    setNewDocument((prev) => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">File *</label>
                <input
                  type="file"
                  className="form-input modal-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setNewDocument((prev) => ({
                      ...prev,
                      file: e.target.files?.[0] || null,
                    }))
                  }
                />
                <div
                  style={{
                    fontSize: "11px",
                    color: "#A1A1A1",
                    marginTop: "4px",
                  }}
                >
                  Accepted formats: PDF, JPEG, PNG (Max 10MB)
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-input form-textarea modal-input"
                  value={newDocument.notes}
                  onChange={(e) =>
                    setNewDocument((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Add any additional notes about this document..."
                  rows={3}
                />
              </div>

              <div
                style={{
                  padding: "12px",
                  background: "#101C19",
                  borderRadius: "6px",
                  borderLeft: "1px solid #00E7BE",
                  fontSize: "13px",
                  color: "##A1A1A1",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <CheckCircle size={14} />
                  <strong>Upload Guidelines:</strong>
                </div>
                <ul style={{ margin: "4px 0 0 22px", paddingLeft: 0 }}>
                  <li>Documents will be reviewed by our compliance team</li>
                  <li>
                    You'll receive email notifications about the review status
                  </li>
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

const styles: any = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "auto",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  fileInput: {
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "12px",
  },
  card: {
    position: "relative",
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100px",
    objectFit: "cover",
  },
  deleteBtn: {
    position: "absolute",
    bottom: "6px",
    left: "6px",
    right: "6px",
    background: "red",
    color: "white",
    padding: "4px 6px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  debug: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#555",
    background: "#f7f7f7",
    padding: "10px",
    borderRadius: "6px",
  },
  
  
};