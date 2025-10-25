import React from "react";
import { POIIcons } from "../../utils/canvasIcons";
import ElementControlButtons from "./ElementControlButtons";
import { Floor } from "../interactive-table-booking/types";

interface POILayerProps {
  floor: Floor;
  selectedElement: string | null;
  handleElementMouseDown: (
    e: React.MouseEvent,
    id: string,
    type: "poi"
  ) => void;
  onRotatePOI: (id: string) => void;
  onDeleteElement: (id: string) => void;
}

const POILayer: React.FC<POILayerProps> = ({
  floor,
  selectedElement,
  handleElementMouseDown,
  onRotatePOI,
  onDeleteElement,
}) => {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
      {floor?.pointsOfInterest?.map((poi) => {
        const Icon = POIIcons[poi.type] || POIIcons.default;
        const isSelected = selectedElement === poi.id;
        const rotation = poi.rotation || 0;
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
            title={poi.name}
            onMouseDown={(e) => handleElementMouseDown(e, poi.id, "poi")}
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
            {isSelected && (
              <ElementControlButtons
                isVertical={isVertical}
                selectedElement={poi.id}
                onRotate={onRotatePOI}
                onDelete={onDeleteElement}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default POILayer;
