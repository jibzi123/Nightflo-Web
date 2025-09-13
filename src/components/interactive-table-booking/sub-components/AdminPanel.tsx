import React, { useState } from "react";
import { Floor, Table, PointOfInterest, ClubHours } from "../types";
import TableElementProperties from "./TableElementProperties";
import FloorManager from "./FloorManager";

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
}) => {
  const [activeTab, setActiveTab] = useState<"tables" | "floors" | "settings">(
    "tables"
  );
  const [newFloorName, setNewFloorName] = useState("");
  const [newTableData, setNewTableData] = useState({
    name: "",
    price: 500,
    capacity: 4,
    width: 60,
    height: 40,
    category: "standard" as Table["category"],
    specialFeatures: "",
  });
  const [newPoiData, setNewPoiData] = useState({
    name: "",
    type: "bar" as PointOfInterest["type"],
    width: 80,
    height: 50,
  });

  const selectedTable = selectedElement
    ? activeFloor.tables.find((t) => t.id === selectedElement)
    : null;

  const selectedPoi = selectedElement
    ? activeFloor.pointsOfInterest.find((p) => p.id === selectedElement)
    : null;

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

  const handleAddTable = () => {
    const newTable: Table = {
      id: `t${Date.now()}`,
      name: newTableData.name || `T${activeFloor.tables.length + 1}`,
      x: 100,
      y: 100,
      width: newTableData.width,
      height: newTableData.height,
      price: newTableData.price,
      capacity: newTableData.capacity,
      status: "available",
      rotation: 0,
      category: newTableData.category,
      specialFeatures: newTableData.specialFeatures,
    };

    const updatedFloor = {
      ...activeFloor,
      tables: [...activeFloor.tables, newTable],
    };

    onFloorUpdate(updatedFloor);
    setNewTableData({
      name: "",
      price: 500,
      capacity: 4,
      width: 60,
      height: 40,
      category: "standard",
      specialFeatures: "",
    });
  };

  const handleAddPoi = () => {
    const newPoi: PointOfInterest = {
      id: `poi${Date.now()}`,
      name: newPoiData.name || newPoiData.type.toUpperCase(),
      type: newPoiData.type,
      x: 200,
      y: 200,
      width: newPoiData.width,
      height: newPoiData.height,
      rotation: 0,
    };

    const updatedFloor = {
      ...activeFloor,
      pointsOfInterest: [...activeFloor.pointsOfInterest, newPoi],
    };

    onFloorUpdate(updatedFloor);
    setNewPoiData({ name: "", type: "bar", width: 80, height: 50 });
  };

  const handleDeleteSelected = () => {
    if (!selectedElement) return;

    const updatedFloor = { ...activeFloor };
    updatedFloor.tables = updatedFloor.tables.filter(
      (t) => t.id !== selectedElement
    );
    updatedFloor.pointsOfInterest = updatedFloor.pointsOfInterest.filter(
      (p) => p.id !== selectedElement
    );

    onFloorUpdate(updatedFloor);
    onElementSelect(null);
  };

  const updateSelectedTable = (updates: Partial<Table>) => {
    if (!selectedTable) return;

    const updatedFloor = {
      ...activeFloor,
      tables: activeFloor.tables.map((t) =>
        t.id === selectedElement ? { ...t, ...updates } : t
      ),
    };

    onFloorUpdate(updatedFloor);
  };

  const updateSelectedPoi = (updates: Partial<PointOfInterest>) => {
    if (!selectedPoi) return;

    const updatedFloor = {
      ...activeFloor,
      pointsOfInterest: activeFloor.pointsOfInterest.map((p) =>
        p.id === selectedElement ? { ...p, ...updates } : p
      ),
    };

    onFloorUpdate(updatedFloor);
  };

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
            selectedPoi={selectedPoi}
            updateSelectedTable={updateSelectedTable}
            updateSelectedPoi={updateSelectedPoi}
            handleDeleteSelected={handleDeleteSelected}
            newTableData={newTableData}
            setNewTableData={setNewTableData}
            handleAddTable={handleAddTable}
            newPoiData={newPoiData}
            setNewPoiData={setNewPoiData}
            handleAddPoi={handleAddPoi}
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
                    className="form-input"
                    value={clubHours.openTime}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Close Time</label>
                  <input
                    type="time"
                    className="form-input"
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
                  {activeFloor.tables.length} tables across {floors.length}{" "}
                  floors
                </div>
              </div>

              <div className="reservation-item">
                <div className="customer-name">Available Tables</div>
                <div className="reservation-details">
                  {
                    activeFloor.tables.filter((t) => t.status === "available")
                      .length
                  }{" "}
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
