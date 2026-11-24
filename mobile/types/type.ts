export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
}

export interface ApiCreateEmotionPost {
  device_id: string;
  content: string;
  is_ai_assisted: Boolean;
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  code?: string;
  emotion_code?: string;
  emotion_category_id?: number;
  author_alias?: string;
  style_type?: string;
  atmosphere?: string;
}

export interface Device {
  id: string;

  device_token: string;

  created_at: Date;

  last_active_at: Date;

  setting: DeviceSetting;
}

export interface DeviceSetting {
  device_id: string;

  share_nearby: boolean;

  receive_nearby: boolean;

  use_location: boolean;

  approximate_location: boolean;

  ai_suggestion_enabled: boolean;

  low_pressure_mode: boolean;

  app_mode?: string;

  author_alias?: string;

  updated_at: Date;
}



