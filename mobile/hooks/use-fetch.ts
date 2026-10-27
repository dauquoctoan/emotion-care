// hooks/use-fetch.ts
import api from "@/services/api/api";
import { ApiResponse } from "@/types/type";
import { useCallback, useEffect, useState } from "react";

export function useFetch<T>(url: string, def?: T) {
  const [data, setData] = useState<T | null>(def || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<T>>(url);
      setData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
