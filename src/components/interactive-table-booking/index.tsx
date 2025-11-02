import React, { useEffect, useState } from "react";
import AdminPanel from "./../AdminPanel/AdminPanel";
import FloorCanvas from "./../FloorCanvas/FloorCanvas";
import ReservationsPanel from "../ReservationPanel/ReservationsPanel";
import "./style.css";
import {
  Floor,
  Reservation,
  UserData,
  PointOfInterest,
  Wall,
  UnsavedChanges,
} from "./types";
import { useApi } from "../../utils/custom-hooks/useApi";
import { toast } from "react-toastify";

function InteractiveTableBooking() {
  const [activeFloorId, setActiveFloorId] = useState<string>(
    localStorage.getItem("activeFloorId") || ""
  );
  const storedUser = localStorage.getItem("userData");

  const [floors, setFloors] = useState<Floor[]>([]); // Server state - floors from API

  const [unsavedChangesByFloor, setUnsavedChangesByFloor] = useState<
    Record<string, UnsavedChanges>
  >({}); // Local state - unsaved changes per floor

  const [hasModifications, setHasModifications] = useState<
    Record<string, boolean>
  >({}); // Track if there are any modifications (new items or position/size changes)

  const [isAddingPoi, setIsAddingPoi] = useState(false); // Guard to prevent duplicate additions

  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"tables" | "floors" | "settings">(
    "tables"
  );
  const [newTableData, setNewTableData] = useState({
    tableNumber: "",
    price: "",
    capacity: "",
    width: 100,
    height: 100,
    tableCount: 0,
    tableType: "circle",
    description: "",
    rotation: 90,
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
    rotation: 90,
  });
  const [newPoiData, setNewPoiData] = useState({
    name: "",
    type: "main-bar" as PointOfInterest["type"],
    width: 80,
    height: 70,
  });

  const UserData: UserData | null = storedUser
    ? (JSON.parse(storedUser) as UserData)
    : null;
  const { callApi } = useApi();

  const [reservations] = useState<Reservation[]>([]);

  // Get active floor with merged unsaved changes
  const getActiveFloorData = (): Floor | undefined => {
    const serverFloor = floors.find((f) => f.id === activeFloorId);
    if (!serverFloor) return undefined;

    const unsaved = unsavedChangesByFloor[activeFloorId] || {
      pointsOfInterest: [],
      boundaryWalls: [],
    };

    const mergedFloor = {
      ...serverFloor,
      pointsOfInterest: [
        ...(serverFloor.pointsOfInterest || []),
        ...unsaved.pointsOfInterest,
      ],
      boundaryWalls: [
        ...(serverFloor.boundaryWalls || []),
        ...unsaved.boundaryWalls,
      ],
    };

    // Debug log
    console.log("Active Floor Data:", {
      floorId: activeFloorId,
      serverPOIs: serverFloor.pointsOfInterest?.length || 0,
      unsavedPOIs: unsaved.pointsOfInterest.length,
      totalPOIs: mergedFloor.pointsOfInterest.length,
      serverWalls: serverFloor.boundaryWalls?.length || 0,
      unsavedWalls: unsaved.boundaryWalls.length,
      totalWalls: mergedFloor.boundaryWalls.length,
    });

    return mergedFloor;
  };

  const activeFloor = getActiveFloorData();

  // Check if a floor has unsaved changes
  const hasUnsavedChanges = (floorId: string): boolean => {
    const unsaved = unsavedChangesByFloor[floorId];
    const hasNewItems = Boolean(
      unsaved &&
        (unsaved.pointsOfInterest.length > 0 ||
          unsaved.boundaryWalls.length > 0)
    );

    return hasNewItems || hasModifications[floorId] || false;
  };

  // Fetch floors from server
  const fetchFloors = async (clubId: string) => {
    try {
      const floorsRes = await callApi("GET", `/floor/getByClub/${clubId}`);
      const fetchedFloors: Floor[] = (floorsRes as { payLoad: Floor[] })
        .payLoad;

      setFloors(fetchedFloors);

      if (fetchedFloors.length > 0) {
        const storedActiveFloorId = localStorage.getItem("activeFloorId");
        const activeFlor =
          fetchedFloors.find((f: any) => f.id === storedActiveFloorId) ||
          fetchedFloors[fetchedFloors.length - 1];

        setActiveFloorId(activeFlor.id);
        localStorage.setItem("activeFloorId", activeFlor.id);
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

  // Update floor - only for server-synced changes (tables, floor properties)
  // IMPORTANT: Do NOT use this for POIs or boundary walls - use unsaved state instead
  const updateFloor = (updatedFloor: Floor) => {
    setFloors((prevFloors) =>
      prevFloors.map((f) => {
        if (f.id === updatedFloor.id) {
          // Only update server-managed properties, preserve POIs/walls from server
          return {
            ...updatedFloor,
            pointsOfInterest: f.pointsOfInterest,
            boundaryWalls: f.boundaryWalls,
          };
        }
        return f;
      })
    );
  };

  // Handler for updating element positions when dragging
  const handleElementPositionUpdate = (
    elementId: string,
    xAxis: number,
    yAxis: number
  ) => {
    console.log(" Position update:", elementId, { xAxis, yAxis });

    if (!activeFloorId) return;

    setHasModifications((prev) => ({ ...prev, [activeFloorId]: true }));

    const serverFloor = floors.find((f) => f.id === activeFloorId);
    if (!serverFloor) return;

    // Check if it's a table
    const isTable = serverFloor.tables?.some(
      (t) => t._id === elementId || t.id === elementId
    );
    if (isTable) {
      // Update table position in server state
      setFloors((prev) =>
        prev.map((floor) => {
          if (floor.id === activeFloorId) {
            return {
              ...floor,
              tables: floor.tables?.map((t) =>
                t._id === elementId || t.id === elementId
                  ? { ...t, xAxis, yAxis }
                  : t
              ),
            };
          }
          return floor;
        })
      );
      return;
    }

    // Check if it's an unsaved POI
    const unsaved = unsavedChangesByFloor[activeFloorId];
    const isUnsavedPoi = unsaved?.pointsOfInterest.some(
      (p) => p.id === elementId
    );

    if (isUnsavedPoi) {
      updateSelectedPoi({ xAxis, yAxis });
      return;
    }

    // Check if it's a server POI
    const isServerPoi = serverFloor.pointsOfInterest?.some(
      (p) => p.id === elementId
    );
    if (isServerPoi) {
      setFloors((prev) =>
        prev.map((floor) => {
          if (floor.id === activeFloorId) {
            return {
              ...floor,
              pointsOfInterest: floor.pointsOfInterest?.map((p) =>
                p.id === elementId ? { ...p, xAxis, yAxis } : p
              ),
            };
          }
          return floor;
        })
      );
      return;
    }
  };

  // Add POI - store in unsaved changes for active floor
  const handleAddPoi = (newPOI: any) => {
    console.log(" handleAddPoi called", { activeFloorId, isAddingPoi });

    if (!activeFloorId || isAddingPoi) {
      console.log(" Blocked - already adding or no active floor");
      return;
    }

    setIsAddingPoi(true);

    const newPoi: PointOfInterest = {
      id: `poi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newPOI.type.toUpperCase(),
      type: newPOI.type,
      xAxis: 10,
      yAxis: 20,
      width: newPOI.width,
      height: newPOI.height,
      rotation: 0,
    };

    console.log("Adding new POI:", newPoi.id);

    setUnsavedChangesByFloor((prev) => {
      const currentUnsaved = prev[activeFloorId] || {
        pointsOfInterest: [],
        boundaryWalls: [],
      };

      console.log(
        " Current unsaved POIs:",
        currentUnsaved.pointsOfInterest.length
      );

      const updated = {
        ...prev,
        [activeFloorId]: {
          pointsOfInterest: [...currentUnsaved.pointsOfInterest, newPoi],
          boundaryWalls: currentUnsaved.boundaryWalls,
        },
      };

      console.log(
        " Updated unsaved POIs:",
        updated[activeFloorId].pointsOfInterest.length
      );

      return updated;
    });

    setNewPoiData({ name: "", type: "main-bar", width: 80, height: 70 });

    // Reset guard after a short delay
    setTimeout(() => setIsAddingPoi(false), 300);
  };

  // Add boundary wall - store in unsaved changes for active floor
  const handleAddBoundaryWall = (newWalls: Wall[]) => {
    console.log(" Adding boundary walls:", newWalls.length);

    if (!activeFloorId) {
      console.log(" No active floor");
      return;
    }

    setUnsavedChangesByFloor((prev) => {
      const currentUnsaved = prev[activeFloorId] || {
        pointsOfInterest: [],
        boundaryWalls: [],
      };

      console.log(
        " Current unsaved walls:",
        currentUnsaved.boundaryWalls.length
      );

      const updated = {
        ...prev,
        [activeFloorId]: {
          pointsOfInterest: currentUnsaved.pointsOfInterest,
          boundaryWalls: [...currentUnsaved.boundaryWalls, ...newWalls],
        },
      };

      console.log(
        "Updated unsaved walls:",
        updated[activeFloorId].boundaryWalls.length
      );

      return updated;
    });

    // Mark floor as modified
    setHasModifications((prev) => ({ ...prev, [activeFloorId]: true }));
  };

  // Update POI position/properties in unsaved changes
  const updateSelectedPoi = (updates: Partial<PointOfInterest>) => {
    console.log(" Updating POI:", selectedElement, updates);

    if (!selectedElement || !activeFloorId) return;

    // Mark floor as modified
    setHasModifications((prev) => ({ ...prev, [activeFloorId]: true }));

    // Check if it's in unsaved changes (local POI)
    const unsaved = unsavedChangesByFloor[activeFloorId];
    const isLocalPoi = unsaved?.pointsOfInterest.some(
      (p) => p.id === selectedElement
    );

    if (isLocalPoi) {
      // Update in unsaved changes
      setUnsavedChangesByFloor((prev) => {
        const currentUnsaved = prev[activeFloorId] || {
          pointsOfInterest: [],
          boundaryWalls: [],
        };

        return {
          ...prev,
          [activeFloorId]: {
            ...currentUnsaved,
            pointsOfInterest: currentUnsaved.pointsOfInterest.map((p) =>
              p.id === selectedElement ? { ...p, ...updates } : p
            ),
          },
        };
      });
    } else {
      // It's a server POI - update in floors state
      setFloors((prev) =>
        prev.map((floor) => {
          if (floor.id === activeFloorId) {
            return {
              ...floor,
              pointsOfInterest: floor.pointsOfInterest?.map((p) =>
                p.id === selectedElement ? { ...p, ...updates } : p
              ),
            };
          }
          return floor;
        })
      );
    }
  };

  // Handler to rotate POI by 90 degrees (0 -> 90 -> 180 -> 270 -> 0)
  const handleRotatePOI = (poiId: string) => {
    if (!activeFloorId) return;

    console.log("Rotating POI:", poiId);

    // Mark floor as modified
    setHasModifications((prev) => ({ ...prev, [activeFloorId]: true }));

    const serverFloor = floors.find((f) => f.id === activeFloorId);
    if (!serverFloor) return;

    // Check if it's in unsaved changes (local POI)
    const unsaved = unsavedChangesByFloor[activeFloorId];
    const isUnsavedPoi = unsaved?.pointsOfInterest.some((p) => p.id === poiId);

    if (isUnsavedPoi) {
      // Update rotation in unsaved changes
      setUnsavedChangesByFloor((prev) => {
        const currentUnsaved = prev[activeFloorId] || {
          pointsOfInterest: [],
          boundaryWalls: [],
        };

        return {
          ...prev,
          [activeFloorId]: {
            ...currentUnsaved,
            pointsOfInterest: currentUnsaved.pointsOfInterest.map((p) =>
              p.id === poiId
                ? { ...p, rotation: ((p.rotation || 0) + 90) % 360 }
                : p
            ),
          },
        };
      });
    } else {
      // It's a server POI - update in floors state
      setFloors((prev) =>
        prev.map((floor) => {
          if (floor.id === activeFloorId) {
            return {
              ...floor,
              pointsOfInterest: floor.pointsOfInterest?.map((p) =>
                p.id === poiId
                  ? { ...p, rotation: ((p.rotation || 0) + 90) % 360 }
                  : p
              ),
            };
          }
          return floor;
        })
      );
    }
  };
  const handleRotateTable = async (tableId: string) => {
    if (!activeFloorId) return;

    console.log(" Rotating table:", tableId);

    const serverFloor = floors.find((f) => f.id === activeFloorId);
    if (!serverFloor) return;

    const table = serverFloor.tables?.find(
      (t) => t._id === tableId || t.id === tableId
    );

    if (!table) return;

    // Calculate new rotation
    const newRotation = ((table.rotation || 0) + 90) % 360;

    // Update table rotation in state first (for immediate UI feedback)
    setFloors((prev) =>
      prev.map((floor) => {
        if (floor.id === activeFloorId) {
          return {
            ...floor,
            tables: floor.tables?.map((t) =>
              t._id === tableId || t.id === tableId
                ? { ...t, rotation: newRotation }
                : t
            ),
          };
        }
        return floor;
      })
    );

    const params = {
      tableId: table._id,
      tableNumber: table.tableNumber,
      floorId: table?.floor?.id || table?.floor,
      price: table.price,
      capacity: table.capacity,
      tableCount: table.tableCount,
      description: table.description,
      status: table?.status,
      xAxis: table?.xAxis,
      yAxis: table?.yAxis,
      width: table?.width,
      height: table?.height,
      rotation: newRotation,
    };

    await callApi("POST", "/tables/update", params, {
      onSuccess: (data) => {
        console.log("Table rotation saved successfully");
      },
      onError: (err) => {
        console.error(" Error saving table rotation:", err);
        // Revert rotation on error
        setFloors((prev) =>
          prev.map((floor) => {
            if (floor.id === activeFloorId) {
              return {
                ...floor,
                tables: floor.tables?.map((t) =>
                  t._id === tableId || t.id === tableId
                    ? { ...t, rotation: table.rotation || 0 }
                    : t
                ),
              };
            }
            return floor;
          })
        );
      },
    });
  };
  // Delete element (table, POI, or boundary wall)
  const handleDeleteSelected = async () => {
    if (!selectedElement || !activeFloorId) return;

    console.log("🗑️ Deleting element:", selectedElement);

    const serverFloor = floors.find((f) => f.id === activeFloorId);
    if (!serverFloor) return;

    // Check if it's a table
    const isTable = serverFloor.tables?.some(
      (t) => t._id === selectedElement || t.id === selectedElement
    );

    if (isTable) {
      // Delete table from server
      await callApi(
        "DELETE",
        `/tables/delete`,
        { tableId: selectedElement },
        {
          onSuccess: () => {
            if (UserData) fetchFloors(UserData.club.id);
            setSelectedElement(null);
          },
          onError: (err) => console.error("Error deleting table:", err),
        }
      );
      return;
    }

    // Check if it's in unsaved changes (local POI or wall)
    const unsaved = unsavedChangesByFloor[activeFloorId];
    const isUnsavedPoi = unsaved?.pointsOfInterest.some(
      (p) => p.id === selectedElement
    );
    const isUnsavedWall = unsaved?.boundaryWalls.some(
      (w) => w.id === selectedElement
    );

    if (isUnsavedPoi || isUnsavedWall) {
      // Delete from unsaved changes
      console.log("Deleting from unsaved changes");
      setUnsavedChangesByFloor((prev) => {
        const currentUnsaved = prev[activeFloorId] || {
          pointsOfInterest: [],
          boundaryWalls: [],
        };

        const updatedUnsaved = {
          pointsOfInterest: currentUnsaved.pointsOfInterest.filter(
            (p) => p.id !== selectedElement
          ),
          boundaryWalls: currentUnsaved.boundaryWalls.filter(
            (w) => w.id !== selectedElement
          ),
        };

        return {
          ...prev,
          [activeFloorId]: updatedUnsaved,
        };
      });
      setSelectedElement(null);
      return;
    }

    // Check if it's a server POI or wall
    const isServerPoi = serverFloor.pointsOfInterest?.some(
      (p) => p.id === selectedElement
    );
    const isServerWall = serverFloor.boundaryWalls?.some(
      (w) => w.id === selectedElement
    );

    if (isServerPoi || isServerWall) {
      // Delete from server state and mark as modified
      console.log("Deleting from server state");
      setFloors((prev) =>
        prev.map((floor) => {
          if (floor.id === activeFloorId) {
            return {
              ...floor,
              pointsOfInterest: floor.pointsOfInterest?.filter(
                (p) => p.id !== selectedElement
              ),
              boundaryWalls: floor.boundaryWalls?.filter(
                (w) => w.id !== selectedElement
              ),
            };
          }
          return floor;
        })
      );

      // Mark floor as modified so save button is enabled
      setHasModifications((prev) => ({ ...prev, [activeFloorId]: true }));
      setSelectedElement(null);
      return;
    }

    console.log(" Element not found:", selectedElement);
    setSelectedElement(null);
  };

  // Undo last wall (from unsaved changes or server state)
  const handleUndoWall = () => {
    if (!activeFloorId) return;

    console.log(" Undoing last wall");

    const unsaved = unsavedChangesByFloor[activeFloorId];

    // First try to remove from unsaved changes
    if (unsaved && unsaved.boundaryWalls.length > 0) {
      console.log("🗑️ Removing from unsaved walls");
      setUnsavedChangesByFloor((prev) => {
        const currentUnsaved = prev[activeFloorId];
        return {
          ...prev,
          [activeFloorId]: {
            ...currentUnsaved,
            boundaryWalls: currentUnsaved.boundaryWalls.slice(0, -1),
          },
        };
      });
      return;
    }

    // Otherwise remove from server state
    const serverFloor = floors.find((f) => f.id === activeFloorId);
    if (
      serverFloor &&
      serverFloor.boundaryWalls &&
      serverFloor.boundaryWalls.length > 0
    ) {
      console.log(" Removing from server walls");
      setFloors((prev) =>
        prev.map((floor) => {
          if (floor.id === activeFloorId) {
            return {
              ...floor,
              boundaryWalls: floor.boundaryWalls?.slice(0, -1),
            };
          }
          return floor;
        })
      );

      // Mark floor as modified
      setHasModifications((prev) => ({ ...prev, [activeFloorId]: true }));
    } else {
      console.log(" No walls to undo");
    }
  };

  // Save floor setup - merge unsaved changes and send to server
  const saveFloorSetup = async () => {
    if (!activeFloor || !activeFloorId) return;

    const serverFloor = floors.find((f) => f.id === activeFloorId);
    if (!serverFloor) return;

    const unsaved = unsavedChangesByFloor[activeFloorId] || {
      pointsOfInterest: [],
      boundaryWalls: [],
    };

    const floorToSave = {
      ...serverFloor,
      pointsOfInterest: [
        ...(serverFloor.pointsOfInterest || []),
        ...unsaved.pointsOfInterest,
      ],
      boundaryWalls: [
        ...(serverFloor.boundaryWalls || []),
        ...unsaved.boundaryWalls,
      ],
    };

    console.log("💾 Saving floor:", floorToSave);

    await callApi("PUT", `/floor/${activeFloorId}`, floorToSave, {
      onSuccess: (data) => {
        if (!UserData) return;

        // Clear unsaved changes for this floor
        setUnsavedChangesByFloor((prev) => {
          const { [activeFloorId]: removed, ...rest } = prev;
          return rest;
        });

        // Clear modifications flag
        setHasModifications((prev) => {
          const { [activeFloorId]: removed, ...rest } = prev;
          return rest;
        });

        // Refresh floors from server
        fetchFloors(UserData.club.id);

        toast.success("Floor setup saved successfully!");
      },
      onError: (err) => {
        console.error("Error saving floor:", err);
        toast.error("Failed to save floor setup");
      },
    });
  };

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
          if (!UserData) return;
          localStorage.setItem("activeFloorId", data?.payLoad?.id);
          setActiveFloorId(data?.payLoad?.id);
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

        // Clear unsaved changes for deleted floor
        setUnsavedChangesByFloor((prev) => {
          const { [floorId]: removed, ...rest } = prev;
          return rest;
        });

        // Clear modifications flag for deleted floor
        setHasModifications((prev) => {
          const { [floorId]: removed, ...rest } = prev;
          return rest;
        });

        await fetchFloors(UserData.club.id);

        if (nextActiveFloorId) {
          localStorage.setItem("activeFloorId", nextActiveFloorId);
          setActiveFloorId(nextActiveFloorId);
        } else {
          localStorage.removeItem("activeFloorId");
          setActiveFloorId("");
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
                    localStorage.setItem("activeFloorId", floor.id);
                    setActiveFloorId(floor.id);
                    setActiveTab("floors");
                  }}
                >
                  {floor.name}
                  {hasUnsavedChanges(floor.id) && (
                    <span className="unsaved-indicator" title="Unsaved changes">
                      {" "}
                      ●
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="canvas-controls">
              <button
                className="btn-save"
                onClick={saveFloorSetup}
                // disabled={!hasUnsavedChanges(activeFloorId)}
              >
                Save Changes
                {hasUnsavedChanges(activeFloorId) && " *"}
              </button>
            </div>
          </div>
          <FloorCanvas
            floor={activeFloor}
            onFloorUpdate={updateFloor}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            setActiveTab={setActiveTab}
            onElementPositionUpdate={handleElementPositionUpdate}
            onRotatePOI={handleRotatePOI}
            onDeleteElement={handleDeleteSelected}
            onAddBoundaryWall={handleAddBoundaryWall}
            onUndoWall={handleUndoWall}
            handleRotateTable={handleRotateTable}
          />
        </div>

        <AdminPanel
          floors={floors}
          activeFloor={activeFloor}
          onFloorUpdate={updateFloor}
          onAddFloor={addFloor}
          onDeleteFloor={deleteFloor}
          selectedElement={selectedElement}
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
          handleAddPoi={handleAddPoi}
          handleDeleteSelected={handleDeleteSelected}
        />
      </div>
    </div>
  );
}

export default InteractiveTableBooking;
