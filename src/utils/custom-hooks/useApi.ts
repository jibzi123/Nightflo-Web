import { useState } from "react";
import axios, { Method } from "axios";
import { toast } from "react-toastify";

type Callbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

export function useApi() {
  const [loading, setLoading] = useState(false);

  const callApi = async <T = unknown>(
    method: Method,
    url: string,
    data: any = null,
    callbacks: Callbacks<T> = {}
  ): Promise<T | null> => {
    setLoading(true);

    try {
      const response = await axios.request<T>({
        method,
        url,
        data,
      });

      setLoading(false);
      toast.success("Success!");

      callbacks.onSuccess?.(response.data);

      return response.data;
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.message || "Something went wrong");

      callbacks.onError?.(err);

      return null;
    }
  };

  return { loading, callApi };
}
