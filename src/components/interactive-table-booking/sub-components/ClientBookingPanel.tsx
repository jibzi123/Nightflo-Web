import React from "react";

interface ClientBookingPanelProps {
  activeFloor: {
    tables: { status: string }[];
  };
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTimeSlot: string;
  setSelectedTimeSlot: (slot: string) => void;
  bookingGuests: number;
  setBookingGuests: (guests: number) => void;
  customerInfo: { name: string; phone: string };
  setCustomerInfo: (info: { name: string; phone: string }) => void;
}

const ClientBookingPanel: React.FC<ClientBookingPanelProps> = ({
  activeFloor,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  bookingGuests,
  setBookingGuests,
  customerInfo,
  setCustomerInfo,
}) => {
  return (
    <div className="client-booking-panel">
      <div className="panel-header">
        <h2 className="panel-title">Book Your Table</h2>
        <div className="panel-stats">
          <div className="stat">
            Available:{" "}
            <span className="stat-value">
              {
                activeFloor.tables.filter((t) => t.status === "available")
                  .length
              }
            </span>
          </div>
        </div>
      </div>

      <div className="booking-form">
        <div className="form-group">
          <label className="form-label">Select Date</label>
          <input
            type="date"
            className="form-input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Time Slot</label>
          <select
            className="form-select-field"
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
          >
            <option value="22:00">10:00 PM</option>
            <option value="22:30">10:30 PM</option>
            <option value="23:00">11:00 PM</option>
            <option value="23:30">11:30 PM</option>
            <option value="00:00">12:00 AM</option>
            <option value="00:30">12:30 AM</option>
            <option value="01:00">1:00 AM</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Number of Guests</label>
          <input
            type="number"
            className="form-input-field"
            value={bookingGuests}
            onChange={(e) => setBookingGuests(parseInt(e.target.value))}
            min="1"
            max="20"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input
            type="text"
            className="form-input-field"
            value={customerInfo.name}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, name: e.target.value })
            }
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-input-field"
            value={customerInfo.phone}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, phone: e.target.value })
            }
            placeholder="Enter phone number"
          />
        </div>

        <div className="booking-instructions">
          <h3 className="section-title">How to Book</h3>
          <p>1. Select your preferred date and time</p>
          <p>2. Choose number of guests</p>
          <p>3. Click on an available table (green) on the floor plan</p>
          <p>4. Fill in your contact details</p>
          <p>5. Confirm your booking</p>
        </div>
      </div>
    </div>
  );
};

export default ClientBookingPanel;
