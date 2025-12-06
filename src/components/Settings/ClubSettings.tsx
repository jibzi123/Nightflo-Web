import React, { useEffect, useRef, useState } from 'react';
import { Upload, Camera, Clock, MapPin, Phone, Mail, Globe, FileText, Download, Eye, X, AlertTriangle, CheckCircle, MessageSquare, ImageIcon } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import SubscriptionSettings from './SubscriptionSettings';
import { useAuth } from "../../contexts/AuthContext";
import { toast } from 'react-toastify';
import { apiClient } from '../../services/apiClient';
import LocationInput from '../Events/LocationInput';


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
  const { user, setUser } = useAuth();
  const [clubData, setClubData] = useState({
    owner: { firstName: "", lastName: "" },
    // ...other fields
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [reviewComments, setReviewComments] = useState("");


  const [activeTab, setActiveTab] = useState('club');
  const MAX_GALLERY = 10;
  //const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");



      // form fields
  const [clubName, setClubName] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [clubPhone, setClubPhone] = useState("");
  const [officialPhone, setOfficialPhone] = useState("");
  const [email, setEmail] = useState("");

  // times
  const [openingTime, setOpeningTime] = useState(new Date());
  const [closingTime, setClosingTime] = useState(new Date());

  // profile image file/preview
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // gallery - array items: { url?:string, file?:File, preview:string, isNew?:boolean }
  const [gallery, setGallery] = useState<
    { url?: string; file?: File; preview: string; isNew?: boolean }[]
  >([]);

  // validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const [ownerImage, setOwnerImage] = useState<any>(null);
  const ownerFileRef = useRef<HTMLInputElement>(null);






  const [showUploadModal, setShowUploadModal] = useState(false);
  const [normalizedDocuments, setNormalizedDocuments] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    if (!user?.fullName) return;
    const parts = user.fullName.split(" ");
    setClubData(prev => ({
      ...prev,
      owner: {
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") ?? "" // keep rest as last name if multiple words
      }
    }));
  }, [user]);

  // Initialize from user.club when component mounts or user changes
  useEffect(() => {
    if (!user?.club) return;

    const c = user.club;
    setClubName(c.name || "");
    setCity(c.city || "");
    setLocation(c.location || "");
    setClubPhone(c.clubPhone || "");
    setOfficialPhone(c.officialPhone || "");
    setEmail(c.email || "");

    // times (strings like "08:00" expected)
    setOpeningTime(parseTimeStringToDate(c.openTime));
    setClosingTime(parseTimeStringToDate(c.closeTime));

    // profile preview
    setProfilePreview(c.imageUrl ? `${c.imageUrl}?${Date.now()}` : null);
    setProfileFile(null);

    // gallery: map incoming urls to items
    const initialGallery =
      Array.isArray(c.gallery) && c.gallery.length > 0
        ? c.gallery.slice(0, MAX_GALLERY).map((url: string) => ({
            url,
            preview: `${url}?${Date.now()}`,
            isNew: false,
          }))
        : [];
    // revoke any stale object URLs when component unmounts? we track created previews and revoke later
    setGallery(initialGallery);
  }, [user?.club]);

  // Revoke created objectURLs on unmount
  useEffect(() => {
    return () => {
      gallery.forEach((g) => {
        if (g.file && g.preview && g.preview.startsWith("blob:")) {
          URL.revokeObjectURL(g.preview);
        }
      });
      if (profilePreview && profilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    // ---------- Validation ----------
  function validateAll() {
    const errs: Record<string, string | null> = {};
    if (!clubName || clubName.trim().length < 2)
      errs.clubName = "Club name is required";
    else errs.clubName = null;
    if (!city || city.trim().length < 2) errs.city = "City is required";
    else errs.city = null;
    if (!location || location.trim().length < 2) errs.location = "Location is required";
    else errs.location = null;

    // Basic phone/email checks (not exhaustive)
    const phoneRegex = /^\+?[\d\s\-().]{6,}$/;
    if (clubPhone && !phoneRegex.test(clubPhone)) errs.clubPhone = "Invalid phone";
    else errs.clubPhone = null;
    if (officialPhone && !phoneRegex.test(officialPhone)) errs.officialPhone = null;
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errs.email = "Invalid email";
    else errs.email = null;

    // time diff
    if (!isAtLeastTwoHoursApart(openingTime, closingTime)) {
      errs.time = "Opening and closing times must be at least 2 hours apart";
    } else errs.time = null;

    setErrors(errs);

    const firstError = Object.values(errs).find((v) => v);
    return !firstError;
  }

  const handleOwnerImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOwnerImage({
      file,
      preview: URL.createObjectURL(file),
    });
  };


  // ---------- Profile image picker handlers ----------
  const onProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProfileFile(f);
    // create blob preview
    const url = URL.createObjectURL(f);
    setProfilePreview(url);
  };

  const handleProfileUploadClick = () => {
    profileInputRef.current?.click();
  };

  // ---------- Gallery handlers ----------
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selected = Array.from(files);
    const remaining = MAX_GALLERY - gallery.length;
    if (selected.length > remaining) {
      alert(`You can only add ${remaining} more image(s).`);
    }
    const allowed = selected.slice(0, remaining);

    const newItems = allowed.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));

    setGallery((prev) => [...prev, ...newItems]);
  };

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => {
      const removed = prev[index];
      // revoke objectURL if local
      if (removed?.isNew && removed.preview && removed.preview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(removed.preview);
        } catch (e) {}
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // ---------- Upload helpers ----------
  // convert File to Blob (no change, files are already File)
  async function uploadToSignedUrl(signedUrl: string, file: File | Blob) {
    const res = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
    if (!res.ok) throw new Error("Upload to storage failed");
    return true;
  }

  // ---------- Save handler ----------
  const handleSaveForSlubDetails = async () => {
    if (!user?.club?.id) {
      alert("No club selected");
      return;
    }

    if (!validateAll()) {
      const first = Object.values(errors).find(Boolean);
      alert(first || "Please fix validation errors");
      return;
    }

    setLoading(true);

    try {
      // 1) If profileFile exists → get signed URL and upload
      let finalProfileUrl = user.club?.imageUrl ?? null;
      if (profileFile) {
        const res = await apiClient.getSignedProfileImage();
        const signed = res?.payLoad?.signedUrl ?? res?.data?.payLoad?.signedUrl ?? null;
        const imageUrl = res?.payLoad?.imageUrl ?? res?.data?.payLoad?.imageUrl ?? null;
        if (!signed) throw new Error("Failed to get signed URL for profile image");

        await uploadToSignedUrl(signed, profileFile);
        // Per mobile, final image URL saved is imageUrl or signedUrl without query
        finalProfileUrl = imageUrl ?? signed.split("?")[0];
      }

      // 2) For gallery: upload new images (if any)
      const newLocal = gallery.filter((g) => g.isNew);
      let uploadedGalleryUrls: string[] = [];
      if (newLocal.length > 0) {
        // request signed urls
        const gs = await apiClient.getGallerySignedUrls(newLocal.length);
        const signedUrls = gs?.payLoad?.signedUrls ?? gs?.data?.payLoad?.signedUrls ?? gs?.signedUrls ?? [];
        if (!Array.isArray(signedUrls) || signedUrls.length !== newLocal.length) {
          throw new Error(`Signed URLs mismatch. expected ${newLocal.length}, got ${signedUrls.length}`);
        }

        // upload in parallel
        await Promise.all(
          newLocal.map(async (item, idx) => {
            const signedUrl = signedUrls[idx];
            if (!signedUrl) throw new Error("Missing signed url");
            await uploadToSignedUrl(signedUrl, item.file as File);
          })
        );

        uploadedGalleryUrls = signedUrls.map((u: string) => (u.split("?")[0]));
      }

      // 3) Build final gallery array: keep existing (non-new) urls + uploadedGalleryUrls
      const existingUrls = gallery.filter((g) => !g.isNew && g.url).map((g) => g.url as string);
      const finalGallery = [...existingUrls, ...uploadedGalleryUrls].slice(0, MAX_GALLERY);

      // 4) Prepare payload and call update API
      const payload = {
        clubId: user.club.id,
        name: clubName,
        city,
        location,
        clubPhone,
        officialPhone,
        email,
        gallery: finalGallery,
        openTime: formatTimeHHmm(openingTime),
        closeTime: formatTimeHHmm(closingTime),
        // if you use other fields like subscription etc - not included here
      };

      const apiResp = await apiClient.updateClub(payload);
      // mobile used apiResponse.data.payLoad structure; be defensive
      const newClub = apiResp?.payLoad ?? apiResp?.data?.payLoad ?? apiResp ?? null;

      // Update user (same pattern as mobile)
      const updatedUser = {
        ...user,
        club: newClub ?? {
          ...user.club,
          name: clubName,
          city,
          location,
          clubPhone,
          officialPhone,
          email,
          gallery: finalGallery,
          openTime: formatTimeHHmm(openingTime),
          closeTime: formatTimeHHmm(closingTime),
          imageUrl: finalProfileUrl,
        },
      };

      // setUser (context) + localStorage as you did in mobile snippet
      setUser && setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));

      if (updatedUser.token) {
        localStorage.setItem("authToken", updatedUser.token);
      }

      // Reset local file states for newly uploaded previews
      setProfileFile(null);
      if (profilePreview && profilePreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(profilePreview);
        } catch (e) {}
      }

      // Rebuild gallery list from finalGallery
      const rebuiltGallery = finalGallery.map((url) => ({ url, preview: `${url}?${Date.now()}`, isNew: false }));
      setGallery(rebuiltGallery);

      alert("Club info saved successfully");
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(err?.message || "Failed to save club info");
    } finally {
      setLoading(false);
    }
  };

 const handleSave = async () => {
  const firstName = clubData?.owner?.firstName?.trim() || "";
  const lastName = clubData?.owner?.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();

  if (!firstName || !lastName) {
    toast.error("Please enter both first and last names.");
    return;
  }

  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    toast.error("Name cannot contain numbers or special characters.");
    return;
  }

  if (!newPassword || !confirmPassword) {
    toast.error("Please enter Password and Confirm Password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match.");
    return;
  }

  if (newPassword.length < 6) {
    toast.info("Password must be at least 6 characters.");
    return;
  }

  try {
    setLoading(true);

    // --- 1) OWNER IMAGE UPLOAD (ONLY IF NEW IMAGE SELECTED) ---
    let uploadedOwnerImageUrl = user?.imageUrl;

    if (ownerImage?.file) {
      const presign = await apiClient.getSignedProfileImage();
      const signedUrl = presign?.payLoad?.signedUrl;

      if (!signedUrl) throw new Error("Could not get signed upload URL");

      await fetch(signedUrl, {
        method: "PUT",
        body: ownerImage.file,
        headers: { "Content-Type": "application/octet-stream" },
      });

      uploadedOwnerImageUrl = signedUrl.split("?")[0];
    }

    // --- 2) UPDATE PROFILE ---
    const payload: any = {
      fullName,
      password: newPassword || undefined,
      imageUrl: uploadedOwnerImageUrl,
    };

    const apiRes = await apiClient.updateProfile(payload);

    const updatedUser = {
      ...user,
      fullName: apiRes.payLoad.fullName || fullName,
      imageUrl: uploadedOwnerImageUrl,
      token: apiRes.payLoad.token || user.token,
    };

    setUser(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    if (updatedUser.token) localStorage.setItem("authToken", updatedUser.token);

    toast.success("Profile updated successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to update profile");
  } finally {
    setLoading(false);
  }
};



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
  // const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (!files) return;

  //   const selectedFiles = Array.from(files);

  //   // Check remaining capacity
  //   const remainingSlots = MAX_IMAGES - gallery.length;

  //   if (remainingSlots <= 0) {
  //     alert("You can upload a maximum of 10 images.");
  //     return;
  //   }

  //   // Slice extra images
  //   const allowedFiles = selectedFiles.slice(0, remainingSlots);

  //   // Create preview URLs
  //   const newImages = allowedFiles.map((file) => ({
  //     file,
  //     preview: URL.createObjectURL(file),
  //   }));

  //   // Update state
  //   setGallery((prev) => [...prev, ...newImages]);
  // };

  // // ===== Remove image =====
  // const removeGalleryImage = (index: number) => {
  //   setGallery((prev) => {
  //     // Revoke preview URL to avoid memory leaks
  //     URL.revokeObjectURL(prev[index].preview);
  //     return prev.filter((_, i) => i !== index);
  //   });
  // };


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



function formatTimeHHmm(date: Date) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function parseTimeStringToDate(timeString?: string) {
  if (!timeString) return new Date();
  const [hh, mm] = (timeString || "00:00").split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}

function isAtLeastTwoHoursApart(open: Date, close: Date) {
  let diff = close.getTime() - open.getTime();
  if (diff < 0) diff += 24 * 60 * 60 * 1000;
  return diff >= 2 * 60 * 60 * 1000;
}



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

  const tabs = [
    { id: "club", label: "Club Details", icon: <MapPin size={16} /> },
    { id: "owner", label: "Owner Profile", icon: <Camera size={16} /> },
    { id: "subscription", label: "Subscription", icon: <FileText size={16} /> },
    { id: "compliance", label: "Compliance", icon: <FileText size={16} /> },
  ];
  function handleSaveClick() {
    // scroll to bottom and call save
    handleSaveForSlubDetails();
  }



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

        {activeTab === "club" && user?.club && (
          <div style={styles.wrapper}>
            <div style={{ display: "grid", gap: 32 }}>
              {/* Header */}
              <div style={styles.header}>
                <h2 style={{ margin: 0 }}>Club Info</h2>
                {/* <div>
                  <button className="btn btn-primary" onClick={handleSaveClick}>
                    Save Changes
                  </button>
                </div> */}
              </div>

              {/* MAIN FORM */}
              <div style={styles.formGrid}>
                {/* Club Image + upload */}
                <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                  <div style={styles.avatarWrap}>
                    {profilePreview ? (
                      <img src={profilePreview} alt="club" style={styles.avatar} />
                    ) : user?.club?.imageUrl ? (
                      <img src={`${user.club.imageUrl}?${Date.now()}`} alt="club" style={styles.avatar} />
                    ) : (
                      <div style={styles.noAvatar}>
                        <ImageIcon size={36} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      ref={profileInputRef}
                      onChange={onProfileFileChange}
                    />
                    <button className="btn btn-secondary" onClick={() => profileInputRef.current?.click()}>
                      <Upload size={14} /> Change Club Photo
                    </button>
                  </div>
                </div>

                {/* Text fields */}
                <div style={styles.formGroup}>
                  <label className="form-label">Club Name</label>
                  <input type="text" className="form-input" value={clubName} onChange={(e) => setClubName(e.target.value)} />
                  {errors.clubName && <div style={styles.error}>{errors.clubName}</div>}
                </div>

                <div style={styles.formGroup}>
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} />
                  {errors.city && <div style={styles.error}>{errors.city}</div>}
                </div>

                {/* Club Location */}
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Location *</label>

                  <LocationInput value={location} onChange={setLocation} />
                </div>


                <div style={styles.formGroup}>
                  <label className="form-label">Opens At</label>
                  <input type="time" className="form-input" value={formatTimeHHmm(openingTime)} onChange={(e) => setOpeningTime(parseTimeStringToDate(e.target.value))} />
                </div>

                <div style={styles.formGroup}>
                  <label className="form-label">Closes At</label>
                  <input type="time" className="form-input" value={formatTimeHHmm(closingTime)} onChange={(e) => setClosingTime(parseTimeStringToDate(e.target.value))} />
                </div>

                {errors.time && <div style={{ gridColumn: "1 / -1", color: "#ef4444" }}>{errors.time}</div>}

                <div style={styles.formGroup}>
                  <label className="form-label">Club Contact Number</label>
                  <input type="text" className="form-input" value={clubPhone} onChange={(e) => setClubPhone(e.target.value)} />
                </div>

                <div style={styles.formGroup}>
                  <label className="form-label">Club Official Number</label>
                  <input type="text" className="form-input" value={officialPhone} onChange={(e) => setOfficialPhone(e.target.value)} />
                </div>

                <div style={styles.formGroup}>
                  <label className="form-label">Club Email</label>
                  <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              {/* Gallery section */}
              <div style={styles.gallerySection}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Gallery (max {MAX_GALLERY} images)</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} id="galleryInput" onChange={handleGalleryUpload} />
                    <label htmlFor="galleryInput" className="btn btn-secondary" style={{ cursor: "pointer" }}>
                      <Upload size={14} /> Add Images
                    </label>
                    <div style={{ color: "#9ca3af", alignSelf: "center" }}>{gallery.length} / {MAX_GALLERY}</div>
                  </div>
                </div>

                <div style={styles.galleryGrid}>
                  {gallery.length === 0 && (
                    <div style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>
                      No gallery images yet. Add images to display them here.
                    </div>
                  )}

                  {gallery.map((g, idx) => (
                    <div style={styles.galleryCard} key={idx}>
                      <img src={g.preview} alt={`gallery-${idx}`} style={styles.galleryImg} />
                      <div style={styles.galleryOverlay}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-secondary-outlined" onClick={() => window.open(g.url ?? g.preview, "_blank")}>
                            View
                          </button>
                          <button className="btn btn-danger" onClick={() => removeGalleryImage(idx)}>
                            <X size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn btn-cancel" onClick={() => {
                  // reset to original
                  if (user?.club) {
                    setClubName(user.club.name || "");
                    setCity(user.club.city || "");
                    setLocation(user.club.location || "");
                    setClubPhone(user.club.clubPhone || "");
                    setOfficialPhone(user.club.officialPhone || "");
                    setEmail(user.club.email || "");
                    setOpeningTime(parseTimeStringToDate(user.club.openTime));
                    setClosingTime(parseTimeStringToDate(user.club.closeTime));
                    setProfilePreview(user.club.imageUrl ? `${user.club.imageUrl}?${Date.now()}` : null);
                    const initial = (user.club.gallery || []).map((url: string) => ({ url, preview: `${url}?${Date.now()}`, isNew: false }));
                    setGallery(initial);
                  }
                }}>
                  Reset
                </button>

                <button className="btn btn-primary" onClick={handleSaveClick}>
                  Save Changes
                </button>
              </div>
            </div>

            {/* loading overlay
            {loading && (
              <div style={styles.loadingOverlay}>
                <div style={styles.loadingBox}>
                  <div style={{ marginBottom: 10 }}><CheckCircle size={36} /></div>
                  <div>Saving...</div>
                </div>
              </div>
            )} */}
          </div>
        )}

        {activeTab === "owner" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              {/* Profile Image */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "130px",
                    height: "130px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    margin: "0 auto 12px",
                    border: "2px solid #00E7BE22",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#111",
                    position: "relative",
                  }}
                >
                  <img
                    src={
                      ownerImage?.preview
                        ? ownerImage.preview // show preview if new image selected
                        : user?.imageUrl
                        ? `${user?.imageUrl}?t=${Date.now()}`
                        : "/no-profile.png"
                    }
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  {/* Hover overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.45)",
                      color: "#fff",
                      opacity: 0,
                      transition: "0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                    }}
                    className="profile-hover"
                  >
                    Change Photo
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={ownerFileRef}
                  style={{ display: "none" }}
                  onChange={handleOwnerImageChange}
                />

                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => ownerFileRef.current.click()}
                  className="btn btn-secondary-outlined"
                >
                  <Camera size={16} />
                  Update Photo
                </button>
              </div>



              {/* First Name */}
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={clubData?.owner?.firstName ?? ""}
                  onChange={(e) =>
                    setClubData(prev => ({
                      ...prev,
                      owner: { ...(prev?.owner ?? {}), firstName: e.target.value }
                    }))
                  }
                />
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={clubData?.owner?.lastName ?? ""}
                  onChange={(e) =>
                    setClubData(prev => ({
                      ...prev,
                      owner: { ...(prev?.owner ?? {}), lastName: e.target.value }
                    }))
                  }
                />
              </div>

              {/* Email (READ ONLY) */}
              <div className="form-group">
                <label className="form-label">Email (cannot change)</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ""}
                  readOnly
                />
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            {/* Save Button */}
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
        )}


        {activeTab === "subscription" && <SubscriptionSettings />}

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
                        <span
                          className={`badge ${getStatusBadgeClass(
                            document.status
                          )}`}
                        >
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
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
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
                              document.status === "rejected"
                                ? "#EF4444"
                                : "#00E7BE"
                            }`,
                            borderRadius: "6px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              color:
                                document.status === "rejected"
                                  ? "#EF4444"
                                  : "#00E7BE",
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
                        onClick={() =>
                          downloadDocument(document.fileUrl, document.name)
                        }
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
              <button
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Review Decision */}
              <label className="form-label">Review Decision</label>
              <div
                style={{ display: "flex", gap: "20px", marginBottom: "16px" }}
              >
                <label
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="approved"
                    checked={reviewStatus === "approved"}
                    onChange={() => setReviewStatus("approved")}
                    style={{ accentColor: "#10b981" }}
                  />
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    Approve
                  </span>
                </label>

                <label
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="rejected"
                    checked={reviewStatus === "rejected"}
                    onChange={() => setReviewStatus("rejected")}
                    style={{ accentColor: "#ef4444" }}
                  />
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>
                    Reject
                  </span>
                </label>
              </div>

              {/* Comments */}
              <label className="form-label">
                Admin Comments{" "}
                {reviewStatus === "rejected" && (
                  <span style={{ color: "#ef4444" }}>*</span>
                )}
              </label>
              <textarea
                className="form-input form-textarea"
                rows={4}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder={
                  reviewStatus === "approved"
                    ? "Optional comment for approval..."
                    : "Required: Explain reason for rejection..."
                }
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </button>

              <button
                className={`btn ${
                  reviewStatus === "approved" ? "btn-success" : "btn-danger"
                }`}
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
   wrapper: {
    width: "100%",
    maxWidth: 1100,
    margin: "24px auto",
    padding: 20,
    color: "#E6EDF3",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    alignItems: "start",
  },
  avatarWrap: {
    width: 120,
    height: 120,
    margin: "0 auto",
    borderRadius: 12,
    overflow: "hidden",
    background: "#f1f5f9",
    border: "2px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  noAvatar: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
  },
  gallerySection: {
    background: "#0f1724",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #222",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  galleryCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    border: "1px solid #2b2b2b",
    background: "#0b0b0b",
    minHeight: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  galleryOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)",
    opacity: 0,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 12,
    transition: "opacity 0.18s ease",
  } as React.CSSProperties,
  galleryCardHover: {
    // applied by JS - we handle hover via CSS below
  },
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "none",
    padding: "6px 8px",
    borderRadius: 6,
    cursor: "pointer",
  },
  fileInput: {
    display: "block",
    marginBottom: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
  card: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 120,
    objectFit: "cover",
  },
  deleteBtnSmall: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "none",
    padding: 6,
    borderRadius: 6,
    cursor: "pointer",
  },
  loadingOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  loadingBox: {
    background: "#0b1220",
    padding: 28,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    border: "1px solid #1f2937",
  }
};
