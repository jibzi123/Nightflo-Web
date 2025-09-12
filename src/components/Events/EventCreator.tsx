import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationInput from "./LocationInput";
import { apiClient } from "../../services/apiClient";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";


interface EventCreatorProps {
  mode: "create" | "edit";
  eventData?: any;
  onEventCreated?: () => void;
  onEventUpdated?: (updatedEvent: any) => void;  // ✅ updated
  onBack: () => void;
}


const EventCreator: React.FC<EventCreatorProps> = ({ 
  eventData, 
  mode = "create", 
  onEventCreated, 
  onEventUpdated,
  onBack
}) => {
  const { user, token } = useAuth();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const eventRef = useRef(null);

  useEffect(() => {
    if (mode === "edit" && eventData) {
      setEventName(eventData?.eventName || "");
      setLocation(eventData?.location || "");
      setStartTime(eventData?.startTime ? new Date(eventData?.startTime) : null);
      setEndTime(eventData?.endTime ? new Date(eventData?.endTime) : null);
      setDescription(eventData?.description || "");
      setImageFile(eventData?.imageUrl || "");
    }
  }, [mode, eventData]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
// helper: convert File -> Blob (like mobile's fetchImageFromUri)
  const fetchImageFromFile = async (file: File): Promise<Blob> => {
    return file instanceof Blob ? file : new Blob([file]);
  };

  // main uploader
  const handleImagePicked = async (
    file: File,
    signedUrlFromUpdate: string | null,
    eventId?: string
  ) => {
    try {
      setLoading(true);

      let signedUrl = signedUrlFromUpdate;

      if (!signedUrl && eventId) {
        const response = await apiClient.getImageUploadUrl(eventId);

        // ✅ handle both shapes
        if (response?.payLoad?.signedUrl) {
          signedUrl = response.payLoad.signedUrl;
        } else if (response?.signedUrl) {
          signedUrl = response.signedUrl;
        } else {
          console.error("❌ No signedUrl found in response", response);
          return;
        }
      }

      const blob = await fetchImageFromFile(file);

      await fetch(signedUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "application/octet-stream" },
      });

      console.log("✅ Image uploaded successfully");
    } catch (err) {
      console.error("❌ Image upload failed", err);
      toast.error("Something went wrong while uploading the image");
    } finally {
      setLoading(false);
    }
  };



 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();

   if (!eventName || !location || !startTime || !endTime) {
     toast.error("Please fill all required fields");
     return;
   }

   try {
     setLoading(true);

     const payload = {
       eventName,
       description,
       location,
       startTime: startTime.toISOString(),
       endTime: endTime.toISOString(),
       socialMedia: {},
       clubId: user?.club?.id || "default-club-id",
       facebookUrl: "",
       instagramUrl: "",
       youtubeUrl: "",
       tiktokUrl: "",
     };


     if (mode === "create") {
        // 🔹 Create event
        const createdEvent = await apiClient.createEvent(payload);
        onEventCreated?.();
        eventRef.current = createdEvent?.payLoad; // ✅ ensure we store payload not whole response
        if (imageFile && eventRef.current?.id) {
          await handleImagePicked(
            imageFile,
            createdEvent?.payLoad?.signedUrl || null,
            eventRef.current.id
          );
        }
        if (onEventCreated) {
          toast.success("Event created successfully!");
          setTimeout(() => {
            onEventCreated();
          }, 1000);
        }
      } else {
        // 🔹 Update event
        const updatedEvent = await apiClient.updateEvent(eventData.id, {
          eventName,
          description,
          location,
          startTime: startTime?.toISOString(),
          endTime: endTime?.toISOString(),
          imageUrl: imageFile 
            ? undefined // will be replaced after upload
            : eventData.imageUrl, // keep old one if not changed
        });
        //onEventUpdated?.();
        eventRef.current = updatedEvent?.payLoad; // ✅ ensure we store payload not whole response
      if (imageFile && eventRef.current?.id && imageFile !== eventData.imageUrl) {
        await handleImagePicked(
          imageFile,
          updatedEvent?.payLoad?.signedUrl || null,
          eventRef.current.id
        );
      }
        if (onEventUpdated) {
          toast.success("Event updated successfully!");
          setTimeout(() => {
            onEventUpdated(eventRef.current)
          }, 1000);
        }
      }
     
   } catch (err: any) {
     console.error("❌ Event creation failed", err);

   } finally {
     setLoading(false);
   }
 };


  return (
    
    <div className="card" style={{ maxWidth: 600, margin: "20px auto", padding: "20px" }}>
      <button className="btn btn-secondary mb-3" onClick={onBack}>
        ⬅ Back to Events
      </button>
      <h2>{mode === "create" ? "Create Event" : "Update Event"}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Event Name *</label>
          <input
            className="form-input"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Location *</label>
          <LocationInput value={location} onChange={setLocation} />
        </div>

        <div className="form-group">
          <label className="form-label">Start Date & Time *</label>
          <DatePicker
            selected={startTime}
            onChange={(date) => setStartTime(date)}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="yyyy-MM-dd HH:mm"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">End Date & Time *</label>
          <DatePicker
            selected={endTime}
            onChange={(date) => setEndTime(date)}
            showTimeSelect
            timeFormat="HH:mm"
            dateFormat="yyyy-MM-dd HH:mm"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Write a short description about your event..."
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              resize: "vertical",
              fontSize: "14px",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#007bff")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
        </div>


        <div className="form-group">
          <label className="form-label">Event Flyer *</label>
          <input
            type="file"
            className="form-input"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* ✅ Show preview if imageFile exists */}
          {imageFile && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={
                  typeof imageFile === "string"
                    ? `${imageFile}?t=${new Date().getTime()}` // 👈 force refresh if it's a DB URL
                    : URL.createObjectURL(imageFile)          // 👈 still works for new uploads
                }
                alt="Event Flyer Preview"
                style={{ maxWidth: "200px", borderRadius: "8px" }}
              />
            </div>
          )}

        </div>


        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading 
            ? mode === "create" 
              ? "Creating..." 
              : "Updating..."
            : mode === "create" 
              ? "Create Event" 
              : "Update Event"}
        </button>

      </form>
    </div>

  );
};

export default EventCreator;
