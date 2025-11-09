import React, { useRef, useEffect, useState, useCallback } from "react";
import { Floor, UserData, Wall } from "./../interactive-table-booking/types";
import { useApi } from "../../utils/custom-hooks/useApi";
import FloorToolbar from "./Toolbar";
import GridOverlay from "./GridOverlay";
import { snapToAngle, snapToGrid } from "./SnapUtitilies";
import TablesLayer from "./TableLayer";
import POILayer from "./POILayer";

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
  onDeleteElement: (elementId: string) => void;
  onAddBoundaryWall: (walls: Wall[]) => void;
  onUndoWall: () => void;
  handleRotateTable: (tableId: string) => void;
}

const FloorCanvas: React.FC<FloorCanvasProps> = ({
  floor,
  onFloorUpdate,
  selectedElement,
  onElementSelect,
  setActiveTab,
  onElementPositionUpdate,
  onRotatePOI,
  onDeleteElement,
  onAddBoundaryWall,
  onUndoWall,
  handleRotateTable,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ xAxis: 0, yAxis: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

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
  const [wallThickness, setWallThickness] = useState<number>(2);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [wallStyle, setWallStyle] = useState<"solid" | "dotted" | "dashed">(
    "solid"
  );
  const [hoveredWall, setHoveredWall] = useState<string | null>(null);

  const getCanvasSize = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { width: rect?.width ?? 1, height: rect?.height ?? 1 };
  };

  const handleElementMouseDown = useCallback(
    (
      e: React.MouseEvent,
      elementId: string | any,
      elementType: "table" | "poi" | "wall"
    ) => {
      e.preventDefault();
      e.stopPropagation();

      onElementSelect(elementId);

      // Only set up dragging for tables and POIs
      if (elementType !== "wall") {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        setDragOffset({
          xAxis: e.clientX - rect.left,
          yAxis: e.clientY - rect.top,
        });

        setIsDragging(true);
      }
      setActiveTab(elementType === "table" ? "tables" : "pois");
    },
    [onElementSelect, setActiveTab]
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
      drawingMode,
      wallPoints,
    ]
  );

  const { callApi } = useApi();
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
          handleUpdateTable(table);
        }
      }

      if (isResizing && selectedElement && floor) {
        const element = [
          ...(floor.tables || []),
          ...(floor.pointsOfInterest || []),
        ].find((el) => el.id === selectedElement || el._id === selectedElement);

        if (element) {
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
    if (wallPoints.length < 2) {
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
        style: wallStyle,
      };
      newWalls.push(wall);
    }

    onAddBoundaryWall(newWalls);

    setWallPoints([]);
    setIsDrawingWall(false);
    setCurrentMousePos(null);
  }, [wallPoints, floor, onFloorUpdate, wallThickness, wallStyle]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return;

      // Check if click is directly on the canvas (not on any child element)
      const isClickOnCanvas = e.target === canvasRef.current;

      if (!isClickOnCanvas) return;

      const rect = canvasRef.current.getBoundingClientRect();
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;

      console.log("🖱️ Canvas Click:", {
        mode: drawingMode,
        x: x.toFixed(2),
        y: y.toFixed(2),
      });

      // Detect double-click
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastClickTime;
      setLastClickTime(currentTime);

      if (timeSinceLastClick < 300 && drawingMode === "wall" && isDrawingWall) {
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
        setWallPoints((prev) => [...prev, { x, y }]);
        setIsDrawingWall(true);
      } else if (drawingMode === "select") {
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
    setWallPoints([]);
    setIsDrawingWall(false);
    setCurrentMousePos(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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

  console.log("Selected Element:", selectedElement);

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
        handleUndoWall={onUndoWall}
        wallPoints={wallPoints}
        wallStyle={wallStyle}
        setWallStyle={setWallStyle}
        setIsDrawingWall={setIsDrawingWall}
        setWallPoints={setWallPoints}
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
          <GridOverlay />
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: drawingMode === "wall" ? "none" : "auto",
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            onClick={(e) => {
              // Check if click is on the SVG background (not on a wall)
              if (e.target === e.currentTarget) {
                e.stopPropagation();
                onElementSelect(null);
                console.log("✋ Deselecting elements via SVG");
              }
            }}
          >
            {floor?.boundaryWalls?.map((wall) => {
              const strokeDasharray =
                wall.style === "dotted"
                  ? "2,3"
                  : wall.style === "dashed"
                  ? "6,4"
                  : undefined;
              const isSelected = selectedElement === wall.id;
              const isHovered = hoveredWall === wall.id;
              return (
                <g key={wall.id}>
                  {/* Clickable invisible line for easier interaction */}
                  <line
                    x1={wall.startX}
                    y1={wall.startY}
                    x2={wall.endX}
                    y2={wall.endY}
                    stroke="transparent"
                    strokeWidth={Math.max(wall.thickness * 3, 10)}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    style={{
                      pointerEvents: drawingMode === "wall" ? "none" : "auto",
                      cursor: drawingMode === "wall" ? "default" : "pointer",
                    }}
                    onClick={(e) => {
                      if (drawingMode !== "wall") {
                        e.stopPropagation();
                        e.preventDefault();
                        onElementSelect(wall.id);
                        console.log("Wall selected:", wall.id);
                      }
                    }}
                    onMouseEnter={() => {
                      if (drawingMode !== "wall") {
                        setHoveredWall(wall.id);
                      }
                    }}
                    onMouseLeave={() => {
                      if (drawingMode !== "wall") {
                        setHoveredWall(null);
                      }
                    }}
                  />

                  {/* Actual visible wall */}
                  <line
                    x1={wall.startX}
                    y1={wall.startY}
                    x2={wall.endX}
                    y2={wall.endY}
                    stroke={
                      isSelected && drawingMode !== "wall"
                        ? "#10b981"
                        : isHovered && drawingMode !== "wall"
                        ? "#60a5fa"
                        : wall.color
                    }
                    strokeWidth={wall.thickness}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ pointerEvents: "none" }}
                  />

                  {/* Selection indicator - hidden in drawing mode */}
                  {selectedElement &&
                    selectedElement === wall.id &&
                    drawingMode !== "wall" && (
                      <>
                        <circle
                          cx={wall.startX}
                          cy={wall.startY}
                          r={0.75}
                          fill="#10b981"
                        />
                        <circle
                          cx={wall.endX}
                          cy={wall.endY}
                          r={0.75}
                          fill="#10b981"
                        />
                      </>
                    )}
                </g>
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

          {/* Delete button for selected wall - positioned correctly */}
          {selectedElement &&
            drawingMode !== "wall" &&
            floor?.boundaryWalls?.find((w) => w.id === selectedElement) && (
              <div
                style={{
                  position: "absolute",
                  left: `${
                    (floor?.boundaryWalls.find((w) => w.id === selectedElement)!
                      .startX +
                      floor?.boundaryWalls.find((w) => w.id === selectedElement)!
                        .endX) /
                    2
                  }%`,
                  top: `${
                    (floor?.boundaryWalls.find((w) => w.id === selectedElement)!
                      .startY +
                      floor?.boundaryWalls.find((w) => w.id === selectedElement)!
                        .endY) /
                    2
                  }%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 100,
                  pointerEvents: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteElement(selectedElement);
                    onElementSelect(null);
                  }}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "2px solid #ef4444",
                    background: "#1f2937",
                    color: "#ef4444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    padding: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#ef4444";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#1f2937";
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  title="Delete Wall"
                >
                  ×
                </button>
              </div>
            )}

          <TablesLayer
            floor={floor}
            selectedElement={selectedElement}
            handleElementMouseDown={handleElementMouseDown}
            handleRotateTable={handleRotateTable}
            onDeleteElement={onDeleteElement}
          />
          <POILayer
            floor={floor}
            selectedElement={selectedElement}
            handleElementMouseDown={handleElementMouseDown}
            onRotatePOI={onRotatePOI}
            onDeleteElement={onDeleteElement}
          />
        </div>
      </div>
    </>
  );
};

export default FloorCanvas;
