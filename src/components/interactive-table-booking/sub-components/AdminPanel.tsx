import React, { useEffect, useState } from "react";
import { Floor, Table, ClubHours, UserData, PointOfInterest } from "../types";
import TableElementProperties, {
  NewPoiData,
  NewTableData,
} from "./TableElementProperties";
import FloorManager from "./FloorManager";
import { useApi } from "../../../utils/custom-hooks/useApi";
import { getRandomPercent } from "../../../utils/tableUtil";

interface AdminPanelProps {
  floors: Floor[];
  activeFloor: Floor;
  onFloorUpdate: (floor: Floor) => void;
  onAddFloor: (name: string) => void;
  onDeleteFloor: (floorId: string) => void;
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  clubHours: ClubHours;
  fetchFloorsAndTables: (id: string) => void;
  activeTab: "floors" | "tables" | "settings";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"floors" | "tables" | "settings">
  >;
  handleUpdateFloor: (
    floorId: string,
    params: { name: string }
  ) => Promise<void>;
  activeFloorTableCount: number;
  newTableData: Table;
  setNewTableData: (d: Table) => void;
  editableTable: Table;
  setEditableTable: (d: Table) => void;
  newPoiData: NewPoiData;
  setNewPoiData: (d: NewPoiData) => void;
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
  fetchFloorsAndTables,
  activeTab,
  setActiveTab,
  handleUpdateFloor,
  newTableData,
  setNewTableData,
  editableTable,
  setEditableTable,
  newPoiData,
  setNewPoiData,
}) => {
  const [newFloorName, setNewFloorName] = useState("");
  const [editFloorName, setEditFloorName] = useState<{
    id: string;
    name: string;
  } | null>({ id: "", name: "" });
  const { loading, callApi } = useApi();

  const storedUser = localStorage.getItem("userData");
  const UserData: UserData | null = storedUser
    ? (JSON.parse(storedUser) as UserData)
    : null;
  const selectedTable =
    selectedElement && activeFloor?.tables
      ? activeFloor?.tables.find((t) => t.id === selectedElement)
      : null;

  const selectedPoi = selectedElement
    ? activeFloor?.pointsOfInterest.find((p) => p.id === selectedElement)
    : null;

  useEffect(() => {
    if (selectedTable) {
      setEditableTable({ ...selectedTable });
    }
  }, [selectedTable]);

  useEffect(() => {
    if (activeFloor) {
      setEditFloorName({ id: activeFloor?.id, name: activeFloor?.name });
    }
  }, [activeFloor]);

  const createTable = async () => {
    try {
      const countRes: { payLoad?: { count?: number } } | null = await callApi(
        "GET",
        `/tables/countByFloor?floorId=${activeFloor.id}`
      );

      const tableCount = (countRes?.payLoad?.count ?? 0) + 1;

      const newTable: Table = {
        tableNumber: newTableData.tableNumber,
        tableCount,
        xAxis: getRandomPercent(),
        yAxis: getRandomPercent(),
        width: newTableData.width,
        height: newTableData.height,
        price: newTableData.price,
        capacity: newTableData.capacity,
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
    } catch (err) {
      console.error("Error fetching count:", err);
    }
  };

  const handleUpdateTable = async () => {
    if (!editableTable) return;
    console.log(editableTable, "editableTable");
    const countRes: { payLoad?: { count?: number } } | null = await callApi(
      "GET",
      `/tables/countByFloor?floorId=${activeFloor.id}`
    );
    const tableCount = (countRes?.payLoad?.count ?? 0) + 1;

    const params = {
      tableId: editableTable?.id,
      tableNumber: editableTable.tableNumber,
      floorId: editableTable?.floor.id,
      price: editableTable.price,
      capacity: editableTable.capacity,
      tableCount,
      description: editableTable.description,
      status: editableTable?.status,
      xAxis: editableTable.xAxis,
      yAxis: editableTable.yAxis,
      width: editableTable.width,
      height: editableTable.height,
    };
    await callApi("POST", "/tables/update", params, {
      onSuccess: (data) => {
        if (!UserData) return;
        fetchFloorsAndTables(UserData?.club.id); // refresh
      },
      onError: (err) => console.error("Error:", err),
    });
  };
  const handleAddPoi = () => {
    const newPoi: PointOfInterest = {
      id: `poi${Date.now()}`,
      name: newPoiData.name || newPoiData.type.toUpperCase(),
      type: newPoiData.type,
      xAxis: 10,
      yAxis: 20,
      width: newPoiData.width,
      height: newPoiData.height,
      rotation: 0,
    };

    const updatedFloor = {
      ...activeFloor,
      pointsOfInterest: [...activeFloor.pointsOfInterest, newPoi],
    };
    console.log(updatedFloor, "updatedFloor");

    onFloorUpdate(updatedFloor);
    setNewPoiData({ name: "", type: "bar", width: 80, height: 50 });
  };

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
  const updateSelectedPoi = (updates: Partial<PointOfInterest>) => {
    if (!selectedPoi) return;

    const updatedFloor = {
      ...activeFloor,
      pointsOfInterest: activeFloor.pointsOfInterest.map((p) =>
        p.id === selectedElement ? { ...p, ...updates } : p
      ),
    };
    console.log(updatedFloor, "updatedFloor");
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
            updateSelectedPoi={updateSelectedPoi}
            handleDeleteSelected={handleDeleteSelected}
            newTableData={newTableData}
            setNewTableData={setNewTableData}
            handleAddTable={createTable}
            newPoiData={newPoiData}
            setNewPoiData={setNewPoiData}
            handleAddPoi={handleAddPoi}
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
