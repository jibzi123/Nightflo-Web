import React, { useEffect, useState } from "react";
import AdminPanel from "./sub-components/AdminPanel";
import FloorCanvas from "./sub-components/FloorCanvas";
import ReservationsPanel from "./sub-components/ReservationsPanel";
import "./style.css";
import { ClubHours, Floor, Reservation } from "./types";
import ClientBookingPanel from "./sub-components/ClientBookingPanel";
import TableDetailsModal from "./TableSelectedDetailsModal";

function InteractiveTableBooking() {
  const [viewMode, setViewMode] = useState<"admin" | "client">("admin");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("22:00");
  const [bookingGuests, setBookingGuests] = useState<number>(2);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vip":
        return "👑";
      case "premium":
        return "⭐";
      default:
        return "🪑";
    }
  };
  const [floors, setFloors] = useState<Floor[]>([
    {
      id: "1",
      name: "Main Floor",
      tables: [
        {
          id: "t1",
          name: "S1",
          x: 450,
          y: 250,
          width: 60,
          height: 40,
          price: 500,
          capacity: 4,
          status: "available",
          rotation: 0,
          category: "standard",
          specialFeatures: "Near dance floor, great view of DJ booth",
        },
        {
          id: "t2",
          name: "S2",
          x: 520,
          y: 250,
          width: 60,
          height: 40,
          price: 500,
          capacity: 4,
          status: "reserved",
          rotation: 0,
          category: "standard",
          specialFeatures: "Corner table with privacy",
        },
        {
          id: "t3",
          name: "BW1",
          x: 400,
          y: 320,
          width: 80,
          height: 50,
          price: 800,
          capacity: 6,
          status: "available",
          rotation: 0,
          category: "vip",
          specialFeatures:
            "VIP service, bottle service included, premium location",
        },
      ],
      pointsOfInterest: [
        {
          id: "poi1",
          name: "DJ BOOTH",
          type: "dj",
          x: 420,
          y: 310,
          width: 100,
          height: 60,
          rotation: 0,
        },
        {
          id: "poi2",
          name: "STAGE",
          type: "stage",
          x: 500,
          y: 180,
          width: 120,
          height: 40,
          rotation: 0,
        },
      ],
    },
  ]);

  const [activeFloorId, setActiveFloorId] = useState<string>("1");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [backgroundScale, setBackgroundScale] = useState<number>(1);
  const [backgroundPosition, setBackgroundPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [clubHours] = useState<ClubHours>({
    openTime: "22:00",
    closeTime: "04:00",
    isOpen: true,
  });

  const [reservations] = useState<Reservation[]>([
    {
      id: "r1",
      customerName: "Adelisa Wallace",
      tableId: "t2",
      date: "2025-04-24",
      time: "23:00",
      guests: 4,
      amount: 500,
      status: "confirmed",
    },
    {
      id: "r2",
      customerName: "Mike Margolis",
      tableId: "t1",
      date: "2025-04-24",
      time: "22:30",
      guests: 2,
      amount: 250,
      status: "pending",
    },
  ]);

  const activeFloor = floors.find((f) => f.id === activeFloorId) || floors[0];

  const updateFloor = (updatedFloor: Floor) => {
    setFloors(floors.map((f) => (f.id === updatedFloor.id ? updatedFloor : f)));
    setHasUnsavedChanges(true);
  };

  const addFloor = (name: string) => {
    const newFloor: Floor = {
      id: Date.now().toString(),
      name,
      tables: [],
      pointsOfInterest: [],
    };
    setFloors([...floors, newFloor]);
    setActiveFloorId(newFloor.id);
    setHasUnsavedChanges(true);
  };

  const deleteFloor = (floorId: string) => {
    if (floors.length > 1) {
      const updatedFloors = floors.filter((f) => f.id !== floorId);
      setFloors(updatedFloors);
      if (activeFloorId === floorId) {
        setActiveFloorId(updatedFloors[0].id);
      }
      setHasUnsavedChanges(true);
    }
  };

  const handleTableBooking = (tableId: string) => {
    if (viewMode !== "client") return;

    const table = activeFloor?.tables.find((t) => t.id === tableId);
    if (!table || table.status !== "available") return;

    // Create new reservation
    const newReservation: Reservation = {
      id: `r${Date.now()}`,
      customerName: customerInfo.name,
      tableId: table.name,
      date: selectedDate,
      time: selectedTimeSlot,
      guests: bookingGuests,
      amount: table.price,
      status: "pending",
    };

    // Update table status
    const updatedFloor = {
      ...activeFloor,
      tables: activeFloor.tables.map((t) =>
        t.id === tableId ? { ...t, status: "reserved" as const } : t
      ),
    };

    updateFloor(updatedFloor);
    alert(
      `Table ${table.name} booked successfully for ${selectedDate} at ${selectedTimeSlot}!`
    );
    setSelectedElement(null);
  };
  const removeBackground = () => {
    const updatedFloor = { ...activeFloor, backgroundImage: undefined };
    updateFloor(updatedFloor);
    setBackgroundScale(1);
    setBackgroundPosition({ x: 0, y: 0 });
  };

  const saveFloorSetup = () => {
    // Here you would typically save to a backend
    console.log("Saving floor setup...", floors);
    setHasUnsavedChanges(false);
    // Show success message or handle save logic
    alert("Floor setup saved successfully!");
  };

  return (
    <div className="app">
      {/* <div className="app-header">
        Fri, Apr 24th 2025
<div className="logo">
          <span className="logo-icon">🌙</span>
          <span className="logo-text">NightFlo Pro</span>
        </div>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'admin' ? 'active' : ''}`}
            onClick={() => setViewMode('admin')}
          >
            👨‍💼 Admin
          </button>
          <button
            className={`view-btn ${viewMode === 'client' ? 'active' : ''}`}
            onClick={() => setViewMode('client')}
          >
            👤 Client
          </button>
        </div>
        <div className="club-info">
          <span className="date">Fri, Apr 24th 2025</span>
          <div className="hours">
            <span className={`status ${clubHours.isOpen ? 'open' : 'closed'}`}>
              {clubHours.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
            <span className="time">{clubHours.openTime} - {clubHours.closeTime}</span>
          </div>
        </div>
      </div> */}

      <div className="app-body">
        {viewMode === "admin" ? (
          <ReservationsPanel
            reservations={reservations}
            activeFloor={activeFloor}
            onElementSelect={setSelectedElement}
            selectedElement={selectedElement}
          />
        ) : (
          <ClientBookingPanel
            activeFloor={activeFloor}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
            bookingGuests={bookingGuests}
            setBookingGuests={setBookingGuests}
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
          />
        )}

        <div className="main-content-canvas">
          <div className="canvas-header">
            <div className="floor-tabs">
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  className={`floor-tab ${
                    activeFloorId === floor.id ? "active" : ""
                  }`}
                  onClick={() => setActiveFloorId(floor.id)}
                >
                  {floor.name}
                </button>
              ))}
            </div>
            <div className="canvas-controls">
              {hasUnsavedChanges && (
                <button className="btn-save" onClick={saveFloorSetup}>
                  💾 Save Changes
                </button>
              )}
              {viewMode === "admin" && (
                <>
                  <button className="btn-secondary">Show Names</button>
                  <button className="btn-primary">+ Add Table</button>
                </>
              )}
              {viewMode === "client" && selectedElement && (
                <button
                  className="btn-primary"
                  onClick={() => handleTableBooking(selectedElement)}
                  disabled={!customerInfo.name || !customerInfo.phone}
                >
                  📅 Book This Table
                </button>
              )}
            </div>
          </div>

          <FloorCanvas
            floor={activeFloor}
            onFloorUpdate={updateFloor}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            backgroundScale={backgroundScale}
            backgroundPosition={backgroundPosition}
            viewMode={viewMode}
            onTableBooking={handleTableBooking}
          />

          {/* Client Table Details Modal */}
          {viewMode === "client" && selectedElement && (
            <TableDetailsModal
              activeFloor={activeFloor}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              getCategoryIcon={getCategoryIcon}
              handleTableBooking={handleTableBooking}
              customerInfo={customerInfo}
            />
          )}
        </div>

        {viewMode === "admin" && (
          <AdminPanel
            floors={floors}
            activeFloor={activeFloor}
            onFloorUpdate={updateFloor}
            onAddFloor={addFloor}
            onDeleteFloor={deleteFloor}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            clubHours={clubHours}
            backgroundScale={backgroundScale}
            setBackgroundScale={setBackgroundScale}
            backgroundPosition={backgroundPosition}
            setBackgroundPosition={setBackgroundPosition}
            onRemoveBackground={removeBackground}
          />
        )}
      </div>
    </div>
  );
}

export default InteractiveTableBooking;
