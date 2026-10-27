import { ApiCreateEmotionPost } from "@/types/type";
import { create } from "zustand";

type CreateEmotionPostDraft = Partial<ApiCreateEmotionPost>;

interface ContentStore {
  draft: CreateEmotionPostDraft;

  set: (data: Partial<ApiCreateEmotionPost>) => void;
  clear: () => void;
}

export const useContentStore = create<ContentStore>((set) => ({
  draft: {},

  set: (data) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...data,
      },
    })),

  clear: () => set({ draft: {} }),
}));

// Hook
export const useContent = () => useContentStore((s) => s.draft);

// Service API
export const getContent = () => useContentStore.getState().draft;

export const setContent = (data: Partial<ApiCreateEmotionPost>) =>
  useContentStore.getState().set(data);

export const clearContent = () => useContentStore.getState().clear();

// Helpers
export const getContentField = <K extends keyof ApiCreateEmotionPost>(
  key: K,
): ApiCreateEmotionPost[K] | undefined => useContentStore.getState().draft[key];

export const setContentField = <K extends keyof ApiCreateEmotionPost>(
  key: K,
  value: ApiCreateEmotionPost[K],
) =>
  useContentStore.getState().set({
    [key]: value,
  } as Partial<ApiCreateEmotionPost>);

export const hasContent = () =>
  Object.keys(useContentStore.getState().draft).length > 0;

export const isContentReady = () => {
  const draft = getContent();

  return !!(
    draft.device_id &&
    draft.emotion_category_id &&
    draft.latitude &&
    draft.longitude
  );
};
