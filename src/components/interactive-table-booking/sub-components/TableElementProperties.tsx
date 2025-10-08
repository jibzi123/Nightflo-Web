import React, { useEffect, useState } from "react";
import { Table } from "../types";
import { validateTable } from "../../../utils/tableUtil";

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

  /** called with partial updates for the selected poi */
  updateSelectedPoi: (patch: Partial<PointOfInterest>) => void;

  /** delete handler for currently selected element */
  handleDeleteSelected: () => void;

  /** state and setters for "Add New Table" form */
  newTableData: Table;
  setNewTableData: (d: Table) => void;
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
  selectedPoi,
  updateSelectedPoi,
  handleDeleteSelected,
  newTableData,
  setNewTableData,
  handleAddTable,
  newPoiData,
  setNewPoiData,
  handleAddPoi,
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

  const handleUpdateClick = () => {
    const { isValid, errors } = validateTable(editableTable);
    setEditTableErrors(errors);
    if (isValid) handleUpdateTable();
  };

  const handleCreateClick = () => {
    const { isValid, errors } = validateTable(newTableData);
    setNewTableErrors(errors);
    if (isValid) handleAddTable();
  };
  useEffect(() => {
    setNewTableErrors({});
    setEditTableErrors({});
  }, [selectedElement, selectedTable]);
  return (
    <div>
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
                <label className="form-label">Table Type</label>
                <select
                  className="form-select-field"
                  value={editableTable?.tableType || "circle"}
                  onChange={(e) =>
                    setEditableTable((prev: []) =>
                      prev ? { ...prev, tableType: e.target.value } : prev
                    )
                  }
                >
                  <option value="circle">Circle</option>
                  <option value="box">Box</option>
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
                      prev ? { ...prev, description: [e.target.value] } : prev
                    )
                  }
                  placeholder="Describe special features, location benefits, etc."
                  rows={3}
                />
                {editTableErrors.description && (
                  <div className="error">{editTableErrors.description}</div>
                )}
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

                  <select
                    className="form-input-field"
                    value={editableTable.capacity ?? ""}
                    onChange={(e) =>
                      setEditableTable((prev: []) =>
                        prev ? { ...prev, capacity: e.target.value } : prev
                      )
                    }
                  >
                    {[2, 4, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
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
                      setEditableTable((prev: []) =>
                        prev ? { ...prev, width: Number(e.target.value) } : prev
                      )
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
                      setEditableTable((prev: []) =>
                        prev
                          ? { ...prev, height: Number(e.target.value) }
                          : prev
                      )
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

          {selectedPoi && (
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
                  <option value="main-bar">Main Bar</option>
                  <option value="mini-bar">Mini Bar</option>
                  <option value="circular-bar">Circular Bar</option>
                  <option value="dj-booth">DJ Booth</option>
                  <option value="dancing-floor">Dancing Floor</option>
                  <option value="front-desk">Front Desk</option>
                  <option value="washroom">Washroom</option>
                  <option value="main-entrance">Main Entrance</option>
                  <option value="double-sofa">Double Sofa</option>
                  <option value="single-sofa">Single Sofa</option>
                  <option value="triple-sofa">Triple Sofa</option>

                  <option value="single-door">Single Door</option>
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
          )}
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
            <select
              className="form-input-field"
              value={newTableData.capacity ?? ""}
              onChange={(e) =>
                setNewTableData({
                  ...newTableData,
                  capacity: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            >
              {[2, 4, 6, 8, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            {newTableErrors.capacity && (
              <div className="error">{newTableErrors.capacity}</div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Table Type</label>
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
              <option value="circle">Circle</option>
              <option value="box">Box</option>
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
          {newTableErrors.description && (
            <div className="error">{newTableErrors.description}</div>
          )}
        </div>

        <button className="btn-primary" onClick={handleCreateClick}>
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
              <option value="main-bar">Main Bar</option>
              <option value="mini-bar">Mini Bar</option>
              <option value="circular-bar">Circular Bar</option>
              <option value="dj-booth">DJ Booth</option>
              <option value="dancing-floor">Dancing Floor</option>
              <option value="front-desk">Front Desk</option>
              <option value="washroom">Washroom</option>
              <option value="main-entrance">Main Entrance</option>
              <option value="double-sofa">Double Sofa</option>
              <option value="single-sofa">Single Sofa</option>
              <option value="triple-sofa">Triple Sofa</option>

              <option value="single-door">Single Door</option>
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
