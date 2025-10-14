import React, { useRef, useEffect, useState, useCallback } from "react";
import { Floor, PointOfInterest, UserData, Wall } from "./../types";
import { useApi } from "../../../utils/custom-hooks/useApi";
import { POIIcons, TableIcons } from "../../../utils/canvasIcons";
import FloorToolbar from "./Toolbar";

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
  onRotatePOI: (poiId: string) => void;
  onDeletePOI: (poiId: string) => void;
}

const FloorCanvas: React.FC<FloorCanvasProps> = ({
  floor,
  onFloorUpdate,
  selectedElement,
  onElementSelect,
  setActiveTab,
  onElementPositionUpdate,
  onRotatePOI,
  onDeletePOI,
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

  // Wall drawing state
  const [drawingMode, setDrawingMode] = useState<"select" | "wall">("select");
  const [wallPoints, setWallPoints] = useState<Array<{ x: number; y: number }>>(
    []
  );
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [currentMousePos, setCurrentMousePos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [wallThickness, setWallThickness] = useState<number>(2); // Wall thickness control
  const [lastClickTime, setLastClickTime] = useState<number>(0); // For double-click detection
  const [wallStyle, setWallStyle] = useState<"solid" | "dotted" | "dashed">(
    "solid"
  );

  const getCanvasSize = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { width: rect?.width ?? 1, height: rect?.height ?? 1 };
  };

  // Snapping utilities
  const snapToGrid = (value: number, gridSize: number = 2.5) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const snapToAngle = (
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    snapAngles: number[] = [0, 45, 90, 135, 180]
  ) => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    let closestAngle = snapAngles[0];
    let minDiff = Math.abs(angle - closestAngle);

    for (const snapAngle of snapAngles) {
      const diff = Math.abs(angle - snapAngle);
      if (diff < minDiff) {
        minDiff = diff;
        closestAngle = snapAngle;
      }
    }

    const distance = Math.sqrt(dx * dx + dy * dy);
    const radians = closestAngle * (Math.PI / 180);

    return {
      x: startPoint.x + distance * Math.cos(radians),
      y: startPoint.y + distance * Math.sin(radians),
    };
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
      if (!canvasRef.current) return;

      // Handle wall drawing preview
      if (drawingMode === "wall" && wallPoints.length > 0) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setCurrentMousePos({ x, y });
      }

      if (!selectedElement) return;

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
        const tableIndex = updatedFloor.tables?.findIndex(
          (t) => t._id === selectedElement
        );
        const poiIndex = updatedFloor.pointsOfInterest?.findIndex(
          (p) => p.id === selectedElement
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
        }

        return;
      }

      if (!isDragging) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.xAxis;
      const newY = e.clientY - canvasRect.top - dragOffset.yAxis;

      let elementWidth = 0;
      let elementHeight = 0;

      const element = [
        ...(floor?.tables || []),
        ...(floor?.pointsOfInterest || []),
      ].find((el) => el.id === selectedElement || el._id === selectedElement);

      if (element) {
        elementWidth = element.width || 40;
        elementHeight = element.height || 40;
      }

      const elementWidthPercent = (elementWidth / canvasWidth) * 100;
      const elementHeightPercent = (elementHeight / canvasHeight) * 100;

      let newXPercent = (newX / canvasWidth) * 100;
      let newYPercent = (newY / canvasHeight) * 100;

      const rotation = element?.rotation || 0;

      const radians = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));

      const rotatedWidthPercent =
        elementWidthPercent * cos + elementHeightPercent * sin;
      const rotatedHeightPercent =
        elementWidthPercent * sin + elementHeightPercent * cos;

      newXPercent = Math.max(
        0,
        Math.min(100 - rotatedWidthPercent, newXPercent)
      );
      newYPercent = Math.max(
        0,
        Math.min(100 - rotatedHeightPercent, newYPercent)
      );

      if (onElementPositionUpdate) {
        onElementPositionUpdate(selectedElement, newXPercent, newYPercent);
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
      drawingMode,
      wallPoints,
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
  const handleFinishWall = useCallback(() => {
    console.log("🏁 Finishing wall drawing. Total points:", wallPoints.length);

    if (wallPoints.length < 2) {
      console.log("⚠️ Not enough points to create wall (minimum 2 required)");
      setWallPoints([]);
      setIsDrawingWall(false);
      setCurrentMousePos(null);
      return;
    }

    const newWalls: Wall[] = [];
    for (let i = 0; i < wallPoints.length - 1; i++) {
      const wall = {
        id: `wall_${Date.now()}_${i}`,
        startX: wallPoints[i].x,
        startY: wallPoints[i].y,
        endX: wallPoints[i + 1].x,
        endY: wallPoints[i + 1].y,
        thickness: wallThickness,
        color: "#ffffff",
        style: wallStyle, // Add this line
      };
      console.log(`🧱 Creating wall segment ${i + 1}:`, wall);
      newWalls.push(wall);
    }

    const updatedFloor = {
      ...floor,
      walls: [...(floor.walls || []), ...newWalls],
    };

    console.log(
      "✅ Wall created successfully. Total walls:",
      updatedFloor.walls.length
    );
    onFloorUpdate(updatedFloor);

    setWallPoints([]);
    setIsDrawingWall(false);
    setCurrentMousePos(null);
  }, [wallPoints, floor, onFloorUpdate, wallThickness]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      console.log(rect, "rect");
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;

      console.log("🖱️ Canvas Click:", {
        rect: rect,
        mode: drawingMode,
        x: x.toFixed(2),
        y: y.toFixed(2),
      });

      // Detect double-click
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastClickTime;
      setLastClickTime(currentTime);

      if (timeSinceLastClick < 300 && drawingMode === "wall" && isDrawingWall) {
        console.log("⏸️ Double-click detected - finishing wall");
        handleFinishWall();
        return;
      }

      // Apply grid snapping if Shift is held
      if (e.shiftKey) {
        const originalX = x;
        const originalY = y;
        x = snapToGrid(x);
        y = snapToGrid(y);
        console.log("📍 Grid Snap:", {
          from: { x: originalX.toFixed(2), y: originalY.toFixed(2) },
          to: { x: x.toFixed(2), y: y.toFixed(2) },
        });
      }

      // Apply angle snapping if Ctrl is held and we have a previous point
      if (e.ctrlKey && wallPoints.length > 0) {
        const originalX = x;
        const originalY = y;
        const snapped = snapToAngle(wallPoints[wallPoints.length - 1], {
          x,
          y,
        });
        x = snapped.x;
        y = snapped.y;
        console.log("📐 Angle Snap:", {
          from: { x: originalX.toFixed(2), y: originalY.toFixed(2) },
          to: { x: x.toFixed(2), y: y.toFixed(2) },
        });
      }

      if (drawingMode === "wall") {
        console.log("🧱 Adding wall point:", {
          x: x.toFixed(2),
          y: y.toFixed(2),
          totalPoints: wallPoints.length + 1,
        });
        setWallPoints((prev) => [...prev, { x, y }]);
        setIsDrawingWall(true);
      } else if (drawingMode === "select" && e.target === canvasRef.current) {
        console.log("✋ Deselecting elements");
        onElementSelect(null);
      }
    },
    [
      drawingMode,
      wallPoints,
      onElementSelect,
      lastClickTime,
      isDrawingWall,
      handleFinishWall,
    ]
  );

  const handleCancelWall = useCallback(() => {
    console.log(
      "❌ Canceling wall drawing. Points removed:",
      wallPoints.length
    );
    setWallPoints([]);
    setIsDrawingWall(false);
    setCurrentMousePos(null);
  }, [wallPoints]);

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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (drawingMode === "wall") {
        if (e.key === "Enter") {
          handleFinishWall();
        } else if (e.key === "Escape") {
          handleCancelWall();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [drawingMode, handleFinishWall, handleCancelWall]);

  function getTableIcon(table) {
    if (!table) return TableIcons.default;

    let icon;

    if (table.tableType === "circle") {
      if (table.capacity <= 2) icon = TableIcons["t2_round_indoor"];
      else if (table.capacity <= 4) icon = TableIcons["t4_round_indoor"];
      else if (table.capacity <= 6) icon = TableIcons["t6_box_indoor"];
      else if (table.capacity <= 8) icon = TableIcons["t8_box_indoor"];
      else icon = TableIcons["t4_box_indoor"];
    } else if (table.tableType === "box") {
      if (table.capacity <= 2) icon = TableIcons["t2_round_indoor"];
      else if (table.capacity <= 4) icon = TableIcons["t4_box_indoor"];
      else if (table.capacity <= 6) icon = TableIcons["t6_box_indoor"];
      else if (table.capacity <= 8) icon = TableIcons["t8_box_indoor"];
      else if (table.capacity <= 10) icon = TableIcons["t10_box_indoor"];
      else icon = TableIcons["t4_box_indoor"];
    } else {
      icon = TableIcons.default;
    }

    return icon;
  }

  return (
    <>
      <FloorToolbar
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        wallThickness={wallThickness}
        setWallThickness={setWallThickness}
        isDrawingWall={isDrawingWall}
        handleFinishWall={handleFinishWall}
        handleCancelWall={handleCancelWall}
        wallPoints={wallPoints}
        wallStyle={wallStyle}
        setWallStyle={setWallStyle}
      />
      <div className="canvas-container">
        <div
          ref={canvasRef}
          className="canvas"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          style={{
            backgroundImage: floor?.backgroundImage
              ? `url(${floor.backgroundImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            cursor: drawingMode === "wall" ? "crosshair" : "default",
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
                  stroke="#cfc2c2ff"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Walls Layer */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {floor?.walls?.map((wall) => {
              const strokeDasharray =
                wall.style === "dotted"
                  ? "2,3"
                  : wall.style === "dashed"
                  ? "6,4"
                  : undefined;
              return (
                <line
                  key={wall.id}
                  x1={wall.startX}
                  y1={wall.startY}
                  x2={wall.endX}
                  y2={wall.endY}
                  stroke={wall.color}
                  strokeWidth={wall.thickness}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {/* Wall drawing preview */}
            {isDrawingWall && (
              <>
                {/* Completed segments */}
                {wallPoints.map((point, index) => {
                  if (index === 0) return null;
                  return (
                    <line
                      key={`preview-${index}`}
                      x1={wallPoints[index - 1].x}
                      y1={wallPoints[index - 1].y}
                      x2={point.x}
                      y2={point.y}
                      stroke="#00ff00"
                      strokeWidth={wallThickness}
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray="2,2"
                    />
                  );
                })}

                {/* Line to current mouse position */}
                {currentMousePos && wallPoints.length > 0 && (
                  <line
                    x1={wallPoints[wallPoints.length - 1].x}
                    y1={wallPoints[wallPoints.length - 1].y}
                    x2={currentMousePos.x}
                    y2={currentMousePos.y}
                    stroke="#00ff00"
                    strokeWidth={wallThickness}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="2,2"
                    opacity={0.6}
                  />
                )}

                {/* Points */}
                {wallPoints.map((point, index) => (
                  <circle
                    key={`point-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={0.5}
                    fill="#00ff00"
                  />
                ))}
              </>
            )}
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
                onMouseDown={(e) =>
                  handleElementMouseDown(e, table._id, "table")
                }
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

          {floor?.pointsOfInterest?.map((poi) => {
            const Icon = POIIcons[poi.type] || POIIcons.default;
            const isSelected = selectedElement === poi.id;
            const rotation = poi.rotation || 0;

            // Check if POI is vertical (90° or 270°)
            const isVertical = rotation === 90 || rotation === 270;
            return (
              <div
                key={poi.id}
                className={`poi-element ${isSelected ? "selected" : ""}`}
                style={{
                  left: `${poi.xAxis}%`,
                  top: `${poi.yAxis}%`,
                  width: poi.width ? `${poi.width}px` : "",
                  height: poi.height ? `${poi.height}px` : "",
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

                {/* Control buttons - only show when selected */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: isVertical ? "-35px" : "-35px",
                      right: isVertical ? "50%" : "-5px",
                      left: isVertical ? "auto" : "auto",
                      // transform: isVertical
                      //   ? `translateX(50%) rotate(-${rotation}deg)`
                      //   : `rotate(-${rotation}deg)`,
                      display: "flex",
                      gap: "5px",
                      zIndex: 20,
                    }}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking buttons
                  >
                    {/* Rotate button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotatePOI(poi.id);
                      }}
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: "2px solid #10b981",
                        background: "#1f2937",
                        color: "#10b981",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        padding: 0,
                      }}
                      title="Rotate 90°"
                    >
                      ↻
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePOI(poi.id);
                      }}
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: "2px solid #ef4444",
                        background: "#1f2937",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        padding: 0,
                      }}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FloorCanvas;
