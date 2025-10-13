import React, { useEffect, useState } from "react";
import AdminPanel from "./sub-components/AdminPanel";
import FloorCanvas from "./sub-components/FloorCanvas";
import ReservationsPanel from "./sub-components/ReservationsPanel";
import "./style.css";
import {
  ClubHours,
  Floor,
  Reservation,
  UserData,
  PointOfInterest,
  DesignPatterns,
} from "./types";
import { useApi } from "../../utils/custom-hooks/useApi";

// Type for tracking unsaved changes per floor
interface UnsavedChanges {
  pointsOfInterest: PointOfInterest[];
  designPatterns: DesignPatterns[];
}

function InteractiveTableBooking() {
  const [activeFloorId, setActiveFloorId] = useState<string>(
    localStorage.getItem("activeFloorId") || ""
  );
  const storedUser = localStorage.getItem("userData");

  // Server state - floors from API
  const [floors, setFloors] = useState<Floor[]>([]);

  // Local state - unsaved changes per floor
  const [unsavedChangesByFloor, setUnsavedChangesByFloor] = useState<
    Record<string, UnsavedChanges>
  >({});

  // Track if there are any modifications (new items or position/size changes)
  const [hasModifications, setHasModifications] = useState<
    Record<string, boolean>
  >({});

  // Guard to prevent duplicate additions
  const [isAddingPoi, setIsAddingPoi] = useState(false);
  const [isAddingPattern, setIsAddingPattern] = useState(false);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
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
  const [newPoiData, setNewPoiData] = useState({
    name: "",
    type: "main-bar" as PointOfInterest["type"],
    width: 20,
    height: 20,
  });
  const [designPattern, setNewDesignPattern] = useState({
    name: "",
    type: "single-door-line" as DesignPatterns["type"],
    width: 20,
    height: 20,
  });

  const UserData: UserData | null = storedUser
    ? (JSON.parse(storedUser) as UserData)
    : null;
  const { loading, callApi } = useApi();

  const [reservations] = useState<Reservation[]>([]);

  // Get active floor with merged unsaved changes
  const getActiveFloorData = (): Floor | undefined => {
    const serverFloor = floors.find((f) => f.id === activeFloorId);
    if (!serverFloor) return undefined;

    const unsaved = unsavedChangesByFloor[activeFloorId] || {
      pointsOfInterest: [],
      designPatterns: [],
    };

    const mergedFloor = {
      ...serverFloor,
      pointsOfInterest: [
        ...(serverFloor.pointsOfInterest || []),
        ...unsaved.pointsOfInterest,
      ],
      designPatterns: [
        ...(serverFloor.designPatterns || []),
        ...unsaved.designPatterns,
      ],
    };

    // Debug log
    console.log("Active Floor Data:", {
      floorId: activeFloorId,
      serverPOIs: serverFloor.pointsOfInterest?.length || 0,
      unsavedPOIs: unsaved.pointsOfInterest.length,
      totalPOIs: mergedFloor.pointsOfInterest.length,
      serverPatterns: serverFloor.designPatterns?.length || 0,
      unsavedPatterns: unsaved.designPatterns.length,
      totalPatterns: mergedFloor.designPatterns.length,
    });

    return mergedFloor;
  };

  const activeFloor = getActiveFloorData();

  // Check if a floor has unsaved changes
  const hasUnsavedChanges = (floorId: string): boolean => {
    const serverFloor = floors.find((f) => f.id === floorId);
    if (!serverFloor) return false;

    const unsaved = unsavedChangesByFloor[floorId];

    // Check if there are new unsaved POIs or patterns
    const hasNewItems = Boolean(
      unsaved &&
        (unsaved.pointsOfInterest.length > 0 ||
          unsaved.designPatterns.length > 0)
    );

    // Check if server POIs/patterns have been modified (position/size changes)
    const serverPoisModified = serverFloor.pointsOfInterest?.some((poi) => {
      const originalPoi = floors
        .find((f) => f.id === floorId)
        ?.pointsOfInterest?.find((p) => p.id === poi.id);
      return (
        originalPoi &&
        (originalPoi.xAxis !== poi.xAxis ||
          originalPoi.yAxis !== poi.yAxis ||
          originalPoi.width !== poi.width ||
          originalPoi.height !== poi.height ||
          originalPoi.rotation !== poi.rotation)
      );
    });

    const serverPatternsModified = serverFloor.designPatterns?.some(
      (pattern) => {
        const originalPattern = floors
          .find((f) => f.id === floorId)
          ?.designPatterns?.find((p) => p.id === pattern.id);
        return (
          originalPattern &&
          (originalPattern.xAxis !== pattern.xAxis ||
            originalPattern.yAxis !== pattern.yAxis ||
            originalPattern.width !== pattern.width ||
            originalPattern.height !== pattern.height ||
            originalPattern.rotation !== pattern.rotation)
        );
      }
    );

    return hasNewItems || serverPoisModified || serverPatternsModified;
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
  // IMPORTANT: Do NOT use this for POIs or design patterns - use unsaved state instead
  const updateFloor = (updatedFloor: Floor) => {
    console.log(
      "updateFloor called - this should NOT be used for POIs/patterns"
    );
    console.trace(); // Show where it's being called from

    setFloors((prevFloors) =>
      prevFloors.map((f) => {
        if (f.id === updatedFloor.id) {
          // Only update server-managed properties, preserve POIs/patterns from server
          return {
            ...updatedFloor,
            pointsOfInterest: f.pointsOfInterest, // Keep original server POIs
            designPatterns: f.designPatterns, // Keep original server patterns
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
    console.log("Position update:", elementId, { xAxis, yAxis });

    if (!activeFloorId) return;

    // Mark floor as modified
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

    // Check if it's an unsaved design pattern
    const isUnsavedPattern = unsaved?.designPatterns.some(
      (d) => d.id === elementId
    );
    if (isUnsavedPattern) {
      updateSelectedDP({ xAxis, yAxis });
      return;
    }

    // Check if it's a server design pattern
    const isServerPattern = serverFloor.designPatterns?.some(
      (d) => d.id === elementId
    );
    if (isServerPattern) {
      setFloors((prev) =>
        prev.map((floor) => {
          if (floor.id === activeFloorId) {
            return {
              ...floor,
              designPatterns: floor.designPatterns?.map((d) =>
                d.id === elementId ? { ...d, xAxis, yAxis } : d
              ),
            };
          }
          return floor;
        })
      );
    }
  };

  // Add POI - store in unsaved changes for active floor
  const handleAddPoi = () => {
    console.log("handleAddPoi called", { activeFloorId, isAddingPoi });

    if (!activeFloorId || isAddingPoi) {
      console.log(" Blocked - already adding or no active floor");
      return;
    }

    setIsAddingPoi(true);

    const newPoi: PointOfInterest = {
      id: `poi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newPoiData.name || newPoiData.type.toUpperCase(),
      type: newPoiData.type,
      xAxis: 10,
      yAxis: 20,
      width: newPoiData.width,
      height: newPoiData.height,
      rotation: 0,
    };

    console.log("Adding new POI:", newPoi.id);

    setUnsavedChangesByFloor((prev) => {
      const currentUnsaved = prev[activeFloorId] || {
        pointsOfInterest: [],
        designPatterns: [],
      };

      console.log(
        "📊 Current unsaved POIs:",
        currentUnsaved.pointsOfInterest.length
      );

      const updated = {
        ...prev,
        [activeFloorId]: {
          pointsOfInterest: [...currentUnsaved.pointsOfInterest, newPoi],
          designPatterns: currentUnsaved.designPatterns,
        },
      };

      console.log(
        "📊 Updated unsaved POIs:",
        updated[activeFloorId].pointsOfInterest.length
      );

      return updated;
    });

    setNewPoiData({ name: "", type: "bar", width: 20, height: 20 });

    // Reset guard after a short delay
    setTimeout(() => setIsAddingPoi(false), 300);
  };

  // Add Design Pattern - store in unsaved changes for active floor
  const handleAddDesignPattern = () => {
    if (!activeFloorId || isAddingPattern) return;

    setIsAddingPattern(true);

    const newDesignPattern: DesignPatterns = {
      id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: designPattern.name || designPattern.type.toUpperCase(),
      type: designPattern.type,
      xAxis: 10,
      yAxis: 20,
      width: designPattern.width,
      height: designPattern.height,
      rotation: 0,
    };

    setUnsavedChangesByFloor((prev) => {
      const currentUnsaved = prev[activeFloorId] || {
        pointsOfInterest: [],
        designPatterns: [],
      };

      return {
        ...prev,
        [activeFloorId]: {
          pointsOfInterest: currentUnsaved.pointsOfInterest,
          designPatterns: [...currentUnsaved.designPatterns, newDesignPattern],
        },
      };
    });

    setNewDesignPattern({
      name: "",
      type: "single-door-line",
      width: 20,
      height: 20,
    });

    // Reset guard after a short delay
    setTimeout(() => setIsAddingPattern(false), 300);
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
          designPatterns: [],
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

  // Update Design Pattern in unsaved changes
  const updateSelectedDP = (updates: Partial<DesignPatterns>) => {
    console.log(" Updating Design Pattern:", selectedElement, updates);

    if (!selectedElement || !activeFloorId) return;

    // Mark floor as modified
    setHasModifications((prev) => ({ ...prev, [activeFloorId]: true }));

    // Check if it's in unsaved changes (local pattern)
    const unsaved = unsavedChangesByFloor[activeFloorId];
    const isLocalPattern = unsaved?.designPatterns.some(
      (d) => d.id === selectedElement
    );

    if (isLocalPattern) {
      // Update in unsaved changes
      setUnsavedChangesByFloor((prev) => {
        const currentUnsaved = prev[activeFloorId] || {
          pointsOfInterest: [],
          designPatterns: [],
        };

        return {
          ...prev,
          [activeFloorId]: {
            ...currentUnsaved,
            designPatterns: currentUnsaved.designPatterns.map((d) =>
              d.id === selectedElement ? { ...d, ...updates } : d
            ),
          },
        };
      });
    } else {
      // It's a server pattern - update in floors state
      setFloors((prev) =>
        prev.map((floor) => {
          if (floor.id === activeFloorId) {
            return {
              ...floor,
              designPatterns: floor.designPatterns?.map((d) =>
                d.id === selectedElement ? { ...d, ...updates } : d
              ),
            };
          }
          return floor;
        })
      );
    }
  };

  // Delete element (table, POI, or design pattern)
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

    // Check if it's in unsaved changes (local POI or pattern)
    const unsaved = unsavedChangesByFloor[activeFloorId];
    const isUnsavedPoi = unsaved?.pointsOfInterest.some(
      (p) => p.id === selectedElement
    );
    const isUnsavedPattern = unsaved?.designPatterns.some(
      (d) => d.id === selectedElement
    );

    if (isUnsavedPoi || isUnsavedPattern) {
      // Delete from unsaved changes
      console.log("🗑️ Deleting from unsaved changes");
      setUnsavedChangesByFloor((prev) => {
        const currentUnsaved = prev[activeFloorId] || {
          pointsOfInterest: [],
          designPatterns: [],
        };

        const updatedUnsaved = {
          pointsOfInterest: currentUnsaved.pointsOfInterest.filter(
            (p) => p.id !== selectedElement
          ),
          designPatterns: currentUnsaved.designPatterns.filter(
            (d) => d.id !== selectedElement
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

    // Check if it's a server POI or pattern
    const isServerPoi = serverFloor.pointsOfInterest?.some(
      (p) => p.id === selectedElement
    );
    const isServerPattern = serverFloor.designPatterns?.some(
      (d) => d.id === selectedElement
    );

    if (isServerPoi || isServerPattern) {
      // Delete from server state and mark as modified
      console.log("🗑️ Deleting from server state");
      setFloors((prev) =>
        prev.map((floor) => {
          if (floor.id === activeFloorId) {
            return {
              ...floor,
              pointsOfInterest: floor.pointsOfInterest?.filter(
                (p) => p.id !== selectedElement
              ),
              designPatterns: floor.designPatterns?.filter(
                (d) => d.id !== selectedElement
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

  // Save floor setup - merge unsaved changes and send to server
  const saveFloorSetup = async () => {
    if (!activeFloor || !activeFloorId) return;

    const serverFloor = floors.find((f) => f.id === activeFloorId);
    if (!serverFloor) return;

    const unsaved = unsavedChangesByFloor[activeFloorId] || {
      pointsOfInterest: [],
      designPatterns: [],
    };

    const floorToSave = {
      ...serverFloor,
      pointsOfInterest: [
        ...(serverFloor.pointsOfInterest || []),
        ...unsaved.pointsOfInterest,
      ],
      designPatterns: [
        ...(serverFloor.designPatterns || []),
        ...unsaved.designPatterns,
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

        alert("Floor setup saved successfully!");
      },
      onError: (err) => {
        console.error("Error saving floor:", err);
        alert("Failed to save floor setup");
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
                💾 Save Changes
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
          />
        </div>

        <AdminPanel
          floors={floors}
          activeFloor={activeFloor}
          onFloorUpdate={updateFloor}
          onAddFloor={addFloor}
          onDeleteFloor={deleteFloor}
          selectedElement={selectedElement}
          onElementSelect={setSelectedElement}
          clubHours={clubHours}
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
          designPattern={designPattern}
          setNewDesignPattern={setNewDesignPattern}
          handleAddPoi={handleAddPoi}
          handleAddDesignPattern={handleAddDesignPattern}
          updateSelectedPoi={updateSelectedPoi}
          updateSelectedDP={updateSelectedDP}
          handleDeleteSelected={handleDeleteSelected}
        />
      </div>
    </div>
  );
}

export default InteractiveTableBooking;
