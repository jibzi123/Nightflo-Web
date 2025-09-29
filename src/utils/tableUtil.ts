const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const mergeFloorsAndTables = (floors, tables) => {
  return floors.map((floor) => {
    // match tables that belong to this floor
    const floorTables = tables
      .filter((table) => table.floor && table.floor.id === floor.id)
      .map((table) => ({
        ...table,
        // x: getRandomInt(50, 500), // random X position
        // y: getRandomInt(50, 500), // random Y position
        // width: getRandomInt(40, 120), // random width
        // height: getRandomInt(40, 120), // random height
      }));
    return {
      ...floor,
      tables: floorTables,
    };
  });
};

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

  if (!tableData.width) errors.width = "Width is Required";
  if (!tableData.height) errors.height = "Height is Required";
  if (!tableData.description) errors.description = "Description is Required";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getRandomPercent = () => {
  return Math.random() * 100; // 0 - 100
};
