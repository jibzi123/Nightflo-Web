import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";

type Callbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

export function useApi() {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("authToken");

  const callApi = async <T = unknown>(
    method: string,
    url: string,
    data: any = null,
    callbacks: Callbacks<T> = {}
  ): Promise<T | null> => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: method !== "GET" && data ? JSON.stringify(data) : null,
      });

      // 👇 Safe parse (fallback to text if not JSON)
      let result: any;
      try {
        result = await response.json();
      } catch {
        result = await response.text();
      }
      console.log(result, "result");
      setLoading(false);
      // 🔎 Check HTTP + API status
      const apiFailed =
        !response.ok || result?.status?.toLowerCase() === "failure";

      if (apiFailed) {
        let message = "Something went wrong";

        // Handle duplicate key error (MongoDB)
        if (result?.message?.code === 11000) {
          const keys = Object.keys(result.message.keyValue || {}).join(", ");
          message = `Duplicate value for: ${keys}`;
        }

        // Handle Mongoose validation errors
        else if (result?.message?.errors) {
          const firstError = Object.values(result.message.errors)[0] as any;
          message = firstError?.message || result.message._message;
        }

        // Handle direct message string
        else if (typeof result?.message === "string") {
          message = result.message;
        }

        toast.error(message);
        console.error("API Error Response:", result);
        callbacks.onError?.(result);

        return null;
      }

      // ✅ Success
      // toast.success("Success!");
      callbacks.onSuccess?.(result);
      return result;
    } catch (err: any) {
      setLoading(false);
      const message = err?.message || "Network error";
      toast.error(message);
      console.error("Fetch error:", err);
      callbacks.onError?.(err);
      return null;
    }
  };

  return { loading, callApi };
}
