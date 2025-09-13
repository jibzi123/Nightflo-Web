import React from "react";

// --- Types ---
export type TableCategory = "standard" | "vip" | "premium";
export type TableStatus = "available" | "reserved" | "occupied";

export interface Table {
  id: string;
  name: string;
  category: TableCategory;
  specialFeatures?: string;
  price: number;
  capacity: number;
  width: number;
  height: number;
  status: TableStatus;
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: "bar" | "stage" | "dj" | "entry" | "vip" | "restroom";
  width: number;
  height: number;
}

export interface NewTableData {
  name: string;
  price: number | string;
  capacity: number | string;
  category: TableCategory;
  width: number | string;
  height: number | string;
  specialFeatures?: string;
}

export interface NewPoiData {
  name: string;
  type: PointOfInterest["type"];
  width: number | string;
  height: number | string;
}

interface ElementPropertiesProps {
  /** currently selected element id (table or poi) */
  selectedElement: string | null;

  /** selected table if the selectedElement refers to a table */
  selectedTable?: Table | null;

  /** selected POI if the selectedElement refers to a poi */
  selectedPoi?: PointOfInterest | null;

  /** called with partial updates for the selected table */
  updateSelectedTable: (patch: Partial<Table>) => void;

  /** called with partial updates for the selected poi */
  updateSelectedPoi: (patch: Partial<PointOfInterest>) => void;

  /** delete handler for currently selected element */
  handleDeleteSelected: () => void;

  /** state and setters for "Add New Table" form */
  newTableData: NewTableData;
  setNewTableData: (d: NewTableData) => void;
  handleAddTable: () => void;

  /** state and setters for "Add POI" form */
  newPoiData: NewPoiData;
  setNewPoiData: (d: NewPoiData) => void;
  handleAddPoi: () => void;
}

const TableElementProperties: React.FC<ElementPropertiesProps> = ({
  selectedElement,
  selectedTable,
  selectedPoi,
  updateSelectedTable,
  updateSelectedPoi,
  handleDeleteSelected,
  newTableData,
  setNewTableData,
  handleAddTable,
  newPoiData,
  setNewPoiData,
  handleAddPoi,
}) => {
  return (
    <div>
      {/* --- Selected element properties (Table or POI) --- */}
      {selectedElement && (selectedTable || selectedPoi) && (
        <div className="element-properties">
          <div className="property-title">
            {selectedTable ? "Table Properties" : "Point of Interest"}
          </div>

          {selectedTable && (
            <>
              <div className="form-group">
                <label className="form-label">Table Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedTable.name}
                  onChange={(e) =>
                    updateSelectedTable({ name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={selectedTable.category}
                  onChange={(e) =>
                    updateSelectedTable({
                      category: e.target.value as Table["category"],
                    })
                  }
                >
                  <option value="standard">🪑 Standard</option>
                  <option value="vip">👑 VIP</option>
                  <option value="premium">⭐ Premium</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Special Features</label>
                <textarea
                  className="form-textarea"
                  value={selectedTable.specialFeatures || ""}
                  onChange={(e) =>
                    updateSelectedTable({ specialFeatures: e.target.value })
                  }
                  placeholder="Describe special features, location benefits, etc."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (Dh)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={selectedTable.price}
                    onChange={(e) =>
                      updateSelectedTable({ price: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={selectedTable.capacity}
                    onChange={(e) =>
                      updateSelectedTable({ capacity: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Width</label>
                  <input
                    type="number"
                    className="form-input"
                    value={selectedTable.width}
                    onChange={(e) =>
                      updateSelectedTable({ width: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Height</label>
                  <input
                    type="number"
                    className="form-input"
                    value={selectedTable.height}
                    onChange={(e) =>
                      updateSelectedTable({ height: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={selectedTable.status}
                  onChange={(e) =>
                    updateSelectedTable({
                      status: e.target.value as Table["status"],
                    })
                  }
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
            </>
          )}

          {selectedPoi && (
            <>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedPoi.name}
                  onChange={(e) => updateSelectedPoi({ name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={selectedPoi.type}
                  onChange={(e) =>
                    updateSelectedPoi({
                      type: e.target.value as PointOfInterest["type"],
                    })
                  }
                >
                  <option value="bar">Bar</option>
                  <option value="stage">Stage</option>
                  <option value="dj">DJ Booth</option>
                  <option value="entry">Entry</option>
                  <option value="vip">VIP Area</option>
                  <option value="restroom">Restroom</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Width</label>
                  <input
                    type="number"
                    className="form-input"
                    value={selectedPoi.width}
                    onChange={(e) =>
                      updateSelectedPoi({ width: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Height</label>
                  <input
                    type="number"
                    className="form-input"
                    value={selectedPoi.height}
                    onChange={(e) =>
                      updateSelectedPoi({ height: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </>
          )}

          <button className="btn-danger" onClick={handleDeleteSelected}>
            Delete Selected
          </button>
        </div>
      )}

      {/* --- Add New Table --- */}
      <div className="form-group">
        <label className="form-label">Add New Table</label>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Table Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Table name"
              value={newTableData.name}
              onChange={(e) =>
                setNewTableData({ ...newTableData, name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price (Dh)</label>
            <input
              type="number"
              className="form-input"
              placeholder="Price"
              value={newTableData.price}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  price: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Capacity</label>
            <input
              type="number"
              className="form-input"
              placeholder="Capacity"
              value={newTableData.capacity}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  capacity: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={newTableData.category}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  category: e.target.value as Table["category"],
                })
              }
            >
              <option value="standard">🪑 Standard</option>
              <option value="vip">👑 VIP</option>
              <option value="premium">⭐ Premium</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Width</label>
            <input
              type="number"
              className="form-input"
              placeholder="Width"
              value={newTableData.width}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  width: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Height</label>
            <input
              type="number"
              className="form-input"
              placeholder="Height"
              value={newTableData.height}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  height: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Special Features</label>
          <textarea
            className="form-textarea"
            placeholder="Describe special features, location benefits, etc."
            value={newTableData.specialFeatures || ""}
            onChange={(e) =>
              setNewTableData({
                ...newTableData,
                specialFeatures: e.target.value,
              })
            }
            rows={2}
          />
        </div>

        <button className="btn-primary" onClick={handleAddTable}>
          Add Table
        </button>
      </div>

      {/* --- Add POI --- */}
      <div className="form-group">
        <label className="form-label">Add Point of Interest</label>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">POI Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="POI name"
              value={newPoiData.name}
              onChange={(e) =>
                setNewPoiData({ ...newPoiData, name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={newPoiData.type}
              onChange={(e) =>
                setNewPoiData({
                  ...newPoiData,
                  type: e.target.value as PointOfInterest["type"],
                })
              }
            >
              <option value="bar">Bar</option>
              <option value="stage">Stage</option>
              <option value="dj">DJ Booth</option>
              <option value="entry">Entry</option>
              <option value="vip">VIP Area</option>
              <option value="restroom">Restroom</option>
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleAddPoi}>
          Add POI
        </button>
      </div>
    </div>
  );
};

export default TableElementProperties;
