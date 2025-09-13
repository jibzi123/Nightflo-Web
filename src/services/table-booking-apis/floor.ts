import axiosInstance from "../axios";

interface FLoorBody {
  name: String;
  club: String;
}

interface UpdateFloorParam {
  name: String;
}

export const CreateFloor = (param: FLoorBody) => {
  return axiosInstance.post(`/floor/create`, param);
};

export const GetFloorById = (floorID: Number) => {
  return axiosInstance.get(`/floor/${floorID}`);
};

export const GetFloorByClub = (clubID: String) => {
  return axiosInstance.get(`/floor/getByClub/${clubID}`);
};

export const GetActiveFloorByClub = (clubID: Number) => {
  return axiosInstance.get(`/floor/getActiveByClub/${clubID}`);
};

export const UpdateFloor = (floorID: number, param: UpdateFloorParam) => {
  return axiosInstance.put(`/floor/${floorID}`, param);
};

export const DeleteFloor = (floorID: string) => {
  return axiosInstance.delete(`/floor/${floorID}`);
};
