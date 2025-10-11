import React, { useRef, useEffect, useState, useCallback } from "react";
import { Floor, UserData } from "./../types";
import { useApi } from "../../../utils/custom-hooks/useApi";
import { POIIcons, TableIcons } from "../../../utils/canvasIcons";

interface FloorCanvasProps {
  floor: Floor;
  onFloorUpdate: (floor: Floor) => void;
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  setActiveTab: React.Dispatch<
    React.SetStateAction<"floors" | "tables" | "settings">
  >;
}

const FloorCanvas: React.FC<FloorCanvasProps> = ({
  floor,
  onFloorUpdate,
  selectedElement,
  onElementSelect,
  setActiveTab,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ xAxis: 0, yAxis: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({
    xAxis: 0,
    yAxis: 0,
  });

  const getCanvasSize = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { width: rect?.width ?? 1, height: rect?.height ?? 1 };
  };

  // Export layout as JSON maintaining your exact structure
  const exportLayoutJSON = useCallback(() => {
    // Simply return the floor object as-is, it already has the correct structure
    const layoutData = {
      name: floor.name,
      club: floor.club,
      status: floor.status,
      designPatterns:
        floor.designPatterns?.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          xAxis: d.xAxis,
          yAxis: d.yAxis,
          width: d.width,
          height: d.height,
          rotation: d.rotation || 0,
        })) || [],
      pointsOfInterest:
        floor.pointsOfInterest?.map((poi) => ({
          id: poi.id,
          name: poi.name,
          type: poi.type,
          xAxis: poi.xAxis,
          yAxis: poi.yAxis,
          width: poi.width,
          height: poi.height,
          rotation: poi.rotation || 0,
        })) || [],
      createdAt: floor.createdAt,
      updatedAt: floor.updatedAt,
      __v: floor.__v,
      tables:
        floor.tables?.map((table) => ({
          _id: table._id,
          club: table.club,
          tableNumber: table.tableNumber,
          tableType: table.tableType,
          description: table.description,
          price: table.price,
          tableCount: table.tableCount,
          capacity: table.capacity,
          xAxis: table.xAxis,
          yAxis: table.yAxis,
          width: table.width,
          height: table.height,
          status: table.status,
          floor: table.floor,
          createdAt: table.createdAt,
          updatedAt: table.updatedAt,
          __v: table.__v,
          rotation: table.rotation || 0,
        })) || [],
      tableCount: floor.tableCount,
      id: floor.id,
    };

    return layoutData;
  }, [floor]);

  // Import layout from JSON - your exact structure
  const importLayoutJSON = useCallback(
    (layoutData: any) => {
      // The data is already in the correct format, just update the floor
      onFloorUpdate(layoutData);
    },
    [onFloorUpdate]
  );

  const handleElementMouseDown = useCallback(
    (
      e: React.MouseEvent,
      elementId: string | any,
      elementType: "table" | "poi" | "design"
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      setDragOffset({
        xAxis: e.clientX - rect.left,
        yAxis: e.clientY - rect.top,
      });

      setIsDragging(true);
      setActiveTab("tables");
      onElementSelect(elementId);
    },
    [onElementSelect, setActiveTab]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!selectedElement) return;
      if (!floor.tables) return;

      const element = [
        ...floor?.tables,
        ...floor?.pointsOfInterest,
        ...floor?.designPatterns,
      ].find((el) => el.id === selectedElement || el._id === selectedElement);

      if (!element) return;

      setIsResizing(true);
      setResizeHandle(handle);
      setInitialSize({ width: element.width, height: element.height });
      setInitialMousePos({ xAxis: e.clientX, yAxis: e.clientY });
    },
    [selectedElement, floor]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!selectedElement || !canvasRef.current) return;

      const { width: canvasWidth, height: canvasHeight } = getCanvasSize();

      if (isResizing && resizeHandle) {
        const deltaX = e.clientX - initialMousePos.xAxis;
        const deltaY = e.clientY - initialMousePos.yAxis;

        let newWidth = initialSize.width;
        let newHeight = initialSize.height;

        switch (resizeHandle) {
          case "se":
            newWidth = Math.max(20, newWidth + deltaX);
            newHeight = Math.max(20, newHeight + deltaY);
            break;
          case "sw":
            newWidth = Math.max(20, newWidth - deltaX);
            newHeight = Math.max(20, newHeight + deltaY);
            break;
          case "ne":
            newWidth = Math.max(20, newWidth + deltaX);
            newHeight = Math.max(20, newHeight - deltaY);
            break;
          case "nw":
            newWidth = Math.max(20, newWidth - deltaX);
            newHeight = Math.max(20, newHeight - deltaY);
            break;
        }

        const updatedFloor = { ...floor };
        const tableIndex = updatedFloor.tables.findIndex(
          (t) => t._id === selectedElement
        );
        const poiIndex = updatedFloor.pointsOfInterest.findIndex(
          (p) => p.id === selectedElement
        );
        const dIndex = updatedFloor.designPatterns.findIndex(
          (d) => d.id === selectedElement
        );

        if (tableIndex >= 0) {
          updatedFloor.tables[tableIndex] = {
            ...updatedFloor.tables[tableIndex],
            width: newWidth,
            height: newHeight,
          };
        } else if (poiIndex >= 0) {
          updatedFloor.pointsOfInterest[poiIndex] = {
            ...updatedFloor.pointsOfInterest[poiIndex],
            width: newWidth,
            height: newHeight,
          };
        } else if (dIndex >= 0) {
          updatedFloor.designPatterns[dIndex] = {
            ...updatedFloor.designPatterns[dIndex],
            width: newWidth,
            height: newHeight,
          };
        }

        onFloorUpdate(updatedFloor);
        return;
      }

      if (!isDragging) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.xAxis;
      const newY = e.clientY - canvasRect.top - dragOffset.yAxis;

      // Get the current element to know its dimensions
      let elementWidth = 0;
      let elementHeight = 0;

      const element = [
        ...floor?.tables,
        ...floor?.pointsOfInterest,
        ...floor?.designPatterns,
      ].find((el) => el.id === selectedElement || el._id === selectedElement);

      if (element) {
        elementWidth = element.width || 40;
        elementHeight = element.height || 40;
      }

      // Convert element size to percentage of canvas
      const elementWidthPercent = (elementWidth / canvasWidth) * 100;
      const elementHeightPercent = (elementHeight / canvasHeight) * 100;

      // Convert mouse position to percentage
      let newXPercent = (newX / canvasWidth) * 100;
      let newYPercent = (newY / canvasHeight) * 100;

      // Calculate boundaries based on element type
      // For rotated elements, we need to account for the bounding box
      const rotation = element?.rotation || 0;

      // Calculate rotated bounding box dimensions
      const radians = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));

      const rotatedWidthPercent =
        elementWidthPercent * cos + elementHeightPercent * sin;
      const rotatedHeightPercent =
        elementWidthPercent * sin + elementHeightPercent * cos;

      // Clamp position to keep element fully within canvas
      // X: from 0% to (100% - element's rotated width)
      // Y: from 0% to (100% - element's rotated height)
      newXPercent = Math.max(
        0,
        Math.min(100 - rotatedWidthPercent, newXPercent)
      );
      newYPercent = Math.max(
        0,
        Math.min(100 - rotatedHeightPercent, newYPercent)
      );

      const updatedFloor = { ...floor };
      if (!updatedFloor.tables) return;

      const tableIndex = updatedFloor.tables.findIndex(
        (t) => t._id === selectedElement
      );
      const poiIndex = (updatedFloor.pointsOfInterest || []).findIndex(
        (p) => p.id === selectedElement
      );
      const dIndex = (updatedFloor.designPatterns || []).findIndex(
        (d) => d.id === selectedElement
      );

      if (tableIndex >= 0) {
        updatedFloor.tables[tableIndex] = {
          ...updatedFloor.tables[tableIndex],
          xAxis: newXPercent,
          yAxis: newYPercent,
        };
      } else if (poiIndex >= 0) {
        updatedFloor.pointsOfInterest[poiIndex] = {
          ...updatedFloor.pointsOfInterest[poiIndex],
          xAxis: newXPercent,
          yAxis: newYPercent,
        };
      } else if (dIndex >= 0) {
        updatedFloor.designPatterns[dIndex] = {
          ...updatedFloor.designPatterns[dIndex],
          xAxis: newXPercent,
          yAxis: newYPercent,
        };
      }

      onFloorUpdate(updatedFloor);
    },
    [
      isDragging,
      isResizing,
      selectedElement,
      floor,
      onFloorUpdate,
      dragOffset,
      resizeHandle,
      initialSize,
      initialMousePos,
    ]
  );

  const { loading, callApi } = useApi();
  const storedUser = localStorage.getItem("userData");

  const UserData: UserData | null = storedUser
    ? (JSON.parse(storedUser) as UserData)
    : null;

  const handleUpdateTable = async (table: any) => {
    if (!table) return;

    const params = {
      tableId: table?._id,
      tableNumber: table.tableNumber,
      floorId: table?.floor?.id || table?.floor,
      price: table.price,
      capacity: table.capacity,
      tableCount: table.tableCount,
      description: table.description,
      status: table?.status,
      xAxis: table?.xAxis, // Percentage (0-100)
      yAxis: table?.yAxis, // Percentage (0-100)
      width: table?.width, // Absolute pixels
      height: table?.height, // Absolute pixels
      rotation: table?.rotation || 0,
    };

    await callApi("POST", "/tables/update", params, {
      onSuccess: (data) => {
        if (!UserData) return;
        // Optionally export JSON after successful update
        const layoutJSON = exportLayoutJSON();
        console.log(
          "Updated layout JSON:",
          JSON.stringify(layoutJSON, null, 2)
        );
      },
      onError: (err) => console.error("Error:", err),
    });
  };

  const handleMouseUp = useCallback(
    (e?: MouseEvent) => {
      if (!floor.tables) return;

      if (isDragging && selectedElement && floor) {
        const table = floor.tables.find((t) => t._id === selectedElement);
        if (table) {
          console.log(
            `Drag end for table ${selectedElement}: x=${table.xAxis.toFixed(
              2
            )}% y=${table.yAxis.toFixed(2)}%`
          );
          handleUpdateTable(table);
        }
      }

      if (isResizing && selectedElement && floor) {
        const element = [
          ...floor.tables,
          ...floor.pointsOfInterest,
          ...floor.designPatterns,
        ].find((el) => el.id === selectedElement || el._id === selectedElement);

        if (element) {
          console.log(
            `Resize end for element ${selectedElement}: width=${element.width}px height=${element.height}px`
          );

          if ("_id" in element) {
            handleUpdateTable(element);
          }
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    },
    [isDragging, isResizing, selectedElement, floor]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        onElementSelect(null);
      }
    },
    [onElementSelect]
  );

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Log JSON structure on load
  useEffect(() => {
    if (floor?.tables?.length > 0) {
      const layoutJSON = exportLayoutJSON();
      console.log("Current floor JSON structure:", layoutJSON);
    }
  }, []);

  function getTableIcon(table) {
    if (!table) return TableIcons.default;

    let icon;

    if (table.tableType === "circle") {
      if (table.capacity <= 2) icon = TableIcons["t2r-indoor"];
      else if (table.capacity <= 4) icon = TableIcons["t4-outdoor"];
      else if (table.capacity <= 6) icon = TableIcons["t6-indoor"];
      else if (table.capacity <= 8) icon = TableIcons["t8v-outdoor"];
      else icon = TableIcons["t2r-indoor"];
    } else if (table.tableType === "box") {
      if (table.capacity <= 4) icon = TableIcons["t4vr-indoor"];
      else if (table.capacity <= 8) icon = TableIcons["t8vr-indoor"];
      else icon = TableIcons["t10v-outdoor"];
    } else {
      icon = TableIcons.default;
    }

    return icon;
  }

  return (
    <div className="canvas-container">
      {/* Export/Import buttons */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
        <button
          onClick={() => {
            const json = exportLayoutJSON();
            console.log("Exported JSON:", json);
            // Download JSON file
            const blob = new Blob([JSON.stringify(json, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `floor-layout-${floor.id}.json`;
            a.click();
          }}
          style={{
            padding: "8px 16px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "8px",
          }}
        >
          Export JSON
        </button>
        <button
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (e: any) => {
              const file = e.target.files[0];
              const reader = new FileReader();
              reader.onload = (event) => {
                const json = JSON.parse(event.target?.result as string);
                importLayoutJSON(json);
                console.log("Imported JSON:", json);
              };
              reader.readAsText(file);
            };
            input.click();
          }}
          style={{
            padding: "8px 16px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Import JSON
        </button>
      </div>

      <div
        ref={canvasRef}
        className="canvas"
        onClick={handleCanvasClick}
        style={{
          backgroundImage: floor?.backgroundImage
            ? `url(${floor.backgroundImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Grid overlay */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.1,
          }}
        >
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#666"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Tables */}
        {floor?.tables?.map((table) => {
          const icon = getTableIcon(table);

          return (
            <div
              key={table._id}
              className={`table-element ${table.status} ${
                selectedElement === table._id ? "selected" : ""
              }`}
              style={{
                left: `${table.xAxis}%`,
                top: `${table.yAxis}%`,
                width: `${table.width}px`,
                height: `${table.height}px`,
                transform: `rotate(${table.rotation || 0}deg)`,
                position: "absolute",
                zIndex: 20,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, table._id, "table")}
            >
              <img
                src={icon}
                alt="table icon"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />
              {selectedElement === table._id && (
                <>
                  <div
                    className="resize-handle nw"
                    onMouseDown={(e) => handleResizeStart(e, "nw")}
                  />
                  <div
                    className="resize-handle ne"
                    onMouseDown={(e) => handleResizeStart(e, "ne")}
                  />
                  <div
                    className="resize-handle sw"
                    onMouseDown={(e) => handleResizeStart(e, "sw")}
                  />
                  <div
                    className="resize-handle se"
                    onMouseDown={(e) => handleResizeStart(e, "se")}
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Points of Interest */}
        {floor?.pointsOfInterest?.map((poi) => {
          const Icon = POIIcons[poi.type] || POIIcons.default;

          return (
            <div
              key={poi.id}
              className={`poi-element ${
                selectedElement === poi.id ? "selected" : ""
              }`}
              style={{
                left: `${poi.xAxis}%`,
                top: `${poi.yAxis}%`,
                // width: poi.width ? `${poi.width}px` : "",
                // height: poi.height ? `${poi.height}px` : "",
                position: "absolute",
                zIndex: 10,
                transform: `rotate(${poi.rotation || 0}deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab",
              }}
              onMouseDown={(e) => handleElementMouseDown(e, poi.id, "poi")}
              title={poi.name}
            >
              <img
                src={Icon}
                alt={poi.type}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />
              {selectedElement === poi.id && (
                <>
                  <div
                    className="resize-handle nw"
                    onMouseDown={(e) => handleResizeStart(e, "nw")}
                  />
                  <div
                    className="resize-handle ne"
                    onMouseDown={(e) => handleResizeStart(e, "ne")}
                  />
                  <div
                    className="resize-handle sw"
                    onMouseDown={(e) => handleResizeStart(e, "sw")}
                  />
                  <div
                    className="resize-handle se"
                    onMouseDown={(e) => handleResizeStart(e, "se")}
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Design Patterns */}
        {floor?.designPatterns?.map((d) => {
          const Icon = POIIcons[d.type] || POIIcons.default;

          return (
            <div
              key={d.id}
              className={`d-element ${
                selectedElement === d.id ? "selected" : ""
              }`}
              style={{
                left: `${d.xAxis}%`,
                top: `${d.yAxis}%`,
                // width: d.width ? `${d.width}px` : "",
                // height: d.height ? `${d.height}px` : "",
                position: "absolute",
                zIndex: 10,
                transform: `rotate(${d.rotation || 0}deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab",
              }}
              onMouseDown={(e) => handleElementMouseDown(e, d.id, "design")}
              title={d.name}
            >
              <img
                src={Icon}
                alt={d.type}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />
              {selectedElement === d.id && (
                <>
                  <div
                    className="resize-handle nw"
                    onMouseDown={(e) => handleResizeStart(e, "nw")}
                  />
                  <div
                    className="resize-handle ne"
                    onMouseDown={(e) => handleResizeStart(e, "ne")}
                  />
                  <div
                    className="resize-handle sw"
                    onMouseDown={(e) => handleResizeStart(e, "sw")}
                  />
                  <div
                    className="resize-handle se"
                    onMouseDown={(e) => handleResizeStart(e, "se")}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FloorCanvas;
