import React from "react";
import { CardItem, NewPoiData, PointOfInterest } from "../types";

interface POICardGridProps {
  setNewPoiData: (d: NewPoiData) => void;
  onAddPOI: (poiData: {
    name: string;
    type: string;
    width: number;
    height: number;
  }) => void;
}

const POICardGrid: React.FC<POICardGridProps> = ({
  setNewPoiData,
  onAddPOI,
}) => {
  const cards: CardItem[] = [
    { type: "main-bar", label: "Main Bar", width: 80, height: 70 },
    { type: "mini-bar", label: "Mini Bar", width: 80, height: 70 },
    { type: "circular-bar", label: "Circular Bar", width: 80, height: 70 },
    { type: "dj-booth", label: "DJ Booth", width: 80, height: 70 },
    { type: "dancing-floor", label: "Dancing Floor", width: 150, height: 150 },
    { type: "front-desk", label: "Front Desk", width: 80, height: 70 },
    { type: "double-sofa", label: "Double Sofa", width: 55, height: 55 },
    { type: "single-sofa", label: "Single Sofa", width: 40, height: 45 },
    { type: "triple-sofa", label: "Triple Sofa", width: 80, height: 70 },

    { type: "round-pillar", label: "Round Pillar", width: 20, height: 20 },
    {
      type: "rectangle-pillar",
      label: "Rectangular Pillar",
      width: 15,
      height: 15,
    },
    { type: "main-entrance", label: "Main Entrance", width: 80, height: 70 },
    { type: "single-door", label: "Single Door", width: 70, height: 70 },
    { type: "stairs", label: "Stairs", width: 80, height: 70 },
    { type: "washroom", label: "Washroom", width: 100, height: 70 },
  ];

  const handleCardDoubleClick = (item: CardItem) => {
    console.log("Card double-clicked:", item);
    const newPOI = {
      name: item.label,
      type: item.type as PointOfInterest["type"],
      width: item.width,
      height: item.height,
    };
    setNewPoiData({ ...newPOI });
    // Use setTimeout to ensure state is updated before handleAddPoi
    setTimeout(() => onAddPOI(newPOI), 0);
  };

  return (
    <div className="cards-grid">
      {cards.map((item) => (
        <button
          key={item.type}
          className="item-card"
          onDoubleClick={() => handleCardDoubleClick(item)}
        >
          <span className="item-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default POICardGrid;
