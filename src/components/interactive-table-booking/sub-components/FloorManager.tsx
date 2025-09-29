import React from "react";
import { Floor } from "../types";

type Position = {
  x: number;
  y: number;
};

interface FloorManagerProps {
  activeFloor: Floor;
  floors: Floor[];
  newFloorName: string;
  setNewFloorName: (name: string) => void;
  backgroundScale: number;
  setBackgroundScale: (scale: number) => void;
  backgroundPosition: Position;
  setBackgroundPosition: (pos: Position) => void;

  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // onRemoveBackground: () => void;

  onDeleteFloor: (floorId: string) => void;
  onAddFloor: (name: string) => void;
  editFloorName: { id: string; name: string } | null;
  setEditFloorName: (d: { id: string; name: string } | null | ((prev: { id: string; name: string } | null) => { id: string; name: string } | null)) => void;
  handleUpdateFloor: (floorId: string, params: { name: string }) => void;
}

const FloorManager: React.FC<FloorManagerProps> = ({
  activeFloor,
  floors,
  newFloorName,
  setNewFloorName,
  backgroundScale,
  setBackgroundScale,
  backgroundPosition,
  setBackgroundPosition,
  handleFileUpload,
  // onRemoveBackground,
  onDeleteFloor,
  onAddFloor,
  editFloorName,
  setEditFloorName,
  handleUpdateFloor,
}) => {
  return (
    <div>
      <div className="form-group">
        {/* <label className="form-label">Current Floor: {activeFloor?.name}</label> */}

        {/* <div className="file-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            id="background-upload"
          />
          <label htmlFor="background-upload">
            📁 Upload Floor Plan
            <br />
            <span style={{ fontSize: "12px", color: "#999" }}>
              JPG, PNG up to 10MB
            </span>
          </label>
        </div> */}

        {/* {activeFloor?.backgroundImage && (
          <div className="background-controls">
            <div className="form-group">
              <label className="form-label">Background Scale</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={backgroundScale}
                onChange={(e) => setBackgroundScale(parseFloat(e.target.value))}
                className="form-range"
              />
              <span className="range-value">
                {Math.round(backgroundScale * 100)}%
              </span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Position X</label>
                <input
                  type="number"
                  className="form-input-field"
                  value={backgroundPosition.x}
                  onChange={(e) =>
                    setBackgroundPosition({
                      ...backgroundPosition,
                      x: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Position Y</label>
                <input
                  type="number"
                  className="form-input-field"
                  value={backgroundPosition.y}
                  onChange={(e) =>
                    setBackgroundPosition({
                      ...backgroundPosition,
                      y: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <button
                className="btn-secondary"
                onClick={() => {
                  setBackgroundScale(1);
                  setBackgroundPosition({ x: 0, y: 0 });
                }}
              >
                Reset Position
              </button>
              <button className="btn-danger" onClick={onRemoveBackground}>
                Remove Background
              </button>
            </div>
          </div>
        )} */}
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
                  setEditFloorName((prev: { id: string; name: string } | null) =>
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
