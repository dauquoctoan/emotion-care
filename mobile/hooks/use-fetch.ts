// hooks/use-fetch.ts
import api from "@/services/api-service.ts/api";
import { ApiResponse } from "@/types/type";
import { useEffect, useState } from "react";

export function useFetch<T>(url: string, def?: T) {
  const [data, setData] = useState<T | null>(def || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse<T>>(url);
        setData(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url]);

  return {
    data,
    loading,
    error,
  };
}
