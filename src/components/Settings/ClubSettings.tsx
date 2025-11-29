import React, { useEffect, useState } from 'react';
import { Upload, Camera, Clock, MapPin, Phone, Mail, Globe, FileText, Download, Eye, X, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import SubscriptionSettings from './SubscriptionSettings';
import { useAuth } from "../../contexts/AuthContext";
import { toast } from 'react-toastify';
import { apiClient } from '../../services/apiClient';


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
  const [clubData, setClubData] = useState<any>();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [reviewComments, setReviewComments] = useState("");


  const [activeTab, setActiveTab] = useState('club');
  const MAX_IMAGES = 10;
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [normalizedDocuments, setNormalizedDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "liquor_license",
    expiryDate: "",
    notes: "",
    file: null as File | null,
  });

  useEffect(() => {
  if (activeTab === "compliance" && user?.club?.id) {
    loadDocuments();
  }
}, [activeTab, user?.club?.id]);

  const loadDocuments = async () => {
    try {
      const res = await apiClient.getComplianceDocuments(user?.club?.id);

      // Update raw data
      setClubData(prev => ({
        ...prev,
        complianceDocuments: res.payLoad,
      }));

      // Normalize using the fresh API data (NOT clubData)
      const normalized = res.payLoad.map(doc => ({
        id: doc.id,
        name: doc.documentTitle,
        type: doc.documentType,
        uploadDate: doc.uploadDate,
        expiryDate: doc.expiryDate,
        status: doc.status?.toLowerCase(),
        fileUrl: doc.documentUrl,
        notes: doc.clubComments,
        adminComments: doc.adminComments || null,
        clubName: doc.clubName,
        ownerName: doc.ownerName,
      }));

      setNormalizedDocuments(normalized);

    } catch (error) {
      console.error("Failed to load documents", error);
    }
  };

  const viewDocument = (url: string) => {
  if (!url) {
    alert("Document URL is missing.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

const downloadDocument = async (url: string, fileName = "document") => {
  try {
    if (!url) {
      alert("Document not available.");
      return;
    }

    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to download");

    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;

    // Try to use correct extension
    const ext = url.split(".").pop().split("?")[0];
    link.download = `${fileName}.${ext || "pdf"}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download error:", error);
    alert("Failed to download document.");
  }
};

const openReviewModal = (doc) => {
  setSelectedDocument(doc);
  setReviewStatus("approved");           // default
  setReviewComments(doc.adminComments || "");
  setShowReviewModal(true);
};

const submitReview = async () => {
  if (!selectedDocument) return;

  try {
    const payload = {
      reviewDecision: reviewStatus === "approved" ? "Approve" : "Reject",
      adminComments: reviewComments,
      reviewedDate: new Date().toISOString(),
    };

    const response = await apiClient.reviewComplianceDocument(
      selectedDocument.id,
      payload
    );

    // Update list UI
    setNormalizedDocuments(prev =>
      prev.map(doc =>
        doc.id === selectedDocument.id
          ? {
              ...doc,
              status: reviewStatus,
              adminComments: reviewComments
            }
          : doc
      )
    );

    setShowReviewModal(false);
    alert("Document reviewed successfully!");

  } catch (err) {
    console.error("Review failed:", err);
    alert("Failed to update review status.");
  }
};



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


const handleDocumentUpload = async () => {
  if (!newDocument.name || !newDocument.file) {
    alert("Please select a file and enter a title.");
    return;
  }

  try {
    const fileExt = newDocument.file.name.split(".").pop().toLowerCase();

    // STEP 1 — Build FormData EXACTLY like your cURL request
    const formData = new FormData();
    formData.append("document", newDocument.file);
    formData.append("documentType", newDocument.type);
    formData.append("clubId", user?.club?.id);
    formData.append("fileExtension", fileExt);

    // STEP 2 — Upload file FIRST
    const uploadRes = await apiClient.uploadComplianceDocument(formData);

    const uploadedFileUrl = uploadRes?.payLoad?.documentUrl;

    if (!uploadedFileUrl) {
      alert("Upload failed (no file URL returned).");
      return;
    }

    // STEP 3 — Save metadata record in your database
    const createPayload = {
      clubId: user?.club?.id,
      documentTitle: newDocument.name,
      documentType: newDocument.type,
      documentUrl: uploadedFileUrl,
      uploadDate: new Date().toISOString(),
      expiryDate: newDocument.expiryDate || null,
      notes: newDocument.notes,
      clubComments: newDocument.notes || "",
    };

    const createRes = await apiClient.createComplianceDocument(createPayload);

    // STEP 4 — Update UI
    setClubData(prev => ({
      ...prev,
      complianceDocuments: [
        ...(prev?.complianceDocuments || []),   // <— FIX HERE
        createRes.data,
      ]
    }));


    // STEP 5 — Reset upload form
    setNewDocument({
      name: "",
      type: "liquor_license",
      expiryDate: "",
      notes: "",
      file: null,
    });

    setShowUploadModal(false);
    alert("Document uploaded successfully!");

  } catch (error) {
    console.error(error);
    alert("Document upload failed.");
  }
};







const removeDocument = async (documentId: string) => {
  if (!confirm("Are you sure you want to remove this document?")) return;

  try {
    await apiClient.deleteComplianceDocument(documentId);

    setClubData((prev) => ({
      ...prev,
      complianceDocuments: prev.complianceDocuments.filter(
        (doc) => doc.id !== documentId
      ),
    }));

    alert("Document deleted successfully.");
  } catch (error) {
    console.error("Delete failed", error);
    alert("Failed to delete document.");
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

        {activeTab === "compliance" && (
          <div>
            {/* Header */}
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
            <div style={{ display: "grid", gap: "20px" }}>
              {normalizedDocuments.map((document) => (
                <div
                  key={document.id}
                  style={{
                    background: "#1E1E1E",
                    borderRadius: "10px",
                    padding: "22px",
                    border: "1px solid #333",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    {/* LEFT SIDE — Document Info */}
                    <div style={{ flex: 1 }}>
                      {/* Name + Status */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "10px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color: "#FFF",
                            fontSize: "18px",
                            fontWeight: "600",
                          }}
                        >
                          {document.name}
                        </h3>

                        {/* Status Badge */}
                        <span className={`badge ${getStatusBadgeClass(document.status)}`}>
                          {document.status}
                        </span>

                        {/* Expiring Soon */}
                        {document.expiryDate &&
                          isDocumentExpiringSoon(document.expiryDate) && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#F59E0B",
                                fontWeight: "600",
                                fontSize: "12px",
                              }}
                            >
                              <AlertTriangle size={14} />
                              Expires Soon
                            </div>
                          )}
                      </div>

                      {/* Metadata Grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "10px",
                          color: "#CCC",
                          fontSize: "14px",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#FFF" }}>Type:</strong>{" "}
                          {getDocumentTypeLabel(document.type)}
                        </div>

                        <div>
                          <strong style={{ color: "#FFF" }}>Uploaded:</strong>{" "}
                          {new Date(document.uploadDate).toLocaleDateString()}
                        </div>

                        {document.expiryDate && (
                          <div>
                            <strong style={{ color: "#FFF" }}>Expires:</strong>{" "}
                            {new Date(document.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {document.notes && (
                        <div
                          style={{
                            marginTop: "12px",
                            color: "#DDD",
                            fontSize: "14px",
                          }}
                        >
                          <strong style={{ color: "#FFF" }}>Notes:</strong>{" "}
                          {document.notes}
                        </div>
                      )}

                      {/* Admin Comments */}
                      {document.adminComments && (
                        <div
                          style={{
                            marginTop: "14px",
                            padding: "12px",
                            background:
                              document.status === "rejected"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(0, 231, 190, 0.1)",
                            borderLeft: `4px solid ${
                              document.status === "rejected" ? "#EF4444" : "#00E7BE"
                            }`,
                            borderRadius: "6px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              color: document.status === "rejected" ? "#EF4444" : "#00E7BE",
                              marginBottom: "5px",
                            }}
                          >
                            Admin Comments
                          </div>

                          <div style={{ color: "#BBB", fontSize: "14px" }}>
                            {document.adminComments}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT SIDE — Buttons */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        minWidth: "140px",
                      }}
                    >
                      <button
                      type="button"
                      className="btn btn-secondary-outlined"
                      style={{ fontSize: "12px", padding: "8px 10px" }}
                      onClick={() => viewDocument(document.fileUrl)}
                    >
                      <Eye size={12} /> View
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ fontSize: "12px", padding: "8px 10px" }}
                      onClick={() => openReviewModal(document)}
                    >
                      <MessageSquare size={12} /> Review
                    </button>


                    <button
                      type="button"
                      className="btn btn-secondary-outlined"
                      style={{ fontSize: "12px", padding: "8px 10px" }}
                      onClick={() => downloadDocument(document.fileUrl, document.name)}
                    >
                      <Download size={12} /> Download
                    </button>


                      <button
                        type="button"
                        disabled={document.status === "pending"}
                        className="btn btn-secondary-outlined"
                        style={{
                          fontSize: "12px",
                          padding: "8px 10px",
                          color: "#FF4D4D",
                          borderColor: "#FF4D4D",
                        }}
                        onClick={() => removeDocument(document.id)}
                      >
                        <X size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>


            {/* Empty State */}
            {clubData?.complianceDocuments?.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  color: "#9ca3af",
                }}
              >
                <FileText size={48} style={{ margin: "0 auto 16px" }} />

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
                      file: e.target.files?.[0] ?? null,
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

      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h2 className="modal-title">Review Document</h2>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">

              {/* Review Decision */}
              <label className="form-label">Review Decision</label>
              <div style={{ display: "flex", gap: "20px", marginBottom: "16px" }}>
                <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="decision"
                    value="approved"
                    checked={reviewStatus === "approved"}
                    onChange={() => setReviewStatus("approved")}
                    style={{ accentColor: "#10b981" }}
                  />
                  <span style={{ color: "#10b981", fontWeight: 600 }}>Approve</span>
                </label>

                <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="decision"
                    value="rejected"
                    checked={reviewStatus === "rejected"}
                    onChange={() => setReviewStatus("rejected")}
                    style={{ accentColor: "#ef4444" }}
                  />
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>Reject</span>
                </label>
              </div>

              {/* Comments */}
              <label className="form-label">
                Admin Comments {reviewStatus === "rejected" && <span style={{ color: "#ef4444" }}>*</span>}
              </label>
              <textarea
                className="form-input form-textarea"
                rows={4}
                value={reviewComments}
                onChange={e => setReviewComments(e.target.value)}
                placeholder={
                  reviewStatus === "approved"
                    ? "Optional comment for approval..."
                    : "Required: Explain reason for rejection..."
                }
              />

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>
                Cancel
              </button>

              <button
                className={`btn ${reviewStatus === "approved" ? "btn-success" : "btn-danger"}`}
                onClick={submitReview}
                disabled={reviewStatus === "rejected" && !reviewComments.trim()}
              >
                {reviewStatus === "approved" ? "Approve" : "Reject"}
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