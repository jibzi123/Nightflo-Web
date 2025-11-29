import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Search, Star, Filter, Eye, MessageSquare, Pencil } from "lucide-react";
import ProfileImage from "../common/ProfileImage";
import "../../styles/components.css";
import { apiClient } from "../../services/apiClient";
import { toast } from "react-toastify";

interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  customerImage?: string;
  eventName: string;
  clubName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  status: "published" | "pending" | "hidden";
  helpful: number;
  response?: string;
  responseDate?: string;
}
interface ClubEvent {
  id?: string;
  eventName: string;
}

const ReviewsManager: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [eventFilter, setEventFilter] = useState<string | undefined>(undefined);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);

  // Fetch all club events (upcoming + past)
  useEffect(() => {
    const fetchClubEvents = async () => {
      try {
        const [upcomingRes, pastRes] = await Promise.all([
          apiClient.getUpcomingEvents(),
          apiClient.getPastEvents(),
        ]);

        const allEvents = [
          ...(upcomingRes?.payLoad || []),
          ...(pastRes?.payLoad || []),
        ].map((ev: any) => ({
          id: ev.id,
          eventName: ev.eventName,
        }));

        // Insert "All Events" option at the top
        allEvents.unshift({ id: undefined, eventName: "All Events" });
        setClubEvents(allEvents);
        setEventFilter(undefined);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
      }
    };

    fetchClubEvents();
  }, []);
  // Fetch promoters whenever statusFilter or eventFilter changes
  useEffect(() => {
    if (user?.club?.id) {
      fetchReviews();
    }
  }, [statusFilter, eventFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter === "all" ? undefined : statusFilter;
      const eventParam =
        eventFilter === undefined || eventFilter === ""
          ? undefined
          : eventFilter;

      const response = await apiClient.getReviews(
        user?.club?.id || "",
        eventParam || "",
        statusParam || ""
      );

      const reviewsData = response?.payLoad.items || [];
      console.log(reviewsData, "reviewsData");
      const mappedReviews: Review[] = reviewsData.map((p: any) => {
        const rawEmail = p.user?.email || "-";
        const getEventName = (id: string) => {
          const event = clubEvents?.find((e) => e.id === id);
          return event ? event.eventName : null;
        };
        return {
          id: p?.id,
          customerName: p.user?.fullName || "Unnamed",
          customerEmail: rawEmail,
          customerImage: p.user?.imageUrl,
          ticketsSold: p.stats?.ticketsSold || 0,
          totalEarnings: p.stats?.totalEarnings || 0,
          eventsCount: p.stats?.eventsCount || 0,
          eventName: getEventName(p?.event),
          clubName: user?.club?.id,
          status: p?.status,
          rating: p?.rating,
          comment: p?.comment,
          reviewDate: p?.createdAt,
          response: p?.response?.message,
          responseDate: p?.response?.respondedAt,
        };
      });

      setReviews(mappedReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };
  // const handleStatusChange = (
  //   reviewId: string,
  //   newStatus: "published" | "pending" | "hidden"
  // ) => {
  //   setReviews((prev) =>
  //     prev.map((review) =>
  //       review.id === reviewId ? { ...review, status: newStatus } : review
  //     )
  //   );
  // };

  const handleRespondToReview = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || "");
    setShowResponseModal(true);
  };

  const handleSaveResponse = async () => {
    try {
      // setIsLoading(true);

      const res = selectedReview?.response
        ? await apiClient.sendUpdatedResponseForReview(
            selectedReview.id,
            responseText
          )
        : await apiClient.sendResponseForReview(
            selectedReview?.id,
            responseText
          );
      setReviews((prev) =>
        prev.map((review) =>
          review.id === selectedReview?.id
            ? {
                ...review,
                response: responseText,
                responseDate: new Date().toISOString().split("T")[0],
              }
            : review
        )
      );
      toast.success(
        res.message ||
          `Resonse ${
            selectedReview.response ? "updated" : "sent"
          } successfully!`
      );
      setShowResponseModal(false);
      setSelectedReview(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${selectedReview.response ? "updated" : "sent"} response`
      );
    } finally {
      setShowResponseModal(false);
    }
  };
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.userType === "super_admin" &&
        review.clubName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRating =
      ratingFilter === "all" || review.rating.toString() === ratingFilter;
    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;

    return matchesSearch && matchesRating && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "published":
        return "badge-success";
      case "pending":
        return "badge-info"; /* Changed to info for pending */
      case "hidden":
        return "badge-danger";
      default:
        return "badge-info";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        style={{
          color:
            index < rating ? "#ffc107" : "#e9ecef" /* Changed star colors */,
          fill: index < rating ? "#fbbf24" : "none",
        }}
      />
    ));
  };

  // if (loading) {
  //   return <div className="loading-spinner"></div>;
  // }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Customer Reviews</h2>
          <p className="card-subtitle">
            {user?.userType === "super_admin"
              ? "Manage reviews across all clubs in your network"
              : "Manage customer reviews and feedback for your club"}
          </p>
        </div>

        <div
          className="search-filter-container"
          style={{ marginBottom: "20px" }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#fff",
              }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="filter-select"
              value={eventFilter || ""}
              onChange={(e) => setEventFilter(e.target.value || undefined)}
            >
              {clubEvents.length === 0 ? (
                <option value="">No Events Found</option>
              ) : (
                clubEvents.map((ev) => (
                  <option key={ev.id} value={ev.id || ""}>
                    {ev.eventName}
                  </option>
                ))
              )}
            </select>
            <select
              className="filter-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="flagged">Flagged</option>
              <option value="normal">Normal</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        {!loading ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Event</th>
                  {user?.userType === "super_admin" && <th>Club</th>}
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <ProfileImage
                          firstName={review.customerName.split(" ")[0]}
                          lastName={review.customerName.split(" ")[1] || ""}
                          imageUrl={review.customerImage}
                          size="sm"
                        />
                        <div>
                          <div style={{ fontWeight: "600", color: "#FFF" }}>
                            {review.customerName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#A5A5A5" }}>
                            {review.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{review.eventName}</td>
                    {user?.userType === "super_admin" && (
                      <td>{review.clubName}</td>
                    )}
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {renderStars(review.rating)}
                        <span
                          style={{
                            marginLeft: "4px",
                            fontSize: "12px",
                            color: "#A5A5A5",
                          }}
                        >
                          ({review.rating}/5)
                        </span>
                      </div>
                    </td>
                    <td style={{ maxWidth: "300px" }}>
                      <div style={{ fontSize: "13px", color: "#FFF" }}>
                        {review.comment.length > 100
                          ? `${review.comment.substring(0, 100)}...`
                          : review.comment}
                      </div>
                      {review.response && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "8px",
                            borderLeft: "2px solid #00E7BE",
                            background: "rgba(0, 231, 190, 0.05)",
                            borderRadius: "6px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#00E7BE",
                              fontWeight: "600",
                              marginBottom: "4px",
                            }}
                          >
                            Club Response:
                          </div>
                          <div style={{ fontSize: "12px", color: "#FFF" }}>
                            {review.response}
                          </div>
                        </div>
                      )}
                    </td>{" "}
                    {/* Keep as is */}
                    <td>
                      <div style={{ fontSize: "12px" }}>
                        <div style={{ color: "#FFF" }}>
                          {new Date(review.reviewDate).toLocaleDateString()}
                        </div>
                        {/* <div style={{ color: "#A5A5A5", fontSize: "11px" }}>
                          {review.helpful} helpful
                        </div> */}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          review.status
                        )}`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-secondary-outlined"
                          style={{
                            padding: "4px 8px",
                            fontSize: "11px",
                            background: "unset",
                            border: "unset",
                            boxShadow: "unset",
                          }}
                          onClick={() => handleRespondToReview(review)}
                        >
                          <Pencil size={14} />
                          {/* {review.response ? "Edit" : "Reply"} */}
                        </button>

                        {/*  SUPER ADMIN
                        
                        
                        <select  
                          value={review.status}
                          onChange={(e) =>
                            handleStatusChange(review.id, e.target.value as any)
                          }
                          style={{
                            fontSize: "12px",
                            borderRadius: "4px",
                            border: "1px solid rgb(75, 75, 75)",
                            background: "#111111",
                            color: "#fff",
                            padding: "5px 12px",
                          }}
                        >
                          <option value="flagged">Flagged</option>
                          <option value="removed">Removed</option>
                          <option value="normal">Normal</option>
                        </select> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="loading-spinner"></div>
        )}
        {!loading && filteredReviews.length === 0 && (
          <div className="empty-state">
            <Star
              size={48}
              style={{ color: "#9ca3af", margin: "0 auto 16px" }}
            />
            <div className="empty-state-title">No Reviews Found</div>
            <div className="empty-state-description">
              {searchTerm || ratingFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No customer reviews available yet"}
            </div>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedReview.response
                  ? "Edit Response"
                  : "Respond to Review"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowResponseModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  marginBottom: "16px",
                  padding: "16px",
                  background: "#323232",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <ProfileImage
                    firstName={selectedReview.customerName.split(" ")[0]}
                    lastName={selectedReview.customerName.split(" ")[1] || ""}
                    imageUrl={selectedReview.customerImage}
                    size="sm"
                  />
                  <div>
                    <div style={{ fontWeight: "600", color: "#fff" }}>
                      {selectedReview.customerName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#878787" }}>
                      {selectedReview.eventName} •{" "}
                      {new Date(selectedReview.reviewDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    style={{ marginLeft: "auto", display: "flex", gap: "2px" }}
                  >
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <div style={{ fontSize: "14px", color: "#878787" }}>
                  "{selectedReview.comment}"
                </div>{" "}
                {/* Keep as is */}
              </div>

              <div className="form-group">
                <label className="form-label">Your Response</label>
                <textarea
                  className="form-input form-textarea"
                  value={responseText}
                  style={{ background: "#323232" }}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a professional response to this review..."
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary-outlined"
                onClick={() => setShowResponseModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveResponse}>
                {selectedReview.response ? "Update Response" : "Post Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
