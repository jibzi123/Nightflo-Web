import axiosInstance from "../axios";
import {
  ApiResponse,
  Floor,
  FloorsResponse,
} from "../../components/interactive-table-booking/types";

interface FLoorBody {
  name: String;
  club: String;
}

export interface UpdateFloorParam {
  name: String;
}

export const CreateFloor = (param: FLoorBody) => {
  return axiosInstance.post<ApiResponse<FloorsResponse[]>>(
    `/floor/create`,
    param
  );
};

export const GetFloorById = (floorID: String) => {
  return axiosInstance.get(`/floor/${floorID}`);
};

export const GetFloorByClub = (clubId: string) => {
  return axiosInstance.get<ApiResponse<Floor[]>>(`/floor/getByClub/${clubId}`);
};
export const GetActiveFloorByClub = (clubID: Number) => {
  return axiosInstance.get(`/floor/getActiveByClub/${clubID}`);
};

export const UpdateFloor = (floorID: string, param: UpdateFloorParam) => {
  return axiosInstance.put(`/floor/${floorID}`, param);
};

export const DeleteFloor = (floorID: string) => {
  return axiosInstance.delete(`/floor/${floorID}`);
};
