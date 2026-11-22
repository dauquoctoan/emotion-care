# Mood Visual Palette & Icon Taxonomy

Tài liệu đặc tả bảng màu sắc (`color`, `bgColor`) và bộ icon chuẩn cho từng nhóm cảm xúc (Mood) trong hệ thống Emotion Care Platform (được chuyển giao từ `personal-status-be/constant/emoji.ts`).

---

## 1. Bảng Phân Loại Màu Sắc & Icon Theo Cảm Xúc

### 1.1. Vui vẻ (`happy`)
| Icon Key | Mã Màu Chữ (`color`) | Mã Màu Nền Thẻ (`bgColor`) | Minh họa ý nghĩa |
| :--- | :---: | :---: | :--- |
| `sun` | `#F59E0B` | `#FEF3C7` | Ánh nắng rực rỡ, lạc quan |
| `sparkles` | `#FBBF24` | `#FEF3C7` | Tươi vui, rạng rỡ |
| `rainbow` | `#FB923C` | `#FED7AA` | Cầu vồng hy vọng |
| `party-popper`| `#F97316` | `#FFEDD5` | Ăn mừng, phấn khởi |

### 1.2. Buồn (`sad`)
| Icon Key | Mã Màu Chữ (`color`) | Mã Màu Nền Thẻ (`bgColor`) | Minh họa ý nghĩa |
| :--- | :---: | :---: | :--- |
| `cloud-rain` | `#3B82F6` | `#DBEAFE` | Mây mưa ảm đạm |
| `droplets` | `#06B6D4` | `#CFFAFE` | Giọt nước mắt |
| `moon` | `#6366F1` | `#E0E7FF` | Ánh trăng tĩnh lặng |
| `umbrella` | `#60A5FA` | `#DBEAFE` | Che chở, an ủi |

### 1.3. Mệt mỏi (`tired`)
| Icon Key | Mã Màu Chữ (`color`) | Mã Màu Nền Thẻ (`bgColor`) | Minh họa ý nghĩa |
| :--- | :---: | :---: | :--- |
| `bed` | `#8B5CF6` | `#EDE9FE` | Cần được nghỉ ngơi |
| `moon-star` | `#7C3AED` | `#DDD6FE` | Mất ngủ, đêm dài |
| `battery-low`| `#A78BFA` | `#EDE9FE` | Cạn kiệt năng lượng |
| `coffee` | `#6D4C41` | `#EFEBE9` | Cần nạp lại tỉnh táo |

### 1.4. Căng thẳng (`stressed`)
| Icon Key | Mã Màu Chữ (`color`) | Mã Màu Nền Thẻ (`bgColor`) | Minh họa ý nghĩa |
| :--- | :---: | :---: | :--- |
| `zap` | `#EF4444` | `#FEE2E2` | Áp lực dồn dập |
| `flame` | `#F97316` | `#FFEDD5` | Quá tải, bốc hỏa |
| `alarm` | `#DC2626` | `#FEE2E2` | Báo động, căng thẳng cao độ |
| `cloud-lightning`| `#E11D48`| `#FFE4E6` | Giông bão cảm xúc |

### 1.5. Cô đơn (`lonely`)
| Icon Key | Mã Màu Chữ (`color`) | Mã Màu Nền Thẻ (`bgColor`) | Minh họa ý nghĩa |
| :--- | :---: | :---: | :--- |
| `moon` | `#6366F1` | `#E0E7FF` | Một mình giữa đêm |
| `heart-crack` | `#EC4899` | `#FCE7F3` | Trái tim tan vỡ, lẻ loi |
| `cloud` | `#94A3B8` | `#F1F5F9` | Lơ lửng, trống vắng |
| `person` | `#64748B` | `#E2E8F0` | Một mình, không ai thấu hiểu |

### 1.6. Phấn khích (`excited`)
| Icon Key | Mã Màu Chữ (`color`) | Mã Màu Nền Thẻ (`bgColor`) | Minh họa ý nghĩa |
| :--- | :---: | :---: | :--- |
| `rocket` | `#F97316` | `#FFEDD5` | Thăng hoa, năng lượng cao |
| `trophy` | `#EAB308` | `#FEF9C3` | Thành tựu, chiến thắng |
| `sparkles` | `#F59E0B` | `#FEF3C7` | Tỏa sáng |
| `party-popper`| `#EC4899` | `#FCE7F3` | Bùng nổ cảm xúc |

---

## 2. Mã Nguồn TypeScript Tham Khảo (Dùng cho Mobile Client)

```typescript
export const ICON_MOODS = {
  happy: [
    { key: "sun", color: "#F59E0B", bgColor: "#FEF3C7" },
    { key: "sparkles", color: "#FBBF24", bgColor: "#FEF3C7" },
    { key: "rainbow", color: "#FB923C", bgColor: "#FED7AA" },
    { key: "party-popper", color: "#F97316", bgColor: "#FFEDD5" }
  ],
  sad: [
    { key: "cloud-rain", color: "#3B82F6", bgColor: "#DBEAFE" },
    { key: "droplets", color: "#06B6D4", bgColor: "#CFFAFE" },
    { key: "moon", color: "#6366F1", bgColor: "#E0E7FF" },
    { key: "umbrella", color: "#60A5FA", bgColor: "#DBEAFE" }
  ],
  tired: [
    { key: "bed", color: "#8B5CF6", bgColor: "#EDE9FE" },
    { key: "moon-star", color: "#7C3AED", bgColor: "#DDD6FE" },
    { key: "battery-low", color: "#A78BFA", bgColor: "#EDE9FE" },
    { key: "coffee", color: "#6D4C41", bgColor: "#EFEBE9" }
  ],
  stressed: [
    { key: "zap", color: "#EF4444", bgColor: "#FEE2E2" },
    { key: "flame", color: "#F97316", bgColor: "#FFEDD5" },
    { key: "alarm", color: "#DC2626", bgColor: "#FEE2E2" },
    { key: "cloud-lightning", color: "#E11D48", bgColor: "#FFE4E6" }
  ],
  lonely: [
    { key: "moon", color: "#6366F1", bgColor: "#E0E7FF" },
    { key: "heart-crack", color: "#EC4899", bgColor: "#FCE7F3" },
    { key: "cloud", color: "#94A3B8", bgColor: "#F1F5F9" },
    { key: "person", color: "#64748B", bgColor: "#E2E8F0" }
  ],
  excited: [
    { key: "rocket", color: "#F97316", bgColor: "#FFEDD5" },
    { key: "trophy", color: "#EAB308", bgColor: "#FEF9C3" },
    { key: "sparkles", color: "#F59E0B", bgColor: "#FEF3C7" },
    { key: "party-popper", color: "#EC4899", bgColor: "#FCE7F3" }
  ]
};
```
