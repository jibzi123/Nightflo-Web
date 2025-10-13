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
  onElementPositionUpdate?: (
    elementId: string,
    xAxis: number,
    yAxis: number
  ) => void;
}

const FloorCanvas: React.FC<FloorCanvasProps> = ({
  floor,
  onFloorUpdate,
  selectedElement,
  onElementSelect,
  setActiveTab,
  onElementPositionUpdate,
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
        ...(floor?.pointsOfInterest || []),
        ...(floor?.designPatterns || []),
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

        // FIXED: Only update the floor with new dimensions
        // The parent will handle separating server vs unsaved state
        const updatedFloor = { ...floor };
        const tableIndex = updatedFloor.tables?.findIndex(
          (t) => t._id === selectedElement
        );
        const poiIndex = updatedFloor.pointsOfInterest?.findIndex(
          (p) => p.id === selectedElement
        );
        const dIndex = updatedFloor.designPatterns?.findIndex(
          (d) => d.id === selectedElement
        );

        if (tableIndex !== undefined && tableIndex >= 0) {
          updatedFloor.tables[tableIndex] = {
            ...updatedFloor.tables[tableIndex],
            width: newWidth,
            height: newHeight,
          };
          onFloorUpdate(updatedFloor);
        } else if (poiIndex !== undefined && poiIndex >= 0) {
          updatedFloor.pointsOfInterest[poiIndex] = {
            ...updatedFloor.pointsOfInterest[poiIndex],
            width: newWidth,
            height: newHeight,
          };
          onFloorUpdate(updatedFloor);
        } else if (dIndex !== undefined && dIndex >= 0) {
          updatedFloor.designPatterns[dIndex] = {
            ...updatedFloor.designPatterns[dIndex],
            width: newWidth,
            height: newHeight,
          };
          onFloorUpdate(updatedFloor);
        }

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
        ...(floor?.tables || []),
        ...(floor?.pointsOfInterest || []),
        ...(floor?.designPatterns || []),
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
      newXPercent = Math.max(
        0,
        Math.min(100 - rotatedWidthPercent, newXPercent)
      );
      newYPercent = Math.max(
        0,
        Math.min(100 - rotatedHeightPercent, newYPercent)
      );

      // FIXED: Use the new onElementPositionUpdate if available
      if (onElementPositionUpdate) {
        onElementPositionUpdate(selectedElement, newXPercent, newYPercent);
      } else {
        // Fallback to old method (for backward compatibility)
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
          onFloorUpdate(updatedFloor);
        } else if (poiIndex >= 0) {
          updatedFloor.pointsOfInterest[poiIndex] = {
            ...updatedFloor.pointsOfInterest[poiIndex],
            xAxis: newXPercent,
            yAxis: newYPercent,
          };
          onFloorUpdate(updatedFloor);
        } else if (dIndex >= 0) {
          updatedFloor.designPatterns[dIndex] = {
            ...updatedFloor.designPatterns[dIndex],
            xAxis: newXPercent,
            yAxis: newYPercent,
          };
          onFloorUpdate(updatedFloor);
        }
      }
    },
    [
      isDragging,
      isResizing,
      selectedElement,
      floor,
      onFloorUpdate,
      onElementPositionUpdate,
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
      xAxis: table?.xAxis,
      yAxis: table?.yAxis,
      width: table?.width,
      height: table?.height,
      rotation: table?.rotation || 0,
    };

    await callApi("POST", "/tables/update", params, {
      onSuccess: (data) => {
        if (!UserData) return;
        
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
          ...(floor.tables || []),
          ...(floor.pointsOfInterest || []),
          ...(floor.designPatterns || []),
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
                // width: `${table.width}px`,
                // height: `${table.height}px`,
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
