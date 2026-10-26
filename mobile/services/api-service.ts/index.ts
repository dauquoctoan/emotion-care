import { ApiCreateEmotionPost, ApiResponse, Device, DeviceSetting } from "@/types/type";
import api from "./api";

export const deviceInfo = async () => {
  try {
    const data = await api.post<ApiResponse<Device>>(
      "/api/v1/devices/me"
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updateDeviceSetting = async (deviceSetting: Partial<DeviceSetting>) => {
  try {
    const data = await api.patch<ApiResponse<DeviceSetting>>("/api/v1/devices/setting", deviceSetting);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const createEmotionPost = async (params: ApiCreateEmotionPost) => {
  try {
    const data = await api.post<ApiResponse<ApiCreateEmotionPost>>(
      "/api/v1/posts",
      params,
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getEmotionCategories = async () => {
  try {
    const data = await api.get<ApiResponse<any>>("/api/v1/categories");
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getEmotionFeed = async (page = 0, size = 20) => {
  try {
    const data = await api.get<ApiResponse<any>>(`/api/v1/posts?page=${page}&size=${size}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const reactToEmotionPost = async (postId: string, reactionTypeId: number) => {
  try {
    const data = await api.post<ApiResponse<any>>(`/api/v1/posts/${postId}/reactions`, {
      reaction_type_id: reactionTypeId,
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};
