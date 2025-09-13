interface Table {
  tableNumber: String;
  price: String;
  capacity: Number;
  // "floorId": "",
  tableCount: Number;
  description: [String];
  clubId: String;
  // "eventId": String,
  tableType: String;
}
import axiosInstance from "../axios";

export const CreateTable = (param: Table) => {
  return axiosInstance.post(`/tables/create`, param);
};

export const GetTable = (tableId: Number) => {
  return axiosInstance.get(`/tables/getTable?tableId=${tableId}`);
};
export const UpdateTable = () => {
  return axiosInstance.post(`/tables/update}`);
};

export const GetTableTimeSlots = (tableId: Number, date: String) => {
  return axiosInstance.get(
    `/tables/availableTimeSlots?tableId=${tableId}&date=${date}`
  );
};

export const GetTableByEvent = (eventId: String) => {
  return axiosInstance.get(`/tables/getAllByEvent?eventId=${eventId}`);
};

export const GetTableByClub = (clubID: Number) => {
  return axiosInstance.get(`/tables/club?clubId=${clubID}`);
};

export const GetTableCountByFloor = (floorID: number) => {
  return axiosInstance.put(
    `{{BaseUrl}}/tables/countByFloor?floorId=${floorID}`
  );
};

export const DeleteTable = (tableID: number) => {
  return axiosInstance.delete(`/tables/delete/${tableID}`);
};
