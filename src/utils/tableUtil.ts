export const mergeFloorsAndTables = (floors, tables) => {
  return floors.map((floor) => {
    // match tables that belong to this floor
    const floorTables = tables
      .filter((table) => table.floor && table.floor.id === floor.id)
      .map((table) => ({
        ...table,
      }));
    const pointsOfInterest =
      floor.pointsOfInterest && floor.pointsOfInterest.length > 0
        ? floor.pointsOfInterest
        : getDefaultPOIs();

    return {
      ...floor,
      tables: floorTables,
      pointsOfInterest,
    };
  });
};
const getDefaultPOIs = () => [
  {
    id: "poi-1",
    name: "Double Sofa",
    type: "double-sofa",
    width: 100,
    height: 200,
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
  },
  {
    id: "poi-2",
    name: "Single Sofa",
    type: "single-sofa",
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
    width: 100,
    height: 200,
  },
  {
    id: "poi-3",
    name: "Triple Sofa",
    type: "triple-sofa",
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
    width: 100,
    height: 200,
  },
  {
    id: "poi-4",
    name: "Dancing Floor",
    type: "dancing-floor",
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
    width: 100,
    height: 200,
  },
  {
    id: "poi-5",
    name: "Stairs",
    type: "stairs",
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
    width: 100,
    height: 200,
  },
  {
    id: "poi-6",
    name: "Mini Bar",
    type: "mini-bar",
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
    width: 100,
    height: 200,
  },
  {
    id: "poi-7",
    name: "Main Bar",
    type: "main-bar",
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
    width: 100,
    height: 200,
  },
  {
    id: "poi-8",
    name: "Circular Bar",
    type: "circular-bar",
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
    width: 100,
    height: 200,
  },
  {
    id: "poi-9",
    name: "Washroom",
    type: "washroom",
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
    width: 100,
    height: 200,
  },
  {
    id: "poi-10",
    name: "DJ Booth",
    type: "dj-booth",
    xAxis: getRandomPercent(),
    yAxis: getRandomPercent(),
    rotation: 0,
    width: 100,
    height: 200,
  },
];

type TableData = {
  tableNumber?: string | number;
  tableType?: string;
  price?: number | string;
  capacity?: number | string;
  width?: number | string;
  height?: number | string;
  description?: string;
};

export const validateTable = (tableData: TableData) => {
  const errors: { [key: string]: string } = {};

  if (!tableData.tableNumber) errors.tableNumber = "Table Name is required";
  if (!tableData.tableType) errors.tableType = "Table type is required";
  if (!tableData.price) errors.price = "Price is Required";

  if (!tableData.capacity) {
    errors.capacity = "Capacity is Required";
  } else if (
    Number(tableData.capacity) < 1 ||
    Number(tableData.capacity) > 50
  ) {
    errors.capacity = "Capacity must be between 1 and 50";
  }

  // if (!tableData.width) errors.width = "Width is Required";
  // if (!tableData.height) errors.height = "Height is Required";
  if (!tableData.description) errors.description = "Description is Required";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getRandomPercent = () => {
  return Math.random() * 100; // 0 - 100
};
