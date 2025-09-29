import React, { useEffect, useState } from "react";
import AdminPanel from "./sub-components/AdminPanel";
import FloorCanvas from "./sub-components/FloorCanvas";
import ReservationsPanel from "./sub-components/ReservationsPanel";
import "./style.css";
import { ClubHours, Floor, Reservation, UserData, Table } from "./types";
import { mergeFloorsAndTables } from "../../utils/tableUtil";
import { useApi } from "../../utils/custom-hooks/useApi";

function InteractiveTableBooking() {
  const [activeFloor, setActiveFloor] = useState<Floor | any>();
  const storedUser = localStorage.getItem("userData");
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<string>(
    localStorage.getItem("activeFloorId") || ""
  );
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [backgroundScale, setBackgroundScale] = useState<number>(1);
  const [backgroundPosition, setBackgroundPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
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
    setFloors(floors.map((f) => (f.id === updatedFloor.id ? updatedFloor : f)));
  };

  const fetchFloorsAndTables = async (clubId: string) => {
    try {
      const [floorsRes, tablesRes] = await Promise.all([
        callApi("GET", `/floor/getByClub/${clubId}`), // all floors of club
        callApi("GET", `/tables/club?clubId=${clubId}`), // all tables of club
      ]);

      const floors: Floor[] = (floorsRes as { payLoad: Floor[] }).payLoad;
      const tables: Table[] = (tablesRes as { payLoad: Table[] }).payLoad;

      const mergedFloors = mergeFloorsAndTables(floors, tables);
      setFloors(mergedFloors);

      if (mergedFloors.length > 0) {
        const activeFlor =
          mergedFloors.find((f: any) => f.id === activeFloorId) ||
          mergedFloors[mergedFloors.length - 1];

        setActiveFloorId(
          localStorage.getItem("activeFloorId") ||
            activeFlor.id ||
            mergedFloors[mergedFloors.length - 1].id
        );
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

          fetchFloorsAndTables(UserData.club.id);
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
        fetchFloorsAndTables(UserData.club.id);
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
      await callApi("DELETE", `/floor/${floorId}`, null, {
        onSuccess: async (data) => {
          if (!UserData) return;
          await fetchFloorsAndTables(UserData.club.id);
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
    }
  };
  const deleteFloor = (floorId: string) => {
    if (floors.length > 1) {
      handleDeleteFloor(floorId);
    }
  };

  // const removeBackground = () => {
  //   const updatedFloor = { ...activeFloor, backgroundImage: undefined };
  //   updateFloor(updatedFloor);
  //   setBackgroundScale(1);
  //   setBackgroundPosition({ x: 0, y: 0 });
  // };

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
          </div>

          <FloorCanvas
            floor={activeFloor}
            onFloorUpdate={updateFloor}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            backgroundScale={backgroundScale}
            backgroundPosition={backgroundPosition}
            setActiveTab={setActiveTab}
            fetchFloorsAndTables={fetchFloorsAndTables}
          />
        </div>

        <AdminPanel
          floors={floors}
          activeFloor={activeFloor}
          onFloorUpdate={updateFloor}
          onAddFloor={addFloor}
          n
          onDeleteFloor={deleteFloor}
          selectedElement={selectedElement}
          onElementSelect={setSelectedElement}
          clubHours={clubHours}
          backgroundScale={backgroundScale}
          setBackgroundScale={setBackgroundScale}
          backgroundPosition={backgroundPosition}
          setBackgroundPosition={setBackgroundPosition}
          // onRemoveBackground={removeBackground}
          fetchFloorsAndTables={fetchFloorsAndTables}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleUpdateFloor={handleUpdateFloor}
          newTableData={newTableData}
          setNewTableData={setNewTableData}
          editableTable={editableTable}
          setEditableTable={setEditableTable}
        />
      </div>
    </div>
  );
}

export default InteractiveTableBooking;
