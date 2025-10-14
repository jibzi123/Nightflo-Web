import React from "react";
import { Reservation, Floor } from "./../types";

interface ReservationsPanelProps {
  reservations: Reservation[];
  activeFloor: Floor;
  onElementSelect: (id: string | null) => void;
  selectedElement: string | null;
}

const ReservationsPanel: React.FC<ReservationsPanelProps> = ({
  reservations,
  activeFloor,
  onElementSelect,
  selectedElement,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    "tables" | "pois" | "reservations"
  >("tables");

  const confirmedReservations = reservations.filter(
    (r) => r.status === "confirmed"
  );
  const pendingReservations = reservations.filter(
    (r) => r.status === "pending"
  );
  const totalRevenue = confirmedReservations.reduce(
    (sum, r) => sum + r.amount,
    0
  );

  const availableTables =
    activeFloor?.tables &&
    activeFloor.tables.filter((t) => t.status === "available");
  const reservedTables =
    activeFloor?.tables &&
    activeFloor.tables.filter((t) => t.status === "inactive");
  // const occupiedTables =
  //   activeFloor?.tables &&
  //   activeFloor.tables.filter((t) => t.status === "active");
  return (
    <div className="reservations-panel">
      <div className="panel-header">
        <h2 className="panel-title">Floor Overview</h2>
        <div className="panel-stats">
          <div className="stat">
            {activeTab === "tables" &&
              `${activeFloor?.tables && activeFloor?.tables.length} Tables`}
            {activeTab === "pois" &&
              `${
                activeFloor.tables && activeFloor?.pointsOfInterest?.length
              } POIs`}
            {activeTab === "reservations" &&
              `Revenue: Dh ${totalRevenue.toLocaleString()}`}
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "tables" ? "active" : ""}`}
          onClick={() => setActiveTab("tables")}
        >
          Tables
        </button>
        <button
          className={`admin-tab ${activeTab === "pois" ? "active" : ""}`}
          onClick={() => setActiveTab("pois")}
        >
          POIs
        </button>

        <button
          className={`admin-tab ${
            activeTab === "reservations" ? "active" : ""
          }`}
          onClick={() => setActiveTab("reservations")}
        >
          Bookings
        </button>
      </div>

      <div className="reservations-list">
        {activeTab === "tables" && availableTables && (
          <>
            {availableTables?.length > 0 && (
              <div className="reservation-section">
                <h3 className="section-title">
                  Available ({availableTables?.length})
                </h3>
                {availableTables?.map((table) => (
                  <div
                    key={table.id}
                    className={`reservation-item available ${
                      selectedElement === table._id ? "selected-item" : ""
                    }`}
                    onClick={() => onElementSelect(table._id)}
                  >
                    <div className="customer-name">{table.tableNumber}</div>
                    <div className="reservation-details">
                      {table?.tableType === "vip" && "👑 "}
                      {table?.tableType === "premium" && "⭐ "}
                      Capacity: {table?.capacity} guests •{" "}
                      <span className="amount">
                        Dh {table?.price.toLocaleString()}
                      </span>
                      <br />
                      Size: {table?.width}×{table.height}px
                      {table.description && (
                        <>
                          <br />
                          <em>{table?.description}</em>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reservedTables?.length > 0 && reservedTables && (
              <div className="reservation-section">
                <h3 className="section-title">
                  Reserved ({reservedTables.length})
                </h3>
                {reservedTables?.map((table) => (
                  <div
                    key={table.id}
                    className={`reservation-item reserved ${
                      selectedElement === table._id ? "selected-item" : ""
                    }`}
                    onClick={() => onElementSelect(table._id)}
                  >
                    <div className="customer-name">{table.tableNumber}</div>
                    <div className="reservation-details">
                      {table.tableType === "vip" && "👑 "}
                      {table.tableType === "premium" && "⭐ "}
                      Capacity: {table.capacity} guests •{" "}
                      <span className="amount">
                        Dh {table.price.toLocaleString()}
                      </span>
                      <br />
                      Size: {table.width}×{table.height}px
                      {table.description && (
                        <>
                          <br />
                          <em>{table.description}</em>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* {occupiedTables.length > 0 && occupiedTables && (
              <div className="reservation-section">
                <h3 className="section-title">
                  Occupied ({occupiedTables.length})
                </h3>
                {occupiedTables.map((table) => (
                  <div
                    key={table.id}
                    className={`reservation-item occupied ${
                      selectedElement === table.id ? "selected-item" : ""
                    }`}
                    onClick={() => onElementSelect(table.id)}
                  >
                    <div className="customer-name">{table.tableNumber}</div>
                    <div className="reservation-details">
                      {table.tableType === "vip" && "👑 "}
                      {table.tableType === "premium" && "⭐ "}
                      Capacity: {table.capacity} guests •{" "}
                      <span className="amount">
                        Dh {table.price.toLocaleString()}
                      </span>
                      <br />
                      Size: {table.width}×{table.height}px
                      {table.description && (
                        <>
                          <br />
                          <em>{table.description}</em>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </>
        )}

        {activeTab === "pois" && (
          <div className="reservation-section">
            <h3 className="section-title">
              Points of Interest ({activeFloor?.pointsOfInterest?.length})
            </h3>
            {activeFloor?.pointsOfInterest?.map((poi) => (
              <div
                key={poi.id}
                className={`reservation-item poi ${
                  selectedElement === poi.id ? "selected-item" : ""
                }`}
                onClick={() => onElementSelect(poi.id)}
              >
                <div className="customer-name">{poi.name}</div>
                <div className="reservation-details">
                  Type: {poi.type.toUpperCase()}
                  <br />
                  Size: {poi.width}×{poi.height}px
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reservations" && (
          <>
            {confirmedReservations.length > 0 && (
              <div className="reservation-section">
                <h3 className="section-title">
                  Reserved ({confirmedReservations.length})
                </h3>
                {confirmedReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={`reservation-item ${reservation.status}`}
                  >
                    <div className="customer-name">
                      {reservation.customerName}
                    </div>
                    <div className="reservation-details">
                      Table: {reservation.tableId} • {reservation.guests} guests
                      <br />
                      {reservation.time} •{" "}
                      <span className="amount">
                        Dh {reservation.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pendingReservations.length > 0 && (
              <div className="reservation-section">
                <h3 className="section-title">
                  Pending ({pendingReservations.length})
                </h3>
                {pendingReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={`reservation-item ${reservation.status}`}
                  >
                    <div className="customer-name">
                      {reservation.customerName}
                    </div>
                    <div className="reservation-details">
                      Table: {reservation.tableId} • {reservation.guests} guests
                      <br />
                      {reservation.time} •{" "}
                      <span className="amount">
                        Dh {reservation.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "tables" &&
          activeFloor?.tables &&
          activeFloor?.tables.length === 0 && (
            <div className="empty-state">
              <div className="customer-name">No tables created</div>
              <div className="reservation-details">
                Use the admin panel to add tables to this floor
              </div>
            </div>
          )}
        {activeTab === "reservations" && reservedTables && (
          <div className="empty-state">
            <div className="customer-name">No Reservations found</div>
            <div className="reservation-details">
              Reservations will appear here once customers book a table.
            </div>
          </div>
        )}

        {activeTab === "pois" &&
          activeFloor?.pointsOfInterest?.length === 0 && (
            <div className="empty-state">
              <div className="customer-name">No POIs created</div>
              <div className="reservation-details">
                Add points of interest like bars, stages, or DJ booths
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ReservationsPanel;
