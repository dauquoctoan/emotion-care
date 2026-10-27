-- =============================================================================
-- EMOTION CARE PLATFORM - SAMPLE MOCK POSTS & REACTIONS FOR DEMO
-- =============================================================================

-- 1. Create a sample demo device
INSERT INTO devices (id, device_token, last_active_at)
VALUES ('a0000000-0000-0000-0000-000000000001', 'demo-device-token-1', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO device_settings (device_id, share_nearby, receive_nearby, use_location, approximate_location, ai_suggestion_enabled, low_pressure_mode)
VALUES ('a0000000-0000-0000-0000-000000000001', true, true, true, true, true, false)
ON CONFLICT (device_id) DO NOTHING;

-- 2. Create sample posts
INSERT INTO emotion_posts (id, device_id, emotion_category_id, content, is_ai_assisted, latitude, longitude, city, district, visibility_radius_m, status, created_at, expired_at)
VALUES 
    (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        1, -- Vui vẻ
        'Cảm thấy một sự biết ơn lặng lẽ hôm nay. Ánh sáng buổi sáng qua cửa sổ nhắc nhở tôi rằng những điều nhỏ bé vẫn luôn quan trọng.',
        false,
        10.776889,
        106.700806,
        'Hồ Chí Minh',
        'Quận 1',
        5000,
        1,
        NOW() - INTERVAL '15 minutes',
        NOW() + INTERVAL '7 days'
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        2, -- Buồn
        'Đôi khi gánh nặng của mọi thứ chỉ đuổi kịp bạn. Tôi ngồi trên chiếc ghế bên sông và để bản thân cảm nhận tất cả. Không sao khi không ổn, tôi đang học điều đó từ từ.',
        false,
        10.780123,
        106.698456,
        'Hồ Chí Minh',
        'Bình Thạnh',
        5000,
        1,
        NOW() - INTERVAL '45 minutes',
        NOW() + INTERVAL '7 days'
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        4, -- Căng thẳng
        'Deadline dồn dập và tiếng thông báo không ngừng réo. Nhắm mắt lại hít một hơi thật sâu 5 giây... Mình sẽ vượt qua được.',
        true,
        10.772540,
        106.690120,
        'Hồ Chí Minh',
        'Quận 3',
        5000,
        1,
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '7 days'
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        6, -- Phấn khích
        'Vừa hoàn thành dự án tâm huyết sau 3 tháng liên tục thức khuya! Tự thưởng cho mình một cốc trà sữa và một buổi tối ngủ thật ngon.',
        false,
        10.823099,
        106.629664,
        'Hồ Chí Minh',
        'Gò Vấp',
        5000,
        1,
        NOW() - INTERVAL '5 hours',
        NOW() + INTERVAL '7 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Associate tags with sample posts
INSERT INTO emotion_post_tags (post_id, tag_id)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 2), -- Biết ơn
    ('b0000000-0000-0000-0000-000000000001', 3), -- Bình yên
    ('b0000000-0000-0000-0000-000000000002', 6), -- Hụt hẫng
    ('b0000000-0000-0000-0000-000000000003', 10), -- Áp lực công việc
    ('b0000000-0000-0000-0000-000000000004', 13) -- Thành tựu mới
ON CONFLICT DO NOTHING;

-- 4. Sample empathy reactions
INSERT INTO post_reactions (post_id, device_id, reaction_type_id, created_at)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 5, NOW()),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 2, NOW())
ON CONFLICT DO NOTHING;
