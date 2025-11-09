import React from "react";
import { Floor } from "../interactive-table-booking/types";

interface FloorManagerProps {
  activeFloor: Floor;
  floors: Floor[];
  newFloorName: string;
  setNewFloorName: (name: string) => void;
  onDeleteFloor: (floorId: string) => void;
  onAddFloor: (name: string) => void;
  editFloorName: { id: string; name: string } | null;
  setEditFloorName: (
    d:
      | { id: string; name: string }
      | null
      | ((
          prev: { id: string; name: string } | null
        ) => { id: string; name: string } | null)
  ) => void;
  handleUpdateFloor: (floorId: string, params: { name: string }) => void;
}

const FloorManager: React.FC<FloorManagerProps> = ({
  activeFloor,
  floors,
  newFloorName,
  setNewFloorName,
  onDeleteFloor,
  onAddFloor,
  editFloorName,
  setEditFloorName,
  handleUpdateFloor,
}) => {
  return (
    <div>
      <div className="form-group">
        <label className="form-label">Current Floor: {activeFloor?.name}</label>
      </div>

      <div className="form-group">
        <label className="form-label">Floor List</label>
        <div className="floor-list">
          {floors?.map((floor) => (
            <div key={floor.id} className="floor-item">
              <div className="customer-name">{floor.name}</div>
              <div className="reservation-details">
                {floor?.tables?.length} tables
              </div>
              {floors?.length > 1 && (
                <button
                  className="btn-danger-small"
                  onClick={() => onDeleteFloor(floor.id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {activeFloor && (
        <div className="form-group">
          <label className="form-label">Update New Floor</label>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                className="form-input-field"
                placeholder="Floor name"
                value={editFloorName?.name}
                onChange={(e) =>
                  setEditFloorName(
                    (prev: { id: string; name: string } | null) =>
                      prev ? { ...prev, name: e.target.value } : prev
                  )
                }
              />
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                if (editFloorName?.name?.trim()) {
                  handleUpdateFloor(editFloorName.id, {
                    name: editFloorName?.name?.trim(),
                  });
                  setEditFloorName(null);
                }
              }}
            >
              Update Floor
            </button>
          </div>
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Add New Floor</label>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              className="form-input-field"
              placeholder="Floor name"
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              if (newFloorName.trim()) {
                onAddFloor(newFloorName.trim());
                setNewFloorName("");
              }
            }}
          >
            Add Floor
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloorManager;
