-- =============================================================================
-- EMOTION CARE PLATFORM - INITIAL SEED DATA (V1.0.0)
-- Ported from seeder.ts & constant/emoji.ts
-- =============================================================================

-- 1. Seed Emotion Categories
INSERT INTO emotion_categories (id, code, name, icon, display_order)
VALUES
    (1, 'happy', 'Vui vẻ', '😊', 1),
    (2, 'sad', 'Buồn', '😢', 2),
    (3, 'tired', 'Mệt mỏi', '😴', 3),
    (4, 'stressed', 'Căng thẳng', '😰', 4),
    (5, 'lonely', 'Cô đơn', '🥺', 5),
    (6, 'excited', 'Phấn khích', '🤩', 6)
ON CONFLICT (code) DO NOTHING;

-- Reset sequence to continue after 6
SELECT setval(pg_get_serial_sequence('emotion_categories', 'id'), 6, true);

-- 2. Seed Emotion Tags with Full Emoji Color & Icons
INSERT INTO emotion_tags (name, category_id, icon, sub_icon)
VALUES
    -- Happy Category (id: 1)
    ('Hy vọng', 1, 
     '{"key": "sun", "color": "#F59E0B", "bgColor": "#FEF3C7"}'::jsonb, 
     '{"key": "sparkles", "color": "#FBBF24", "bgColor": "#FEF9C3"}'::jsonb),
    ('Biết ơn', 1, 
     '{"key": "heart", "color": "#EF4444", "bgColor": "#FEE2E2"}'::jsonb, 
     '{"key": "sparkles", "color": "#F59E0B", "bgColor": "#FEF3C7"}'::jsonb),
    ('Bình yên', 1, 
     '{"key": "rainbow", "color": "#FB923C", "bgColor": "#FED7AA"}'::jsonb, 
     '{"key": "sun", "color": "#F59E0B", "bgColor": "#FEF3C7"}'::jsonb),

    -- Sad Category (id: 2)
    ('Chia tay', 2, 
     '{"key": "cloud-rain", "color": "#3B82F6", "bgColor": "#DBEAFE"}'::jsonb, 
     '{"key": "droplets", "color": "#06B6D4", "bgColor": "#CFFAFE"}'::jsonb),
    ('Tổn thương', 2, 
     '{"key": "moon", "color": "#6366F1", "bgColor": "#E0E7FF"}'::jsonb, 
     '{"key": "umbrella", "color": "#60A5FA", "bgColor": "#DBEAFE"}'::jsonb),
    ('Hụt hẫng', 2, 
     '{"key": "droplets", "color": "#06B6D4", "bgColor": "#CFFAFE"}'::jsonb, 
     '{"key": "cloud-rain", "color": "#3B82F6", "bgColor": "#DBEAFE"}'::jsonb),

    -- Tired Category (id: 3)
    ('Mất ngủ', 3, 
     '{"key": "bed", "color": "#8B5CF6", "bgColor": "#EDE9FE"}'::jsonb, 
     '{"key": "moon-star", "color": "#7C3AED", "bgColor": "#DDD6FE"}'::jsonb),
    ('Cạn kiệt năng lượng', 3, 
     '{"key": "battery-low", "color": "#A78BFA", "bgColor": "#EDE9FE"}'::jsonb, 
     '{"key": "coffee", "color": "#6D4C41", "bgColor": "#EFEBE9"}'::jsonb),

    -- Stressed Category (id: 4)
    ('Lo lắng', 4, 
     '{"key": "zap", "color": "#EF4444", "bgColor": "#FEE2E2"}'::jsonb, 
     '{"key": "cloud-lightning", "color": "#E11D48", "bgColor": "#FFE4E6"}'::jsonb),
    ('Áp lực công việc', 4, 
     '{"key": "flame", "color": "#F97316", "bgColor": "#FFEDD5"}'::jsonb, 
     '{"key": "alarm", "color": "#DC2626", "bgColor": "#FEE2E2"}'::jsonb),
    ('Quá tải', 4, 
     '{"key": "alarm", "color": "#DC2626", "bgColor": "#FEE2E2"}'::jsonb, 
     '{"key": "zap", "color": "#EF4444", "bgColor": "#FEE2E2"}'::jsonb),

    -- Lonely Category (id: 5)
    ('Không ai hiểu mình', 5, 
     '{"key": "moon", "color": "#6366F1", "bgColor": "#E0E7FF"}'::jsonb, 
     '{"key": "person", "color": "#64748B", "bgColor": "#E2E8F0"}'::jsonb),
    ('Cô đơn giữa đám đông', 5, 
     '{"key": "heart-crack", "color": "#EC4899", "bgColor": "#FCE7F3"}'::jsonb, 
     '{"key": "cloud", "color": "#94A3B8", "bgColor": "#F1F5F9"}'::jsonb),

    -- Excited Category (id: 6)
    ('Hào hứng', 6, 
     '{"key": "rocket", "color": "#F97316", "bgColor": "#FFEDD5"}'::jsonb, 
     '{"key": "sparkles", "color": "#F59E0B", "bgColor": "#FEF3C7"}'::jsonb),
    ('Thành tựu mới', 6, 
     '{"key": "trophy", "color": "#EAB308", "bgColor": "#FEF9C3"}'::jsonb, 
     '{"key": "party-popper", "color": "#EC4899", "bgColor": "#FCE7F3"}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 3. Seed Reaction Types (Empathy reactions)
INSERT INTO reaction_types (id, code, name)
VALUES
    (1, 'listen', 'Lắng nghe'),
    (2, 'hug', 'Ôm một cái'),
    (3, 'support', 'Ở đây với bạn'),
    (4, 'cheer', 'Cố lên nhé'),
    (5, 'empathy', 'Tôi hiểu cảm giác này')
ON CONFLICT (code) DO NOTHING;

SELECT setval(pg_get_serial_sequence('reaction_types', 'id'), 5, true);

-- 4. Seed Notification Templates
INSERT INTO notification_templates (code, title, body)
VALUES
    ('EMPATHY_RECEIVED', 'Có người đồng cảm', 'Một người vừa gửi cái ôm đến bài viết của bạn.'),
    ('SIMILAR_EMOTION_NEARBY', 'Cảm xúc quanh bạn', 'Có người gần bạn cũng đang chia sẻ tâm trạng tương tự.'),
    ('CRISIS_SAFETY_ALERT', 'Bạn không đơn độc', 'Chúng mình luôn ở đây sẵn sàng lắng nghe bạn bất cứ khi nào.')
ON CONFLICT (code) DO NOTHING;
