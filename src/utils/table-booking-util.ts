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
          x: getRandomInt(50, 500), // random X position
          y: getRandomInt(50, 500), // random Y position
          width: getRandomInt(40, 120), // random width
          height: getRandomInt(40, 120), // random height
        }));
      return {
        ...floor,
        tables: floorTables,
      };
    });
  };
