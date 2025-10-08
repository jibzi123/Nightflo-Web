import React, { useEffect, useState } from "react";
import AdminPanel from "./sub-components/AdminPanel";
import FloorCanvas from "./sub-components/FloorCanvas";
import ReservationsPanel from "./sub-components/ReservationsPanel";
import "./style.css";
import {
  ClubHours,
  Floor,
  Reservation,
  UserData,
  PointOfInterest,
  DesignPatterns,
} from "./types";
import { useApi } from "../../utils/custom-hooks/useApi";

function InteractiveTableBooking() {
  const [activeFloor, setActiveFloor] = useState<Floor | any>();
  const storedUser = localStorage.getItem("userData");
  const [floors, setFloors] = useState<Floor[]>([]);

  const [activeFloorId, setActiveFloorId] = useState<string>(
    localStorage.getItem("activeFloorId") || ""
  );
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [clubHours] = useState<ClubHours>({
    openTime: "22:00",
    closeTime: "04:00",
    isOpen: true,
  });
  const [activeTab, setActiveTab] = useState<"tables" | "floors" | "settings">(
    "tables"
  );
  const [newTableData, setNewTableData] = useState({
    tableNumber: "",
    price: "",
    capacity: "",
    width: "",
    height: "",
    tableCount: 0,
    tableType: "circle",
    description: "",
  });
  const [editableTable, setEditableTable] = useState({
    tableNumber: "",
    price: "",
    capacity: "",
    width: "",
    height: "",
    tableCount: 0,
    tableType: "",
    description: "",
  });
  const [newPoiData, setNewPoiData] = useState({
    name: "",
    type: "bar" as PointOfInterest["type"],
    width: null,
    height: null,
  });
  const [designPattern, setNewDesignPattern] = useState({
    name: "",
    type: "bar" as DesignPatterns["type"],
  });
  const UserData: UserData | null = storedUser
    ? (JSON.parse(storedUser) as UserData)
    : null;
  const { loading, callApi } = useApi();

  const [reservations] = useState<Reservation[]>([
    // {
    //   id: "r1",
    //   customerName: "Adelisa Wallace",
    //   tableId: "t2",
    //   date: "2025-04-24",
    //   time: "23:00",
    //   guests: 4,
    //   amount: 500,
    //   status: "confirmed",
    // },
    // {
    //   id: "r2",
    //   customerName: "Mike Margolis",
    //   tableId: "t1",
    //   date: "2025-04-24",
    //   time: "22:30",
    //   guests: 2,
    //   amount: 250,
    //   status: "pending",
    // },
  ]);
  const updateFloor = (updatedFloor: Floor) => {
    console.log(updatedFloor, ">>>>>>>>>>>>>");
    setFloors(floors.map((f) => (f.id === updatedFloor.id ? updatedFloor : f)));
  };

  const fetchFloors = async (clubId: string) => {
    try {
      const floorsRes = await callApi("GET", `/floor/getByClub/${clubId}`); // only floors

      const floors: Floor[] = (floorsRes as { payLoad: Floor[] }).payLoad;

      setFloors(floors);

      if (floors.length > 0) {
        const activeFlor =
          floors.find((f: any) => f.id === activeFloorId) ||
          floors[floors.length - 1];

        setActiveFloorId(
          localStorage.getItem("activeFloorId") ||
            activeFlor.id ||
            floors[floors.length - 1].id
        );
        setActiveFloor(activeFlor);
        console.log("Active Floor", activeFlor);
      }
    } catch (err: any) {
      console.error("Error fetching floors", err.response?.data || err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (!UserData) {
      throw new Error("User not found in localStorage");
    }
    fetchFloors(UserData.club.id);
  }, []);

  useEffect(() => {
    const activeFloor =
      floors?.find((f: any) => f.id === activeFloorId) || floors[0];
    setActiveFloor(activeFloor);
  }, [activeFloorId, floors]);

  const addFloor = async (name: string) => {
    if (!UserData) {
      throw new Error("User not found in localStorage");
    }

    await callApi(
      "POST",
      `/floor/create`,
      {
        name,
        club: UserData.club.id,
      },
      {
        onSuccess: (data: { payLoad: { id: string } }) => {
          if (!UserData) {
            return;
          }
          localStorage.setItem("activeFloorId", data?.payLoad?.id);

          fetchFloors(UserData.club.id);
        },
        onError: (err) => console.error("Error:", err),
      }
    );
  };

  const handleUpdateFloor = async (
    floorId: string,
    params: { name: string }
  ) => {
    await callApi("PUT", `/floor/${floorId}`, params, {
      onSuccess: (data) => {
        if (!UserData) return;
        fetchFloors(UserData.club.id);
      },
      onError: (err) => console.error("Error:", err),
    });
  };
  const handleDeleteFloor = async (floorId: string) => {
    let nextActiveFloorId = activeFloorId;

    if (activeFloorId === floorId) {
      const idx = floors.findIndex((f) => f.id === floorId);

      if (idx > 0) {
        nextActiveFloorId = floors[idx - 1].id;
      } else if (floors.length > 1) {
        nextActiveFloorId = floors[1].id;
      } else {
        nextActiveFloorId = "";
      }
    }
    await callApi("DELETE", `/floor/${floorId}`, null, {
      onSuccess: async (data) => {
        if (!UserData) return;
        await fetchFloors(UserData.club.id);
        if (nextActiveFloorId) {
          localStorage.setItem("activeFloorId", nextActiveFloorId);
          setActiveFloorId(nextActiveFloorId);
        } else {
          localStorage.removeItem("activeFloorId");
          setActiveFloorId(""); // or null
        }
      },
      onError: (err) => console.error("Error:", err),
    });
  };

  const deleteFloor = (floorId: string) => {
    if (floors.length > 1) {
      handleDeleteFloor(floorId);
    }
  };
  const saveFloorSetup = async (activeFloor) => {
    await callApi("PUT", `/floor/${activeFloor.id}`, activeFloor, {
      onSuccess: (data) => {
        if (!UserData) return;
        fetchFloors(UserData.club.id);
      },
      onError: (err) => console.error("Error:", err),
    });
    console.log("Saving floor setup...", floors);
    // setHasUnsavedChanges(false);
    // Show success message or handle save logic
    alert("Floor setup saved successfully!");
  };

  return (
    <div className="app">
      <div className="app-body">
        <ReservationsPanel
          reservations={reservations}
          activeFloor={activeFloor}
          onElementSelect={setSelectedElement}
          selectedElement={selectedElement}
        />
        <div className="main-content-canvas">
          <div className="canvas-header">
            <div className="floor-tabs">
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  className={`floor-tab ${
                    activeFloorId === floor.id ? "active" : ""
                  }`}
                  onClick={() => {
                    localStorage.setItem("activeFloorId", floor.id),
                      setActiveFloorId(floor.id),
                      setActiveTab("floors");
                  }}
                >
                  {floor.name}
                </button>
              ))}
            </div>
            <div className="canvas-controls">
              <button
                className="btn-save"
                onClick={() => saveFloorSetup(activeFloor)}
              >
                💾 Save Changes
              </button>
            </div>
          </div>
          <FloorCanvas
            floor={activeFloor}
            onFloorUpdate={updateFloor}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            setActiveTab={setActiveTab}
          />
        </div>

        <AdminPanel
          floors={floors}
          activeFloor={activeFloor}
          onFloorUpdate={updateFloor}
          onAddFloor={addFloor}
          onDeleteFloor={deleteFloor}
          selectedElement={selectedElement}
          onElementSelect={setSelectedElement}
          clubHours={clubHours}
          fetchFloors={fetchFloors}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleUpdateFloor={handleUpdateFloor}
          newTableData={newTableData}
          setNewTableData={setNewTableData}
          editableTable={editableTable}
          setEditableTable={setEditableTable}
          newPoiData={newPoiData}
          setNewPoiData={setNewPoiData}
          designPattern={designPattern}
          setNewDesignPattern={setNewDesignPattern}
        />
      </div>
    </div>
  );
}

export default InteractiveTableBooking;
