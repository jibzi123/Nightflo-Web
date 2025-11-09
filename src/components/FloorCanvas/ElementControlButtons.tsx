import React from "react";

interface ElementControlButtonsProps {
  isVertical: boolean;
  selectedElement: any;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
}

const ElementControlButtons: React.FC<ElementControlButtonsProps> = ({
  isVertical,
  selectedElement,
  onRotate,
  onDelete,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "-35px",
        right: isVertical ? "50%" : "-5px",
        left: isVertical ? "auto" : "auto",
        display: "flex",
        gap: "5px",
        zIndex: 20,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Rotate button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRotate(selectedElement);
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
          onDelete(selectedElement);
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
  );
};

export default ElementControlButtons;
