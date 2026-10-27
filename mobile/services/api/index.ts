import { ApiCreateEmotionPost, ApiResponse, Device, DeviceSetting } from "@/types/type";
import { Platform } from "react-native";
import api from "./api";

export const deviceInfo = async () => {
  try {
    const data = await api.post<ApiResponse<Device>>(
      "/devices/me"
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updateDeviceSetting = async (deviceSetting: Partial<DeviceSetting>) => {
  try {
    const data = await api.patch<ApiResponse<DeviceSetting>>("/devices/me/settings", deviceSetting);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const registerPushToken = async (pushToken: string, platform?: string) => {
  try {
    const data = await api.post<ApiResponse<void>>("/devices/me/push-token", {
      push_token: pushToken,
      platform: platform || (Platform.OS === "ios" ? "IOS" : "ANDROID"),
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const createEmotionPost = async (params: ApiCreateEmotionPost) => {
  try {
    const data = await api.post<ApiResponse<ApiCreateEmotionPost>>(
      "/posts",
      params,
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getEmotionCategories = async () => {
  try {
    const data = await api.get<ApiResponse<any>>("/categories");
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getEmotionFeed = async (page = 0, size = 20) => {
  try {
    const data = await api.get<ApiResponse<any>>(`/posts?page=${page}&size=${size}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const reactToEmotionPost = async (postId: string, reactionTypeId: number) => {
  try {
    const data = await api.post<ApiResponse<any>>(`/posts/${postId}/reactions`, {
      reaction_type_id: reactionTypeId,
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};
