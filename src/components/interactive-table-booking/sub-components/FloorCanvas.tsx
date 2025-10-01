import React, { useRef, useEffect, useState, useCallback } from "react";
import { Floor, UserData } from "./../types";
import { useApi } from "../../../utils/custom-hooks/useApi";
import { Users, DollarSign, Clock } from "lucide-react";
import { Tooltip } from "antd";

interface FloorCanvasProps {
  floor: Floor;
  onFloorUpdate: (floor: Floor) => void;
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  backgroundScale: number;
  backgroundPosition: { x: number; y: number };
  setActiveTab: React.Dispatch<
    React.SetStateAction<"floors" | "tables" | "settings">
  >;
  fetchFloorsAndTables: (id: string) => void;
}

const FloorCanvas: React.FC<FloorCanvasProps> = ({
  floor,
  onFloorUpdate,
  selectedElement,
  onElementSelect,
  backgroundScale,
  backgroundPosition,
  setActiveTab,
  fetchFloorsAndTables,
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
      elementType: "table" | "poi"
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

      const element = floor?.tables.find((el) => el.id === selectedElement);
      console.log(element, "element");
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
        if (!updatedFloor.tables) return;

        const tableIndex = updatedFloor.tables.findIndex(
          (t) => t.id === selectedElement
        );

        if (tableIndex >= 0) {
          updatedFloor.tables[tableIndex] = {
            ...updatedFloor.tables[tableIndex],
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
      const newXPercent = Math.max(0, (newX / canvasWidth) * 100);
      const newYPercent = Math.max(0, (newY / canvasHeight) * 100);

      const updatedFloor = { ...floor };
      if (!updatedFloor.tables) return;

      const tableIndex = updatedFloor.tables.findIndex(
        (t) => t.id === selectedElement
      );

      if (tableIndex >= 0) {
        updatedFloor.tables[tableIndex] = {
          ...updatedFloor.tables[tableIndex],
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
    // const countRes = await callApi(
    //   "GET",
    //   `/tables/countByFloor?floorId=${floor.id}`
    // );
    // const tableCount = countRes?.payLoad?.count + 1 ?? 1;

    const params = {
      tableId: table?.id,
      tableNumber: table.tableNumber,
      floorId: table?.floor.id,
      price: table.price,
      capacity: table.capacity,
      tableCount: table.tableCount,
      description: table.description,
      status: table?.status,
      xAxis: table?.xAxis,
      yAxis: table?.yAxis,
      width: table?.width,
      height: table?.height,
    };
    await callApi("POST", "/tables/update", params, {
      onSuccess: (data) => {
        if (!UserData) return;
        // setTimeout(() => {
        //   fetchFloorsAndTables(UserData?.club.id);
        // }, 300);
      },
      onError: (err) => console.error("Error:", err),
    });
  };
  // New: handleMouseUp now logs final percent coords and includes API comment
  const handleMouseUp = useCallback(
    (e?: MouseEvent) => {
      if (!floor.tables) return;

      if (isDragging && selectedElement && floor) {
        const table = floor.tables.find((t) => t.id === selectedElement);
        if (table) {
          // table.x and table.y are stored as relative (0..1). Convert to percent for logging.
          const xPercent = Math.round((table.xAxis ?? 0) * 10000) / 100; // 2 decimals
          const yPercent = Math.round((table.yAxis ?? 0) * 10000) / 100;
          console.log(
            `Drag end for table ${selectedElement}: x=${xPercent}% y=${yPercent}%`
          );

          handleUpdateTable(table);
        }
      }

      if (isResizing && selectedElement && floor) {
        const table = floor.tables.find((t) => t.id === selectedElement);
        if (table) {
          const w = table.width;
          const h = table.height;
          console.log(
            `Resize end for table ${selectedElement}: width=${w} height=${h}`
          );

          handleUpdateTable(table);
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
          const left = table.xAxis; // already in %
          const top = table.yAxis; // already in %

          return (
            <div
              key={table.id}
              className={`table-element ${table.status} ${
                selectedElement === table.id ? "selected" : ""
              } ${table.tableType}`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${table.width}px`,
                height: `${table.height}px`,
                transform: `rotate(${table.rotation}deg)`,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, table?.id, "table")}
            >
              <div className="table-content">
                <div className="table-header">
                  <span className="table-name">{table.tableNumber}</span>
                </div>
                <div
                  className="table-details"
                  style={{ display: "flex", gap: "5px" }}
                >
                  {/* Capacity */}
                  <div
                    className="table-capacity"
                    style={{ textAlign: "center" }}
                  >
                    <Users
                      style={{ width: "15px", height: "20px" }}
                      color="#1E90FF"
                    />
                    <div style={{ padding: "4px" }}>{table.capacity}</div>
                  </div>

                  {/* Price */}
                  <div className="table-price" style={{ textAlign: "center" }}>
                    <DollarSign
                      style={{ width: "15px", height: "20px" }}
                      color="#cae04bff"
                    />
                    <div style={{ padding: "4px" }}>Dh {table.price}</div>
                  </div>

                  {/* Time */}
                  <div className="table-time" style={{ textAlign: "center" }}>
                    <Clock
                      style={{ width: "15px", height: "20px" }}
                      color="#ff6347"
                    />
                    <div>45</div>
                  </div>
                </div>
              </div>

              {selectedElement === table.id && (
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
