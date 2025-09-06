import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Star, Filter, Eye, MessageSquare } from 'lucide-react';
import ProfileImage from '../common/ProfileImage';
import '../../styles/components.css';

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
  status: 'published' | 'pending' | 'hidden';
  helpful: number;
  response?: string;
  responseDate?: string;
}

const ReviewsManager: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setReviews([
        {
          id: '1',
          customerName: 'Alice Smith',
          customerEmail: 'alice.smith@email.com',
          customerImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          eventName: 'Saturday Night Fever',
          clubName: 'Club Paradise',
          rating: 5,
          comment: 'Amazing night! The DJ was incredible and the VIP service was top-notch. Will definitely be back!',
          reviewDate: '2025-01-20',
          status: 'published',
          helpful: 12,
          response: 'Thank you so much for the wonderful review! We\'re thrilled you had such a great time.',
          responseDate: '2025-01-21'
        },
        {
          id: '2',
          customerName: 'Bob Johnson',
          customerEmail: 'bob.johnson@email.com',
          eventName: 'EDM Explosion',
          clubName: 'Club Paradise',
          rating: 4,
          comment: 'Great music and atmosphere. The only downside was the long wait at the bar during peak hours.',
          reviewDate: '2025-01-18',
          status: 'published',
          helpful: 8
        },
        {
          id: '3',
          customerName: 'Carol Williams',
          customerEmail: 'carol.w@email.com',
          customerImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
          eventName: 'Hip Hop Night',
          clubName: 'Club Paradise',
          rating: 2,
          comment: 'Very disappointed with the service. The staff was rude and the drinks were overpriced.',
          reviewDate: '2025-01-15',
          status: 'pending',
          helpful: 3
        },
        // Additional reviews for super admin view
        ...(user?.userType === 'super_admin' ? [
          {
            id: '4',
            customerName: 'Daniel Kim',
            customerEmail: 'daniel.k@email.com',
            customerImage: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
            eventName: 'Techno Underground',
            clubName: 'Electric Nights',
            rating: 5,
            comment: 'Best techno event in the city! The sound system was perfect and the crowd was amazing.',
            reviewDate: '2025-01-19',
            status: 'published',
            helpful: 15
          },
          {
            id: '5',
            customerName: 'Maria Garcia',
            customerEmail: 'maria.g@email.com',
            eventName: 'Latin Night',
            clubName: 'Neon Dreams',
            rating: 3,
            comment: 'Good music but the venue was too crowded. Hard to move around or get drinks.',
            reviewDate: '2025-01-17',
            status: 'published',
            helpful: 5,
            response: 'Thank you for your feedback. We\'re working on better crowd management for future events.',
            responseDate: '2025-01-18'
          }
        ] : [])
      ]);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (reviewId: string, newStatus: 'published' | 'pending' | 'hidden') => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, status: newStatus } : review
    ));
  };

  const handleRespondToReview = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || '');
    setShowResponseModal(true);
  };

  const handleSaveResponse = () => {
    if (!selectedReview) return;
    
    setReviews(prev => prev.map(review => 
      review.id === selectedReview.id 
        ? { 
            ...review, 
            response: responseText,
            responseDate: new Date().toISOString().split('T')[0]
          }
        : review
    ));
    
    setShowResponseModal(false);
    setSelectedReview(null);
    setResponseText('');
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.userType === 'super_admin' && review.clubName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    
    return matchesSearch && matchesRating && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published': return 'badge-success';
      case 'pending': return 'badge-info'; /* Changed to info for pending */
      case 'hidden': return 'badge-danger';
      default: return 'badge-info';
    }
  };
 
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        style={{
          color: index < rating ? '#ffc107' : '#e9ecef', /* Changed star colors */
          fill: index < rating ? '#fbbf24' : 'none'
        }}
      />
    ));
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Customer Reviews</h2>
          <p className="card-subtitle">
            {user?.userType === 'super_admin' 
              ? 'Manage reviews across all clubs in your network'
              : 'Manage customer reviews and feedback for your club'
            }
          </p>
        </div>

        <div className="search-filter-container">
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#64748b' 
            }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
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
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Event</th>
                {user?.userType === 'super_admin' && <th>Club</th>}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ProfileImage 
                        firstName={review.customerName.split(' ')[0]}
                        lastName={review.customerName.split(' ')[1] || ''}
                        imageUrl={review.customerImage}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {review.customerName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {review.customerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{review.eventName}</td>
                  {user?.userType === 'super_admin' && <td>{review.clubName}</td>}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(review.rating)}
                      <span style={{ marginLeft: '4px', fontSize: '12px', color: '#64748b' }}>
                        ({review.rating}/5)
                      </span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontSize: '13px', color: '#1e293b' }}>
                      {review.comment.length > 100 
                        ? `${review.comment.substring(0, 100)}...` 
                        : review.comment
                      }
                    </div>
                    {review.response && (
                      <div style={{ 
                        marginTop: '8px', 
                        padding: '8px', 
                        background: '#f8fafc', 
                        borderRadius: '6px',
                        borderLeft: '3px solid #3b82f6'
                      }}>
                        <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600', marginBottom: '4px' }}>
                          Club Response:
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {review.response}
                        </div>
                      </div>
                    )}
                  </td> {/* Keep as is */}
                  <td>
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ color: '#1e293b' }}>
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>
                        {review.helpful} helpful
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(review.status)}`}>
                      {review.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleRespondToReview(review)}
                      >
                        <MessageSquare size={10} />
                        {review.response ? 'Edit' : 'Reply'}
                      </button>
                      <select
                        value={review.status}
                        onChange={(e) => handleStatusChange(review.id, e.target.value as any)}
                        style={{
                          padding: '4px 6px',
                          fontSize: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          background: '#ffffff'
                        }}
                      >
                        <option value="published">Publish</option>
                        <option value="pending">Pending</option>
                        <option value="hidden">Hide</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReviews.length === 0 && (
          <div className="empty-state">
            <Star size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <div className="empty-state-title">No Reviews Found</div>
            <div className="empty-state-description">
              {searchTerm || ratingFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No customer reviews available yet'
              }
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
                {selectedReview.response ? 'Edit Response' : 'Respond to Review'}
              </h2>
              <button className="modal-close" onClick={() => setShowResponseModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <ProfileImage 
                    firstName={selectedReview.customerName.split(' ')[0]}
                    lastName={selectedReview.customerName.split(' ')[1] || ''}
                    imageUrl={selectedReview.customerImage}
                    size="sm"
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {selectedReview.customerName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {selectedReview.eventName} • {new Date(selectedReview.reviewDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#1e293b' }}>
                  "{selectedReview.comment}"
                </div> {/* Keep as is */}
              </div>
              
              <div className="form-group">
                <label className="form-label">Your Response</label>
                <textarea
                  className="form-input form-textarea"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a professional response to this review..."
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowResponseModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveResponse}>
                {selectedReview.response ? 'Update Response' : 'Post Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;