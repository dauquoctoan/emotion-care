import { ApiCreateEmotionPost, ApiResponse, Device, DeviceSetting } from "@/types/type";
import { Platform } from "react-native";
import api from "./api";

/**
 * Fetch current device profile & settings
 */
export const deviceInfo = async () => {
  try {
    const data = await api.get<ApiResponse<Device>>("/devices/me");
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Register / initialize device profile on first launch
 */
export const initDevice = async () => {
  try {
    const data = await api.post<ApiResponse<Device>>("/devices/me");
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Update device privacy & notification settings
 */
export const updateDeviceSetting = async (deviceSetting: Partial<DeviceSetting>) => {
  try {
    const data = await api.patch<ApiResponse<DeviceSetting>>("/devices/me/settings", deviceSetting);
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Register Expo push notification token
 */
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

/**
 * Create emotion or social caption post
 */
export const createEmotionPost = async (params: ApiCreateEmotionPost) => {
  try {
    const data = await api.post<ApiResponse<ApiCreateEmotionPost>>("/posts", params);
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get all emotion categories with nested tags
 */
export const getEmotionCategories = async () => {
  try {
    const data = await api.get<ApiResponse<any>>("/categories");
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get chronological emotion post feed
 */
export const getEmotionFeed = async (page = 0, size = 20, categoryId?: number, tagId?: number) => {
  try {
    let url = `/posts?page=${page}&size=${size}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (tagId) url += `&tagId=${tagId}`;
    const data = await api.get<ApiResponse<any>>(url);
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get trending / viral caption ranking feed
 */
export const getTrendingPosts = async (page = 0, size = 20) => {
  try {
    const data = await api.get<ApiResponse<any>>(`/posts/trending?page=${page}&size=${size}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get current device's own posts (journal / history)
 */
export const getMyPosts = async (page = 0, size = 20) => {
  try {
    const data = await api.get<ApiResponse<any>>(`/posts/me?page=${page}&size=${size}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Record caption copy event for viral ranking
 */
export const copyPostCaption = async (postId: string) => {
  try {
    const data = await api.post<ApiResponse<{ copied: boolean; postId: string }>>(`/posts/${postId}/copy`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get master data reaction types (Like, Hug, Heart...)
 */
export const getReactionTypes = async () => {
  try {
    const data = await api.get<ApiResponse<any>>("/reactions/types");
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Toggle empathy reaction on an emotion post
 */
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
