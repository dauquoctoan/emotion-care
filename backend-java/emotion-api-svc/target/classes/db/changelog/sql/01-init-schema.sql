-- =============================================================================
-- EMOTION CARE PLATFORM - DATABASE SCHEMA INITIALIZATION (V1.0.0)
-- Target: PostgreSQL 16+ (PostGIS supported)
-- =============================================================================

-- Enable essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enable PostGIS if installed (for spatial point geography)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'PostGIS extension not available, spatial geography will rely on latitude/longitude columns.';
END $$;

-- =============================================================================
-- 1. DEVICE & ANONYMOUS IDENTITY DOMAIN
-- =============================================================================

-- 1.1 Devices Table (Anonymous Identity)
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_token VARCHAR(200) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_devices_token ON devices(device_token);

-- 1.2 Device Settings Table
CREATE TABLE IF NOT EXISTS device_settings (
    device_id UUID PRIMARY KEY REFERENCES devices(id) ON DELETE CASCADE,
    share_nearby BOOLEAN NOT NULL DEFAULT TRUE,
    receive_nearby BOOLEAN NOT NULL DEFAULT TRUE,
    use_location BOOLEAN NOT NULL DEFAULT TRUE,
    approximate_location BOOLEAN NOT NULL DEFAULT TRUE,
    ai_suggestion_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    low_pressure_mode BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 Device Locations Table (Historical check-in / location updates)
CREATE TABLE IF NOT EXISTS device_locations (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_device_locations_device_id ON device_locations(device_id);
CREATE INDEX IF NOT EXISTS idx_device_locations_created ON device_locations(created_at);

-- 1.4 Device Push Tokens Table (FCM / APNs)
CREATE TABLE IF NOT EXISTS device_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL, -- ANDROID, IOS
    push_token TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_push_tokens_device_id ON device_push_tokens(device_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON device_push_tokens(is_active) WHERE is_active = TRUE;

-- =============================================================================
-- 2. EMOTION & CONTENT DOMAIN
-- =============================================================================

-- 2.1 Emotion Categories Table (Happy, Sad, Tired, Stressed, Lonely, Excited...)
CREATE TABLE IF NOT EXISTS emotion_categories (
    id SMALLSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    display_order INT NOT NULL DEFAULT 0
);

-- 2.2 Emotion Tags Table (Sub-emotions: Hope, Grateful, Anxious, Breakup...)
CREATE TABLE IF NOT EXISTS emotion_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon JSONB NOT NULL,
    sub_icon JSONB NOT NULL,
    category_id SMALLINT NOT NULL REFERENCES emotion_categories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_emotion_tags_category_id ON emotion_tags(category_id);

-- 2.3 Emotion Posts Table (Core post entity)
CREATE TABLE IF NOT EXISTS emotion_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    emotion_category_id SMALLINT NOT NULL REFERENCES emotion_categories(id),
    content TEXT NOT NULL,
    is_ai_assisted BOOLEAN NOT NULL DEFAULT FALSE,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    city VARCHAR(100),
    district VARCHAR(100),
    visibility_radius_m INT NOT NULL DEFAULT 5000,
    status SMALLINT NOT NULL DEFAULT 1, -- 1=Active, 0=Hidden/Deleted, 2=Flagged
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_posts_created ON emotion_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_emotion ON emotion_posts(emotion_category_id);
CREATE INDEX IF NOT EXISTS idx_posts_device ON emotion_posts(device_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON emotion_posts(status) WHERE status = 1;

-- 2.4 Emotion Post Tags (N-N join table)
CREATE TABLE IF NOT EXISTS emotion_post_tags (
    post_id UUID NOT NULL REFERENCES emotion_posts(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES emotion_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON emotion_post_tags(tag_id);

-- =============================================================================
-- 3. EMPATHY & REACTION DOMAIN
-- =============================================================================

-- 3.1 Reaction Types Table (Listen, Hug, Support, Empathy...)
CREATE TABLE IF NOT EXISTS reaction_types (
    id SMALLSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL
);

-- 3.2 Post Reactions Table
CREATE TABLE IF NOT EXISTS post_reactions (
    id BIGSERIAL PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES emotion_posts(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    reaction_type_id SMALLINT NOT NULL REFERENCES reaction_types(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_post_device_reaction UNIQUE (post_id, device_id)
);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_device ON post_reactions(device_id);

-- =============================================================================
-- 4. AI & MODERATION DOMAIN
-- =============================================================================

-- 4.1 AI Suggestions Table (RAG Caption history)
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES emotion_posts(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50) NOT NULL, -- Gentle, Direct, Expressive
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_post_id ON ai_suggestions(post_id);

-- 4.2 Posting Rate Limits Table (Anti-spam)
CREATE TABLE IF NOT EXISTS posting_rate_limits (
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    post_date DATE NOT NULL,
    post_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (device_id, post_date)
);

-- 4.3 Moderation Queue Table (Crisis / Self-harm detection)
CREATE TABLE IF NOT EXISTS moderation_queue (
    id BIGSERIAL PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES emotion_posts(id) ON DELETE CASCADE,
    risk_score NUMERIC(5, 2),
    risk_type VARCHAR(50), -- SUICIDE, VIOLENCE, ABUSE, SPAM, SELF_HARM
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_risk ON moderation_queue(risk_score DESC);

-- =============================================================================
-- 5. NOTIFICATION DOMAIN
-- =============================================================================

-- 5.1 Notification Templates Table
CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL
);

-- 5.2 Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
    device_id UUID PRIMARY KEY REFERENCES devices(id) ON DELETE CASCADE,
    nearby_post_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reaction_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ai_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    daily_checkin_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    safety_alert_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    quiet_hour_from TIME,
    quiet_hour_to TIME,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5.3 Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    template_code VARCHAR(100),
    title VARCHAR(200),
    body TEXT,
    payload JSONB,
    status SMALLINT NOT NULL DEFAULT 0, -- 0=Pending, 1=Sent, 2=Read, 3=Failed
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notification_device ON notifications(device_id);
CREATE INDEX IF NOT EXISTS idx_notification_read ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notification_status ON notifications(status);

-- 5.4 Notification Queue Table (For background retry)
CREATE TABLE IF NOT EXISTS notification_queue (
    id BIGSERIAL PRIMARY KEY,
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    retry_count INT NOT NULL DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notification_queue_retry ON notification_queue(next_retry_at);

-- =============================================================================
-- 6. EVENT-DRIVEN TRANSACTIONAL OUTBOX DOMAIN
-- =============================================================================

-- 6.1 Outbox Events Table
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(100) NOT NULL, -- POST, USER, REACTION
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,     -- POST_CREATED, REACTION_ADDED
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, processed, failed, dead
    retry_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Partial index for maximum polling performance by Go Outbox Relay Worker
CREATE INDEX IF NOT EXISTS idx_outbox_events_status_created 
ON outbox_events (created_at ASC) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate 
ON outbox_events (aggregate_type, aggregate_id);
