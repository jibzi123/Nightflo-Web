import React, { useEffect, useState } from "react";
import { Table } from "../types";

// --- Types ---
export type TableCategory = "standard" | "vip" | "premium";
export type TableStatus = "available" | "reserved" | "occupied";

//
export interface PointOfInterest {
  id: string;
  name: string;
  type: "bar" | "stage" | "dj" | "entry" | "vip" | "restroom";
  width: number;
  height: number;
}

export interface NewTableData {
  tableNumber: string;
  price: number | string;
  capacity: number | string;
  // tableType: TableCategory;
  tableType: string;
  width: number | string;
  height: number | string;
  description?: string;
  tableCount: number;
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
  handleUpdateTable: () => void;
  editableTable: any;
  setEditableTable: any;
}

const TableElementProperties: React.FC<ElementPropertiesProps> = ({
  selectedElement,
  selectedTable,
  // selectedPoi,
  updateSelectedTable,
  // updateSelectedPoi,
  handleDeleteSelected,
  newTableData,
  setNewTableData,
  handleAddTable,
  // newPoiData,
  // setNewPoiData,
  // handleAddPoi,
  handleUpdateTable,
  editableTable,
  setEditableTable,
}) => {
  const [editTableErrors, setEditTableErrors] = useState<{
    [key: string]: string;
  }>({});
  const [newTableErrors, setNewTableErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateEditableTable = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!editableTable?.tableNumber)
      newErrors.tableNumber = "Table Name is required";
    if (!editableTable?.tableType) newErrors.tableType = "Category is required";
    if (!editableTable?.price) newErrors.price = "Required";
    if (!editableTable?.capacity) newErrors.capacity = "Required";
    if (!editableTable?.width) newErrors.width = "Required";
    if (!editableTable?.height) newErrors.height = "Required";

    setEditTableErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateClick = () => {
    if (validateEditableTable()) {
      handleUpdateTable();
    }
  };

  const validateNewTable = (): boolean => {
    const tableErrors: { [key: string]: string } = {};
    if (!newTableData.tableNumber)
      tableErrors.tableNumber = "Table Name is required";
    if (!newTableData.tableType) tableErrors.tableType = "Category is required";
    if (!newTableData.price) tableErrors.price = "Required";
    if (!newTableData.capacity) tableErrors.capacity = "Required";
    if (!newTableData.width) tableErrors.width = "Required";
    if (!newTableData.height) tableErrors.height = "Required";

    setNewTableErrors(tableErrors);
    return Object.keys(tableErrors).length === 0;
  };

  const handleAddClick = () => {
    if (validateNewTable()) {
      handleAddTable();
    }
  };
  useEffect(() => {
    setNewTableErrors({});
    setEditTableErrors({});
  }, [selectedElement, selectedTable]);
  return (
    <div>
      {/* --- Selected element properties (Table or POI) --- */}
      {selectedElement && selectedTable && (
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
                  className="form-input-field"
                  value={editableTable?.tableNumber ?? ""}
                  onChange={(e) =>
                    setEditableTable((prev: []) =>
                      prev ? { ...prev, tableNumber: e.target.value } : prev
                    )
                  }
                />
                {editTableErrors.tableNumber && (
                  <div className="error">{editTableErrors.tableNumber}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select-field"
                  value={editableTable?.tableType || "standard"}
                  onChange={(e) =>
                    setEditableTable((prev: []) =>
                      prev ? { ...prev, tableType: e.target.value } : prev
                    )
                  }
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                  <option value="premium">Premium</option>
                </select>
                {editTableErrors.tableType && (
                  <div className="error">{editTableErrors.tableType}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Special Features</label>
                <textarea
                  className="form-textarea"
                  value={editableTable?.description || ""}
                  onChange={(e) =>
                    setEditableTable((prev: []) =>
                      prev ? { ...prev, description: e.target.value } : prev
                    )
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
                    className="form-input-field"
                    value={editableTable?.price || ""}
                    onChange={(e) =>
                      setEditableTable((prev: []) =>
                        prev ? { ...prev, price: e.target.value } : prev
                      )
                    }
                  />
                  {editTableErrors.price && (
                    <div className="error">{editTableErrors.price}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    className="form-input-field"
                    value={editableTable?.capacity || ""}
                    onChange={(e) =>
                      setEditableTable((prev: []) =>
                        prev ? { ...prev, capacity: e.target.value } : prev
                      )
                    }
                  />
                  {editTableErrors.capacity && (
                    <div className="error">{editTableErrors.capacity}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Width</label>
                  <input
                    type="number"
                    className="form-input-field"
                    value={editableTable.width ?? ""}
                    onChange={(e) =>
                      setEditableTable({ width: Number(e.target.value) })
                    }
                  />
                  {editTableErrors.width && (
                    <div className="error">{editTableErrors.width}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Height</label>
                  <input
                    type="number"
                    className="form-input-field"
                    value={editableTable.height ?? ""}
                    onChange={(e) =>
                      setEditableTable({ height: Number(e.target.value) })
                    }
                  />
                  {editTableErrors.height && (
                    <div className="error">{editTableErrors.height}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select-field"
                  value={editableTable.status ?? ""}
                  onChange={(e) =>
                    setEditableTable({
                      status: e.target.value as Table["status"],
                    })
                  }
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="occupied">Occupied</option>
                </select>
                {editTableErrors.status && (
                  <div className="error">{editTableErrors.status}</div>
                )}
              </div>
            </>
          )}

          {/* {selectedPoi && (
            <>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={selectedPoi.name}
                  onChange={(e) => updateSelectedPoi({ name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select-field"
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
                    className="form-input-field"
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
                    className="form-input-field"
                    value={selectedPoi.height}
                    onChange={(e) =>
                      updateSelectedPoi({ height: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </>
          )} */}
          <div className="action-btns">
            <button className="btn-danger" onClick={handleDeleteSelected}>
              Delete
            </button>
            <button className="btn-primary" onClick={handleUpdateClick}>
              Update
            </button>
          </div>
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
              className="form-input-field"
              placeholder="Table name"
              value={newTableData.tableNumber ?? ""}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  tableNumber: e.target.value,
                })
              }
            />
            {newTableErrors.tableNumber && (
              <div className="error">{newTableErrors.tableNumber}</div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Price (Dh)</label>
            <input
              type="number"
              className="form-input-field"
              placeholder="Price"
              value={newTableData.price ?? ""}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  price: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
            {newTableErrors.price && (
              <div className="error">{newTableErrors.price}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Capacity</label>
            <input
              type="number"
              className="form-input-field"
              placeholder="Capacity"
              value={newTableData.capacity ?? ""}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  capacity: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
            {newTableErrors.capacity && (
              <div className="error">{newTableErrors.capacity}</div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select-field"
              value={newTableData.tableType ?? ""}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  tableType: e.target.value,
                })
              }
            >
              <option value="standard">Standard</option>
              <option value="vip">VIP</option>
              <option value="premium">Premium</option>
            </select>
            {newTableErrors.tableType && (
              <div className="error">{newTableErrors.tableType}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Width</label>
            <input
              type="number"
              className="form-input-field"
              placeholder="Width"
              value={newTableData.width ?? ""}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  width: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
            {newTableErrors.width && (
              <div className="error">{newTableErrors.width}</div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Height</label>
            <input
              type="number"
              className="form-input-field"
              placeholder="Height"
              value={newTableData.height ?? ""}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  height: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
            {newTableErrors.height && (
              <div className="error">{newTableErrors.height}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Special Features</label>
          <textarea
            className="form-textarea"
            placeholder="Describe special features, location benefits, etc."
            value={newTableData.description || ""}
            onChange={(e) =>
              setNewTableData({
                ...newTableData,
                description: e.target.value,
              })
            }
            rows={2}
          />
        </div>

        <button className="btn-primary" onClick={handleAddClick}>
          Add Table
        </button>
      </div>

      {/* --- Add POI --- */}
      {/* <div className="form-group">
        <label className="form-label">Add Point of Interest</label>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">POI Name</label>
            <input
              type="text"
              className="form-input-field"
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
              className="form-select-field"
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
      </div> */}
    </div>
  );
};

export default TableElementProperties;
