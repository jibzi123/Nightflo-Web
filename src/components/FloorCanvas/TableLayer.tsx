import React from "react";
import { TableIcons } from "../../utils/canvasIcons";
import ElementControlButtons from "./ElementControlButtons";
import { Floor } from "../interactive-table-booking/types";

interface TablesLayerProps {
  floor: Floor;
  selectedElement: string | null;
  handleElementMouseDown: (e: React.MouseEvent, id: string, type: "table") => void;
  handleRotateTable: (id: string) => void;
  onDeleteElement: (id: string) => void;
}

function getTableIcon(table) {
  if (!table) return TableIcons.default;
  const isReserved = table.status === "reserved";
  const suffix = isReserved ? "_reserved" : "";
  let iconKey = "default";
  if (table.tableType === "circle") {
    if (table.capacity <= 2) iconKey = `t2_round${suffix}`;
    else if (table.capacity <= 4) iconKey = `t4_round${suffix}`;
  } else if (table.tableType === "box") {
    if (table.capacity <= 4) iconKey = `t4_box${suffix}`;
    else if (table.capacity <= 8) iconKey = `t8_box${suffix}`;
  }
  return TableIcons[iconKey] || TableIcons.default;
}

const TablesLayer: React.FC<TablesLayerProps> = ({
  floor,
  selectedElement,
  handleElementMouseDown,
  handleRotateTable,
  onDeleteElement,
}) => {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
      {floor?.tables?.map((table) => {
        const icon = getTableIcon(table);
        const isSelected = selectedElement === table._id;
        const rotation = table.rotation || 0;
        const isVertical = rotation === 90 || rotation === 270;

        return (
          <div
            key={table._id}
             className={`table-element ${table.status} ${
                  selectedElement === table._id ? "selected" : ""
                }`}
            style={{
              position: "absolute",
              left: `${table.xAxis}%`,
              top: `${table.yAxis}%`,
              width: `${table.width}px`,
              height: `${table.height}px`,
              transform: `rotate(${rotation}deg)`,
              zIndex: 20,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, table._id, "table")}
          >
            <img
              src={icon}
              alt="table"
              style={{ width: "100%", height: "100%", pointerEvents: "none" }}
            />
            {isSelected && (
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
