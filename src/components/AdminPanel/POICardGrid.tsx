import React, { useState } from "react";
import {
  CardItem,
  NewPoiData,
  PointOfInterest,
} from "../interactive-table-booking/types";

import CircularBarIcon from "./../../assets/toolbar-icons/Circular Bar.svg";
import DanceFloorIcon from "./../../assets/toolbar-icons/Dance Floor.svg";
import DJBoothIcon from "./../../assets/toolbar-icons/DJ Booth.svg";
import DoubleSofaIcon from "./../../assets/toolbar-icons/Double Sofa.svg";
import HelpDeskIcon from "./../../assets/toolbar-icons/Help Desk.svg";
import MainBarIcon from "./../../assets/toolbar-icons/Main Bar.svg";
import MainEntranceIcon from "./../../assets/toolbar-icons/Main Entrance.svg";
import MiniBarIcon from "./../../assets/toolbar-icons/Mini Bar.svg";
import RectangularPillarIcon from "./../../assets/toolbar-icons/Rectangular Pillar.svg";
import RoundPillarIcon from "./../../assets/toolbar-icons/Round Pillar.svg";
import SingleDoorIcon from "./../../assets/toolbar-icons/Single Door.svg";
import SingleSofaIcon from "./../../assets/toolbar-icons/Single Sofa.svg";
import TripleSofaIcon from "./../../assets/toolbar-icons/Triple Sofa.svg";
import StairsIcon from "./../../assets/toolbar-icons/Stairs.svg";
import WashroomIcon from "./../../assets/toolbar-icons/Washroom.svg";

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
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const cards: CardItem[] = [
    {
      type: "main-bar",
      label: "Main Bar",
      width: 100,
      height: 56,
      icon: MainBarIcon,
    },
    {
      type: "mini-bar",
      label: "Mini Bar",
      width: 110,
      height: 45,
      icon: MiniBarIcon,
    },
    {
      type: "circular-bar",
      label: "Circular Bar",
      width: 85,
      height: 90,
      icon: CircularBarIcon,
    },
    {
      type: "dj-booth",
      label: "DJ Booth",
      width: 155,
      height: 50,
      icon: DJBoothIcon,
    },
    {
      type: "dancing-floor",
      label: "Dancing Floor",
      width: 200,
      height: 200,
      icon: DanceFloorIcon,
    },
    {
      type: "front-desk",
      label: "Front Desk",
      width: 90,
      height: 55,
      icon: HelpDeskIcon,
    },
    {
      type: "double-sofa",
      label: "Double Sofa",
      width: 70,
      height: 40,
      icon: DoubleSofaIcon,
    },
    {
      type: "single-sofa",
      label: "Single Sofa",
      width: 48,
      height: 42,
      icon: SingleSofaIcon,
    },
    {
      type: "triple-sofa",
      label: "Triple Sofa",
      width: 90,
      height: 40,
      icon: TripleSofaIcon,
    },
    {
      type: "round-pillar",
      label: "Round Pillar",
      width: 30,
      height: 30,
      icon: RoundPillarIcon,
    },
    {
      type: "rectangle-pillar",
      label: "Rectangular Pillar",
      width: 30,
      height: 30,
      icon: RectangularPillarIcon,
    },
    {
      type: "main-entrance",
      label: "Main Entrance",
      width: 80,
      height: 56,
      icon: MainEntranceIcon,
    },
    {
      type: "single-door",
      label: "Single Door",
      width: 60,
      height: 65,
      icon: SingleDoorIcon,
    },
    {
      type: "stairs",
      label: "Stairs",
      width: 70,
      height: 70,
      icon: StairsIcon,
    },
    {
      type: "washroom",
      label: "Washroom",
      width: 158,
      height: 60,
      icon: WashroomIcon,
    },
  ];

  const handleCardDoubleClick = (item: CardItem) => {
    setSelectedType(item.type);

    const newPOI = {
      name: item.label,
      type: item.type as PointOfInterest["type"],
      width: item.width,
      height: item.height,
    };
    setNewPoiData({ ...newPOI });
    setTimeout(() => onAddPOI(newPOI), 0);
  };

  return (
    <div className="cards-grid grid grid-cols-3 gap-3">
      {cards.map((item) => {
        const isSelected = selectedType === item.type;
        return (
          <button
            key={item.type}
            className={`item-card flex flex-col items-center justify-center rounded-lg p-3 border transition-all duration-200
    ${isSelected ? "selected" : ""}`}
            onDoubleClick={() => handleCardDoubleClick(item)}
          >
            <img
              src={item.icon}
              alt={item.label}
              className="w-10 h-10 mb-2 transition-all duration-200 icon"
            />
            <span className="text-sm text-center label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default POICardGrid;
