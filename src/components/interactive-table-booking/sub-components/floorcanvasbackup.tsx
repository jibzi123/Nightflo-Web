import React, { useRef, useEffect, useState, useCallback } from "react";
import { Floor } from "./../types";

interface FloorCanvasProps {
  floor: Floor;
  onFloorUpdate: (floor: Floor) => void;
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  backgroundScale: number;
  backgroundPosition: { x: number; y: number };
  viewMode: "admin" | "client";
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
  setActiveTab,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  const getCanvasSize = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { width: rect?.width ?? 1, height: rect?.height ?? 1 };
  };

  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string, elementType: "table" | "poi") => {
      e.preventDefault();
      e.stopPropagation();

      if (viewMode === "client" && elementType === "table") {
        onElementSelect(elementId);
        return;
      }

      if (viewMode === "client") return;

      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      setIsDragging(true);
      setActiveTab("tables");
      onElementSelect(elementId);
    },
    [onElementSelect, viewMode, setActiveTab]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!selectedElement) return;

      const element = floor?.tables.find((el) => el.id === selectedElement);
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

      const { width: canvasWidth, height: canvasHeight } = getCanvasSize();
      if (isResizing && resizeHandle) {
        const deltaX = e.clientX - initialMousePos.x;
        const deltaY = e.clientY - initialMousePos.y;

        let newWidth = initialSize.width * canvasWidth;
        let newHeight = initialSize.height * canvasHeight;

        switch (resizeHandle) {
          case "se":
            newWidth = Math.max(30, newWidth + deltaX);
            newHeight = Math.max(20, newHeight + deltaY);
            break;
          case "sw":
            newWidth = Math.max(30, newWidth - deltaX);
            newHeight = Math.max(20, newHeight + deltaY);
            break;
          case "ne":
            newWidth = Math.max(30, newWidth + deltaX);
            newHeight = Math.max(20, newHeight - deltaY);
            break;
          case "nw":
            newWidth = Math.max(30, newWidth - deltaX);
            newHeight = Math.max(20, newHeight - deltaY);
            break;
        }

        const updatedFloor = { ...floor };
        const tableIndex = updatedFloor.tables.findIndex(
          (t) => t.id === selectedElement
        );

        if (tableIndex >= 0) {
          updatedFloor.tables[tableIndex] = {
            ...updatedFloor.tables[tableIndex],
            width: newWidth / canvasWidth,
            height: newHeight / canvasHeight,
          };
        }

        onFloorUpdate(updatedFloor);
        return;
      }

      if (!isDragging) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      const newXPercent = Math.max(0, newX / canvasWidth);
      const newYPercent = Math.max(0, newY / canvasHeight);
      const updatedFloor = { ...floor };
      const tableIndex = updatedFloor.tables.findIndex(
        (t) => t.id === selectedElement
      );

      if (tableIndex >= 0) {
        updatedFloor.tables[tableIndex] = {
          ...updatedFloor.tables[tableIndex],
          x: newXPercent,
          y: newYPercent,
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
      viewMode,
    ]
  );
  const normalizeValue = (val: number, size: number) => {
    // if value > 1, it's in px → convert to %.
    return val > 1 ? val / size : val;
  };
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
        {floor?.tables?.map((table) => {
          const { width, height } = getCanvasSize();

          const left = normalizeValue(table.x, width) * 100;
          const top = normalizeValue(table.y, height) * 100;
          const w = normalizeValue(table.width, width) * 100;
          const h = normalizeValue(table.height, height) * 100;
          console.log("canvas table", {
            x: table.x,
            y: table.y,
            width,
            height,
          });
          return (
            <div
              key={table.id}
              className={`table-element ${table.status} ${
                selectedElement === table.id ? "selected" : ""
              } ${table.tableType} ${
                viewMode === "client" ? "client-mode" : ""
              }`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${w}%`,
                height: `${h}%`,
                transform: `rotate(${table.rotation}deg)`,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, table?.id, "table")}
              title={
                viewMode === "client" && table.description?.[0]
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
          );
        })}
      </div>
    </div>
  );
};

export default FloorCanvas;
