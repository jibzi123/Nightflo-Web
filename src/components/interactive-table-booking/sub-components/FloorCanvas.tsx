import React, { useRef, useEffect, useState, useCallback } from "react";
import { Floor, Table, PointOfInterest } from "./../types";

interface FloorCanvasProps {
  floor: Floor;
  onFloorUpdate: (floor: Floor) => void;
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  backgroundScale: number;
  backgroundPosition: { x: number; y: number };
  viewMode: "admin" | "client";
  // onTableBooking: (tableId: string) => void;
  setActiveTab: React.Dispatch<
    React.SetStateAction<"floors" | "tables" | "settings">
  >;
}

const FloorCanvas: React.FC<FloorCanvasProps> = ({
  floor,
  onFloorUpdate,
  selectedElement,
  onElementSelect,
  backgroundScale,
  backgroundPosition,
  viewMode,
  // onTableBooking,
  setActiveTab,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  const handleElementMouseDown = useCallback(
    (
      e: React.MouseEvent,
      elementId: string | any,
      elementType: "table" | "poi"
    ) => {
      e.preventDefault();
      e.stopPropagation();

      if (viewMode === "client" && elementType === "table") {
        onElementSelect(elementId);
        return;
      }

      if (viewMode === "client") return;

      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();

      if (!canvasRect) return;

      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      setIsDragging(true);
      setActiveTab("tables");
      onElementSelect(elementId);
    },
    [onElementSelect]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!selectedElement) return;

      const element = [...floor?.tables].find(
        (el) => el.id === selectedElement
      );
      if (!element) return;

      setIsResizing(true);
      setResizeHandle(handle);
      setInitialSize({ width: element.width, height: element.height });
      setInitialMousePos({ x: e.clientX, y: e.clientY });
    },
    [selectedElement, floor]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (viewMode === "client") return;

      if (!selectedElement || !canvasRef.current) return;

      if (isResizing && resizeHandle) {
        const deltaX = e.clientX - initialMousePos.x;
        const deltaY = e.clientY - initialMousePos.y;

        let newWidth = initialSize.width;
        let newHeight = initialSize.height;

        switch (resizeHandle) {
          case "se":
            newWidth = Math.max(30, initialSize.width + deltaX);
            newHeight = Math.max(20, initialSize.height + deltaY);
            break;
          case "sw":
            newWidth = Math.max(30, initialSize.width - deltaX);
            newHeight = Math.max(20, initialSize.height + deltaY);
            break;
          case "ne":
            newWidth = Math.max(30, initialSize.width + deltaX);
            newHeight = Math.max(20, initialSize.height - deltaY);
            break;
          case "nw":
            newWidth = Math.max(30, initialSize.width - deltaX);
            newHeight = Math.max(20, initialSize.height - deltaY);
            break;
        }

        const updatedFloor = { ...floor };
        if (updatedFloor) {
        }
        const tableIndex = updatedFloor.tables.findIndex(
          (t) => t.id === selectedElement
        );
        // const poiIndex = updatedFloor.pointsOfInterest.findIndex(
        //   (p) => p.id === selectedElement
        // );

        if (tableIndex >= 0) {
          updatedFloor.tables[tableIndex] = {
            ...updatedFloor.tables[tableIndex],
            width: newWidth,
            height: newHeight,
          };
        }
        //  else if (poiIndex >= 0) {
        //   updatedFloor.pointsOfInterest[poiIndex] = {
        //     ...updatedFloor.pointsOfInterest[poiIndex],
        //     width: newWidth,
        //     height: newHeight,
        //   };
        // }

        onFloorUpdate(updatedFloor);
        return;
      }

      if (!isDragging) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      // Snap to grid
      const gridSize = 10;
      const snappedX = Math.round(newX / gridSize) * gridSize;
      const snappedY = Math.round(newY / gridSize) * gridSize;

      const updatedFloor = { ...floor };
      const tableIndex = updatedFloor.tables.findIndex(
        (t) => t.id === selectedElement
      );
      // const poiIndex = updatedFloor.pointsOfInterest.findIndex(
      //   (p) => p.id === selectedElement
      // );

      if (tableIndex >= 0) {
        updatedFloor.tables[tableIndex] = {
          ...updatedFloor.tables[tableIndex],
          x: Math.max(0, snappedX),
          y: Math.max(0, snappedY),
        };
      }
      // else if (poiIndex >= 0) {
      //   updatedFloor.pointsOfInterest[poiIndex] = {
      //     ...updatedFloor.pointsOfInterest[poiIndex],
      //     x: Math.max(0, snappedX),
      //     y: Math.max(0, snappedY),
      //   };
      // }

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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        onElementSelect(null);
      }
    },
    [onElementSelect]
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vip":
        return "👑";
      case "premium":
        return "⭐";
      default:
        return "🪑";
    }
  };
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
          backgroundSize: `${backgroundScale * 100}%`,
          backgroundPosition: `${backgroundPosition.x}px ${backgroundPosition.y}px`,
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
        {floor?.tables?.map((table) => (
          <div
            key={table.id}
            className={`table-element ${table.status} ${
              selectedElement === table.id ? "selected" : ""
            } ${table.tableType} ${viewMode === "client" ? "client-mode" : ""}`}
            style={{
              left: table.x,
              top: table.y,
              width: table.width,
              height: table.height,
              transform: `rotate(${table.rotation}deg)`,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, table?.id, "table")}
            title={
              viewMode === "client" && table.description[0]
                ? table.description[0]
                : undefined
            }
          >
            <div className="table-content">
              <div className="table-header">
                <span className="table-category-icon">
                  {getCategoryIcon(table.tableType)}
                </span>
                <span className="table-name">{table.tableNumber}</span>
              </div>
              <div className="table-details">
                <div className="table-capacity">👥 {table.capacity}</div>
                <div className="table-price">Dh {table.price}</div>
              </div>
            </div>

            {selectedElement === table.id && viewMode === "admin" && (
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
        ))}

        {/* Points of Interest
        {floor?.pointsOfInterest?.map((poi) => (
          <div
            key={poi.id}
            className={`poi-element ${
              selectedElement === poi.id ? "selected" : ""
            }`}
            style={{
              left: poi.x,
              top: poi.y,
              width: poi.width,
              height: poi.height,
              transform: `rotate(${poi.rotation}deg)`,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, poi.id, "poi")}
          >
            <span>{poi.name}</span>

            {selectedElement === poi.id && viewMode === "admin" && (
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
        ))} */}
      </div>
    </div>
  );
};

export default FloorCanvas;
