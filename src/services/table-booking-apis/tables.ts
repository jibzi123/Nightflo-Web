import {
  ApiResponse,
  Table,
} from "../../components/interactive-table-booking/types";
import axiosInstance from "../axios";

export const CreateTable = (param: Table) => {
  return axiosInstance.post<ApiResponse<Table>>(`/tables/create`, param);
};

export const GetTable = (tableId: Number) => {
  return axiosInstance.get(`/tables/getTable?tableId=${tableId}`);
};
export const UpdateTable = (params: any) => {
  return axiosInstance.post(`/tables/update`, params);
};

export const GetTableTimeSlots = (tableId: Number, date: String) => {
  return axiosInstance.get(
    `/tables/availableTimeSlots?tableId=${tableId}&date=${date}`
  );
};

export const GetTableByEvent = (eventId: String) => {
  return axiosInstance.get(`/tables/getAllByEvent?eventId=${eventId}`);
};

export const GetTableByClub = (clubID: string) => {
  return axiosInstance.get<ApiResponse<Table[]>>(
    `/tables/club?clubId=${clubID}`
  );
};

export const GetTableCountByFloor = (floorID: number) => {
  return axiosInstance.put(
    `{{BaseUrl}}/tables/countByFloor?floorId=${floorID}`
  );
};

export const DeleteTable = (params: any) => {
  return axiosInstance.delete(`/tables/delete`, { data: params });
};
