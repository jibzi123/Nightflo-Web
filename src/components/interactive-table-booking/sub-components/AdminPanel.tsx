import React, { useEffect, useState } from "react";
import { Floor, Table, ClubHours, UserData } from "../types";
import TableElementProperties from "./TableElementProperties";
import FloorManager from "./FloorManager";
import { useApi } from "../../../utils/custom-hooks/useApi";

interface AdminPanelProps {
  floors: Floor[];
  activeFloor: Floor;
  onFloorUpdate: (floor: Floor) => void;
  onAddFloor: (name: string) => void;
  onDeleteFloor: (floorId: string) => void;
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  clubHours: ClubHours;
  backgroundScale: number;
  setBackgroundScale: (scale: number) => void;
  backgroundPosition: { x: number; y: number };
  setBackgroundPosition: (position: { x: number; y: number }) => void;
  onRemoveBackground: () => void;
  fetchFloorsAndTables: (id: string) => void;
  activeTab: "floors" | "tables" | "settings";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"floors" | "tables" | "settings">
  >;
  handleUpdateFloor: (floorId: string, params: { name: String }) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  floors,
  activeFloor,
  onFloorUpdate,
  onAddFloor,
  onDeleteFloor,
  selectedElement,
  onElementSelect,
  clubHours,
  backgroundScale,
  setBackgroundScale,
  backgroundPosition,
  setBackgroundPosition,
  onRemoveBackground,
  fetchFloorsAndTables,
  activeTab,
  setActiveTab,
  handleUpdateFloor,
}) => {
  // const [activeTab, setActiveTab] = useState<"tables" | "floors" | "settings">(
  //   "tables"
  // );
  const [newFloorName, setNewFloorName] = useState("");
  const [editFloorName, setEditFloorName] = useState("");
  const { loading, callApi } = useApi();

  const [newTableData, setNewTableData] = useState({
    tableNumber: "",
    price: "",
    capacity: "",
    width: "",
    height: "",
    tableCount: "",
    tableType: "",
    description: "",
  });
  const [editableTable, setEditableTable] = useState({
    tableNumber: "",
    price: "",
    capacity: "",
    width: "",
    height: "",
    tableCount: "",
    tableType: "",
    description: "",
  });
  // const [newPoiData, setNewPoiData] = useState({
  //   name: "",
  //   type: "bar" as PointOfInterest["type"],
  //   width: 80,
  //   height: 50,
  // });
  const storedUser = localStorage.getItem("userData");
  const UserData: UserData | null = storedUser
    ? (JSON.parse(storedUser) as UserData)
    : null;
  const selectedTable =
    selectedElement && activeFloor?.tables
      ? activeFloor?.tables.find((t) => t.id === selectedElement)
      : null;

  // const selectedPoi = selectedElement
  //   ? activeFloor.pointsOfInterest.find((p) => p.id === selectedElement)
  //   : null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedFloor = {
          ...activeFloor,
          backgroundImage: e.target?.result as string,
        };
        onFloorUpdate(updatedFloor);
        // Reset background controls when new image is uploaded
        setBackgroundScale(1);
        setBackgroundPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      console.log(selectedTable);
      setEditableTable({ ...selectedTable });
    }
  }, [selectedTable]);

  useEffect(() => {
    if (activeFloor) {
      setEditFloorName({ id: activeFloor?.id, name: activeFloor?.name });
    }
  }, [activeFloor]);
  const createTable = async () => {
    const newTable: Table = {
      tableNumber: newTableData.tableNumber,
      x: 100,
      y: 100,
      width: newTableData.width,
      height: newTableData.height,
      price: newTableData.price,
      capacity: newTableData.capacity,
      tableCount: 1,
      // status: "available",
      rotation: 0,
      tableType: newTableData.tableType,
      description: [newTableData.description],
      floorId: activeFloor.id,
      clubId: UserData?.club.id,
    };

    await callApi("POST", "/tables/create", newTable, {
      onSuccess: (data) => {
        console.log("Table Added:", data);
        setNewTableData({});

        if (!UserData) return;
        fetchFloorsAndTables(UserData?.club.id);
      },
      onError: (err) => console.error("Error:", err),
    });
  };
  const handleUpdateTable = async () => {
    if (!editableTable) return;
    const params = {
      tableId: editableTable?.id,
      tableNumber: editableTable.tableNumber,
      floorId: editableTable?.floor.id,
      price: editableTable.price,
      capacity: editableTable.capacity,
      tableCount: editableTable.tableCount,
      description: editableTable.description,
      status: editableTable?.status,
    };
    await callApi("POST", "/tables/update", params, {
      onSuccess: (data) => {
        if (!UserData) return;
        fetchFloorsAndTables(UserData?.club.id); // refresh
      },
      onError: (err) => console.error("Error:", err),
    });
  };

  // const handleAddPoi = () => {
  //   const newPoi: PointOfInterest = {
  //     id: `poi${Date.now()}`,
  //     name: newPoiData.name || newPoiData.type.toUpperCase(),
  //     type: newPoiData.type,
  //     x: 200,
  //     y: 200,
  //     width: newPoiData.width,
  //     height: newPoiData.height,
  //     rotation: 0,
  //   };

  //   const updatedFloor = {
  //     ...activeFloor,
  //     pointsOfInterest: [...activeFloor.pointsOfInterest, newPoi],
  //   };

  //   onFloorUpdate(updatedFloor);
  //   setNewPoiData({ name: "", type: "bar", width: 80, height: 50 });
  // };

  const handleDeleteSelected = async () => {
    if (!selectedElement) return;
    await callApi(
      "DELETE",
      `/tables/delete`,
      { tableId: selectedElement },
      {
        onSuccess: (data) => {
          if (!UserData) return;
          fetchFloorsAndTables(UserData?.club.id); // refresh
        },
        onError: (err) => console.error("Error:", err),
      }
    );
    onElementSelect(null);
  };

  const updateSelectedTable = async (updates: Partial<Table>) => {
    if (!selectedTable) return;
    // const updatedFloor = {
    //   ...activeFloor,
    //   tables: activeFloor.tables.map((t) =>
    //     t.id === selectedElement ? { ...t, ...updates } : t
    //   ),
    // };

    // onFloorUpdate(updatedFloor);
  };

  // const updateSelectedPoi = (updates: Partial<PointOfInterest>) => {
  //   if (!selectedPoi) return;

  //   const updatedFloor = {
  //     ...activeFloor,
  //     pointsOfInterest: activeFloor.pointsOfInterest.map((p) =>
  //       p.id === selectedElement ? { ...p, ...updates } : p
  //     ),
  //   };

  //   onFloorUpdate(updatedFloor);
  // };

  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "tables" ? "active" : ""}`}
          onClick={() => setActiveTab("tables")}
        >
          Tables
        </button>
        <button
          className={`admin-tab ${activeTab === "floors" ? "active" : ""}`}
          onClick={() => setActiveTab("floors")}
        >
          Floors
        </button>
        <button
          className={`admin-tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "tables" && (
          <TableElementProperties
            selectedElement={selectedElement}
            selectedTable={selectedTable}
            // selectedPoi={selectedPoi}
            updateSelectedTable={updateSelectedTable}
            // updateSelectedPoi={updateSelectedPoi}
            handleDeleteSelected={handleDeleteSelected}
            newTableData={newTableData}
            setNewTableData={setNewTableData}
            handleAddTable={createTable}
            // newPoiData={newPoiData}
            // setNewPoiData={setNewPoiData}
            // handleAddPoi={handleAddPoi}
            handleUpdateTable={handleUpdateTable} // new function
            editableTable={editableTable}
            setEditableTable={setEditableTable}
          />
        )}

        {activeTab === "floors" && (
          <FloorManager
            activeFloor={activeFloor}
            floors={floors}
            newFloorName={newFloorName}
            setNewFloorName={setNewFloorName}
            backgroundScale={backgroundScale}
            setBackgroundScale={setBackgroundScale}
            backgroundPosition={backgroundPosition}
            setBackgroundPosition={setBackgroundPosition}
            handleFileUpload={handleFileUpload}
            onRemoveBackground={onRemoveBackground}
            onDeleteFloor={onDeleteFloor}
            onAddFloor={onAddFloor}
            editFloorName={editFloorName}
            setEditFloorName={setEditFloorName}
            handleUpdateFloor={handleUpdateFloor}
          />
        )}

        {activeTab === "settings" && (
          <div>
            <div className="form-group">
              <label className="form-label">Club Hours</label>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Open Time</label>
                  <input
                    type="time"
                    className="form-input-field"
                    value={clubHours.openTime}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Close Time</label>
                  <input
                    type="time"
                    className="form-input-field"
                    value={clubHours.closeTime}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Club Status</label>
              <div className={`status ${clubHours.isOpen ? "open" : "closed"}`}>
                {clubHours.isOpen ? "OPEN" : "CLOSED"}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Statistics</label>
              <div className="reservation-item">
                <div className="customer-name">Total Tables</div>
                <div className="reservation-details">
                  {activeFloor.tables && activeFloor.tables.length} tables
                  across {floors.length} floors
                </div>
              </div>

              <div className="reservation-item">
                <div className="customer-name">Available Tables</div>
                <div className="reservation-details">
                  {activeFloor.tables &&
                    activeFloor.tables.filter((t) => t.status === "available")
                      .length}{" "}
                  available
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
