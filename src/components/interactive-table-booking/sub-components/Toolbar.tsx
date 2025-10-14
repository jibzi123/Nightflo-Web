import React from "react";
import { Hand, Minus, Check, X } from "lucide-react";

interface FloorToolbarProps {
  drawingMode: "select" | "wall" | string;
  setDrawingMode: (mode: string) => void;
  wallThickness: number;
  setWallThickness: (value: number) => void;
  isDrawingWall: boolean;
  handleFinishWall: () => void;
  handleCancelWall: () => void;
  wallPoints: { x: number; y: number }[];
  wallStyle?: "solid" | "dotted" | "dashed";
  setWallStyle?: (style: "solid" | "dotted" | "dashed") => void;
}

const FloorToolbar: React.FC<FloorToolbarProps> = ({
  drawingMode,
  setDrawingMode,
  wallThickness,
  setWallThickness,
  isDrawingWall,
  handleFinishWall,
  handleCancelWall,
  wallPoints,
  wallStyle = "solid",
  setWallStyle,
}) => {
  const buttonStyle = (active?: boolean): React.CSSProperties => ({
    padding: "8px 12px",
    background: active ? "#10b981" : "#2d2d2d",
    color: active ? "#ffffff" : "#9ca3af",
    border: "1px solid #3d3d3d",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    boxShadow: active ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none",
    whiteSpace: "nowrap",
  });

  const iconButtonStyle = (active?: boolean): React.CSSProperties => ({
    padding: "10px",
    background: active ? "#10b981" : "#2d2d2d",
    color: active ? "#ffffff" : "#9ca3af",
    border: "1px solid #3d3d3d",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: active ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none",
    minWidth: "38px",
    minHeight: "38px",
  });

  const sliderContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#2d2d2d",
    padding: "4px 12px",
    borderRadius: "6px",
    border: "1px solid #3d3d3d",
  };

  return (
    <div
      style={{
        width: "100%",
        zIndex: 100,
        background: "#1a1a1a",
        padding: "10px 14px",
        borderBottom: "1px solid #2d2d2d",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* Select Mode Button */}
      <button
        onClick={() => {
          console.log("🔄 Switched to Select mode");
          setDrawingMode("select");
        }}
        style={iconButtonStyle(drawingMode === "select")}
        title="Select Mode (Esc)"
        aria-pressed={drawingMode === "select"}
      >
        <Hand size={18} />
      </button>

      {/* Wall Drawing Button */}
      <button
        onClick={() => {
          console.log("🔄 Switched to Wall Drawing mode");
          setDrawingMode("wall");
        }}
        style={iconButtonStyle(drawingMode === "wall")}
        title="Draw Wall"
        aria-pressed={drawingMode === "wall"}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      </button>

      {/* Divider */}
      {drawingMode === "wall" && (
        <div
          style={{
            width: "1px",
            height: "32px",
            background: "#3d3d3d",
          }}
        />
      )}

      {/* Wall Thickness Control */}
      {drawingMode === "wall" && (
        <div style={sliderContainerStyle}>
          <label
            style={{ color: "#d1d5db", fontSize: "10px", fontWeight: 600 }}
          >
            THICKNESS
          </label>
          <input
            type="range"
            min={0.5}
            max={8}
            step={0.5}
            value={wallThickness}
            onChange={(e) => {
              const newVal = parseFloat(e.target.value);
              console.log("📏 Wall thickness changed:", newVal);
              setWallThickness(newVal);
            }}
            style={{
              width: "100px",
              height: "4px",
              background: "#3d3d3d",
              borderRadius: "2px",
              outline: "none",
              cursor: "pointer",
            }}
          />
          <span
            style={{
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              minWidth: "20px",
              textAlign: "center",
            }}
          >
            {wallThickness}
          </span>
        </div>
      )}

      {/* Line Style Selection */}
      {drawingMode === "wall" && setWallStyle && (
        <div style={sliderContainerStyle}>
          <label
            style={{ color: "#d1d5db", fontSize: "10px", fontWeight: 600 }}
          >
            STYLE
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            {/* Solid Line */}
            <button
              onClick={() => setWallStyle("solid")}
              style={{
                ...iconButtonStyle(wallStyle === "solid"),
                padding: "8px",
                minWidth: "36px",
                minHeight: "36px",
              }}
              title="Solid Line"
            >
              <Minus size={16} strokeWidth={3} />
            </button>

            {/* Dotted Line */}
            <button
              onClick={() => setWallStyle("dotted")}
              style={{
                ...iconButtonStyle(wallStyle === "dotted"),
                padding: "8px",
                minWidth: "36px",
                minHeight: "36px",
              }}
              title="Dotted Line"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <line
                  x1="4"
                  y1="12"
                  x2="20"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="2,3"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Dashed Line */}
            <button
              onClick={() => setWallStyle("dashed")}
              style={{
                ...iconButtonStyle(wallStyle === "dashed"),
                padding: "8px",
                minWidth: "36px",
                minHeight: "36px",
              }}
              title="Dashed Line"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <line
                  x1="4"
                  y1="12"
                  x2="20"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons when Drawing */}
      {isDrawingWall && (
        <>
          <div
            style={{
              width: "1px",
              height: "32px",
              background: "#3d3d3d",
            }}
          />

          <button
            onClick={handleFinishWall}
            style={{
              ...buttonStyle(),
              background: "#3b82f6",
              color: "#ffffff",
              border: "1px solid #60a5fa",
            }}
            title="Finish Wall (Enter / Double Click)"
          >
            <Check size={14} />
            <span>Finish</span>
          </button>

          <button
            onClick={handleCancelWall}
            style={{
              ...buttonStyle(),
              background: "#ef4444",
              color: "#ffffff",
              border: "1px solid #f87171",
            }}
            title="Cancel Drawing (Esc)"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>

          {/* Info Display */}
          <div
            style={{
              padding: "4px 12px",
              background: "#2d2d2d",
              borderRadius: "6px",
              border: "1px solid #3d3d3d",
              color: "#9ca3af",
              fontSize: "10px",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <span
              style={{ color: "#10b981", fontWeight: 700, fontSize: "11px" }}
            >
              {wallPoints.length} Pts
            </span>
            <span>|</span>
            <span>
              <kbd
                style={{
                  background: "#3d3d3d",
                  padding: "2px 5px",
                  borderRadius: "3px",
                  fontSize: "9px",
                  fontWeight: 600,
                }}
              >
                Shift
              </kbd>{" "}
              Grid
            </span>
            <span>|</span>
            <span>
              <kbd
                style={{
                  background: "#3d3d3d",
                  padding: "2px 5px",
                  borderRadius: "3px",
                  fontSize: "9px",
                  fontWeight: 600,
                }}
              >
                Ctrl
              </kbd>{" "}
              Angle
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default FloorToolbar;
