import React from "react";

interface TableDetailsModalProps {
  activeFloor: {
    tables: {
      id: string;
      name: string;
      category: string;
      capacity: number;
      price: number;
      status: string;
      specialFeatures?: string;
    }[];
  };
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
  handleTableBooking: (id: string) => void;
  customerInfo: { name: string; phone: string };
}

const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
  activeFloor,
  selectedElement,
  setSelectedElement,
  getCategoryIcon,
  handleTableBooking,
  customerInfo,
}) => {
  const selectedTable = activeFloor.tables.find(
    (t) => t.id === selectedElement
  );
  if (!selectedTable) return null;

  return (
    <div className="table-details-modal">
      <div className="table-details-content">
        {/* Header */}
        <div className="table-details-header">
          <div className="table-details-title">
            <span className="table-category-icon">
              {getCategoryIcon(selectedTable.category)}
            </span>
            <span className="table-details-name">{selectedTable.name}</span>
            <span className="table-category-badge">
              {selectedTable.category.toUpperCase()}
            </span>
          </div>
          <button
            className="close-details-btn"
            onClick={() => setSelectedElement(null)}
          >
            ✕
          </button>
        </div>

        {/* Info Section */}
        <div className="table-details-info">
          <div className="detail-item">
            <span className="detail-label">👥 Capacity:</span>
            <span className="detail-value">
              {selectedTable.capacity} guests
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">💰 Price:</span>
            <span className="detail-value">
              Dh {selectedTable.price.toLocaleString()}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📊 Status:</span>
            <span className={`detail-value status-${selectedTable.status}`}>
              {selectedTable.status.charAt(0).toUpperCase() +
                selectedTable.status.slice(1)}
            </span>
          </div>

          {selectedTable.specialFeatures && (
            <div className="detail-item special-features">
              <span className="detail-label">✨ Special Features:</span>
              <p className="detail-description">
                {selectedTable.specialFeatures}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="table-details-actions">
          <button
            className="btn-primary book-table-btn"
            onClick={() => {
              if (selectedElement) {
                handleTableBooking(selectedElement);
              }
            }}
            disabled={
              !customerInfo.name ||
              !customerInfo.phone ||
              selectedTable.status !== "available"
            }
          >
            {selectedTable.status === "available"
              ? "📅 Book This Table"
              : "Table Not Available"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableDetailsModal;
