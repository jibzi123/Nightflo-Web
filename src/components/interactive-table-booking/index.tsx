import React, { useEffect, useState } from "react";
import AdminPanel from "./sub-components/AdminPanel";
import FloorCanvas from "./sub-components/FloorCanvas";
import ReservationsPanel from "./sub-components/ReservationsPanel";
import "./style.css";
import ClientBookingPanel from "./sub-components/ClientBookingPanel";
import TableDetailsModal from "./TableSelectedDetailsModal";
import {
  ClubHours,
  Floor,
  FloorsResponse,
  Reservation,
  UserData,
  Table,
} from "./types";
import {
  CreateFloor,
  DeleteFloor,
  GetFloorByClub,
  GetFloorById,
} from "../../services/table-booking-apis/floor";
import { AxiosResponse } from "axios";
import { GetTableByClub } from "../../services/table-booking-apis/tables";
import { mergeFloorsAndTables } from "../../utils/table-booking-util";

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
  const [activeFloor, setActiveFloor] = useState<Floor>({});
  const storedUser = localStorage.getItem("userData");

  const [floors, setFloors] = useState<Floor[]>([]);

  const [activeFloorId, setActiveFloorId] = useState<string>("");
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
  const UserData: UserData | null = storedUser
    ? (JSON.parse(storedUser) as UserData)
    : null;

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

  const updateFloor = (updatedFloor: Floor) => {
    // setFloors(floors.map((f) => (f.id === updatedFloor.id ? updatedFloor : f)));
    setHasUnsavedChanges(true);
  };

  interface Club {
    name: string;
    club: string;
  }
  const getFloorsByClub = async (clubId: string) => {
    if (!UserData) {
      throw new Error("User not found in localStorage");
    }
    try {
      const response: AxiosResponse<FloorsResponse> = await GetFloorByClub(
        clubId
      );
      if (response.data.statusCode >= 200 || response.data.statusCode < 300) {
        setFloors(response.data.payLoad);
        // const activeFlor =
        //   response.data.payLoad?.find((f: any) => f.id === activeFloorId) ||
        //   floors[0];
        setActiveFloorId(response.data.payLoad[0].id);

        // setActiveFloor(activeFlor);
        console.log("Active Floor", { activeFloor, Floor: response.data });
      }
    } catch (err: any) {
      console.error(
        "Error fetching floors:",
        err.response?.data || err.message
      );
    }
  };

  const fetchFloorsAndTables = async (clubId: string) => {
    try {
      const [floorsRes, tablesRes] = await Promise.all([
        GetFloorByClub(clubId), // all floors of club
        GetTableByClub(clubId), // all tables of club
      ]);

      const floors: Floor[] = floorsRes.data?.payLoad;
      const tables: Table[] = tablesRes.data?.payLoad;

      const mergedFloors = mergeFloorsAndTables(floors, tables);
      console.log(mergedFloors, "XY");

      setFloors(mergedFloors);

      if (mergedFloors.length > 0) {
        const activeFlor =
          mergedFloors.find((f: any) => f.id === activeFloorId) ||
          mergedFloors[0];

        setActiveFloorId(activeFlor.id);
        setActiveFloor(activeFlor);
        console.log("Active Floor", activeFlor);
      }
    } catch (err: any) {
      console.error(
        "Error fetching floors & tables:",
        err.response?.data || err.message
      );
      throw err;
    }
  };

  useEffect(() => {
    if (!UserData) {
      throw new Error("User not found in localStorage");
    }
    fetchFloorsAndTables(UserData.club.id);
  }, []);

  useEffect(() => {
    const activeFloor =
      floors?.find((f: any) => f.id === activeFloorId) || floors[0];
    setActiveFloor(activeFloor);
  }, [activeFloorId]);
  interface NewFloor {
    name: string;
    club: string;
  }
  const addFloor = async (name: string) => {
    if (!UserData) {
      throw new Error("User not found in localStorage");
    }
    const newFloor: NewFloor = {
      name,
      club: UserData.club.id,
    };
    try {
      const response = await CreateFloor(newFloor);
      if (response.status >= 200 || response.status < 300) {
        if (!UserData) {
          return;
        }
        setActiveFloorId(response?.data?.payLoad?.id);
        setHasUnsavedChanges(true);
        getFloorsByClub(UserData.club.id);
        console.log("Floor created:", response.data);
      }
    } catch (error: any) {
      console.error(
        "Error creating floor:",
        error.response?.data || error.message
      );
    }
  };

  const handleDeleteFloor = async (floorId: string) => {
    try {
      const response = await DeleteFloor(floorId);

      if (response.status >= 200 && response.status < 300) {
        console.log("Floor deleted:", response.data);
        if (!UserData) return;
        getFloorsByClub(UserData?.club.id);
        setHasUnsavedChanges(true);
      }
    } catch (error: any) {
      console.error(
        "Error deleting floor:",
        error.response?.data || error.message
      );
    }
  };
  const deleteFloor = (floorId: string) => {
    if (floors.length > 1) {
      handleDeleteFloor(floorId);
      if (activeFloorId === floorId) {
        setActiveFloorId(floors[0].id);
      }
    }
  };

  const handleTableBooking = (tableId: string) => {
    if (viewMode !== "client") return;

    const table =
      activeFloor.tables && activeFloor?.tables.find((t) => t.id === tableId);
    if (!table || table.status !== "available") return;

    // Create new reservation
    const newReservation: Reservation = {
      id: `r${Date.now()}`,
      customerName: customerInfo.name,
      tableId: table.tableNumber,
      date: selectedDate,
      time: selectedTimeSlot,
      guests: bookingGuests,
      amount: table.price,
      status: "pending",
    };

    // Update table status
    const updatedFloor = {
      ...activeFloor,
      tables:
        activeFloor.tables &&
        activeFloor?.tables.map((t) =>
          t.id === tableId ? { ...t, status: "reserved" as const } : t
        ),
    };

    updateFloor(updatedFloor);
    alert(
      `Table ${table.tableNumber} booked successfully for ${selectedDate} at ${selectedTimeSlot}!`
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
        <ReservationsPanel
          reservations={reservations}
          activeFloor={activeFloor}
          onElementSelect={setSelectedElement}
          selectedElement={selectedElement}
        />
        {/* {viewMode === "admin" ? (
             
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
            )} */}

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
          {/* {viewMode === "client" && selectedElement && (
                <TableDetailsModal
                  activeFloor={activeFloor}
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  getCategoryIcon={getCategoryIcon}
                  handleTableBooking={handleTableBooking}
                  customerInfo={customerInfo}
                />
              )} */}
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
            fetchFloorsAndTables={fetchFloorsAndTables}
          />
        )}
      </div>
    </div>
  );
}

export default InteractiveTableBooking;
