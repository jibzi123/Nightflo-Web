import React from "react";
import { TableIcons } from "../../utils/canvasIcons";
import ElementControlButtons from "./ElementControlButtons";
import { Floor } from "../interactive-table-booking/types";
import { getTableProperties } from "./SnapUtitilies";

interface TablesLayerProps {
  floor: Floor;
  selectedElement: string | null;
  handleElementMouseDown: (
    e: React.MouseEvent,
    id: string,
    type: "table"
  ) => void;
  handleRotateTable: (id: string) => void;
  onDeleteElement: (id: string) => void;
}
const TablesLayer: React.FC<TablesLayerProps> = ({
  floor,
  selectedElement,
  handleElementMouseDown,
  handleRotateTable,
  onDeleteElement,
}) => {
  return (
    <div>
      {floor?.tables?.map((table) => {
        const { icon, width, height } = getTableProperties(table);

        const isSelected = selectedElement === table._id;
        const rotation = table.rotation || 90;
        // Check if POI is vertical (90° or 270°)
        const isVertical = rotation === 90 || rotation === 270;
        return (
          <div
            key={table._id}
            className={`table-element ${table.status} ${
              selectedElement === table._id ? "selected" : ""
            }`}
            style={{
              left: `${table.xAxis}%`,
              top: `${table.yAxis}%`,
              transform: `rotate(${rotation}deg)`,
              position: "absolute",
              zIndex: 20,
              pointerEvents: "auto",
            }}
            onMouseDown={(e) => {
              e.stopPropagation(); // Prevent canvas click event

              handleElementMouseDown(e, table._id, "table");
            }}
          >
            <img
              src={icon}
              alt="table icon"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                objectFit: "contain",
                pointerEvents: "none",
              }}
            />
            {selectedElement && selectedElement === table._id && (
              <ElementControlButtons
                isVertical={isVertical}
                selectedElement={table._id}
                onRotate={handleRotateTable}
                onDelete={onDeleteElement}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TablesLayer;
