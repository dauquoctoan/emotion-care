-- =============================================================================
-- EMOTION CARE PLATFORM - MIGRATION 04: UPDATE POST & DEVICE SCHEMA
-- Adds author_alias, style_type, atmosphere, copy_count, viral_score
-- Adds app_mode, author_alias to device_settings
-- Creates saved_posts table for user bookmarks
-- =============================================================================

-- 1. Extend emotion_posts table
ALTER TABLE emotion_posts
    ADD COLUMN IF NOT EXISTS author_alias VARCHAR(100),
    ADD COLUMN IF NOT EXISTS style_type VARCHAR(50) NOT NULL DEFAULT 'serif',
    ADD COLUMN IF NOT EXISTS atmosphere VARCHAR(50) NOT NULL DEFAULT 'obsidian',
    ADD COLUMN IF NOT EXISTS copy_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS viral_score NUMERIC(10, 2) NOT NULL DEFAULT 0.0;

CREATE INDEX IF NOT EXISTS idx_posts_viral_score ON emotion_posts(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_copy_count ON emotion_posts(copy_count DESC);

-- 2. Extend device_settings table
ALTER TABLE device_settings
    ADD COLUMN IF NOT EXISTS app_mode VARCHAR(30) NOT NULL DEFAULT 'DUAL_MODE',
    ADD COLUMN IF NOT EXISTS author_alias VARCHAR(100);

-- 3. Create saved_posts table (Bookmarks)
CREATE TABLE IF NOT EXISTS saved_posts (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES emotion_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_saved_device_post UNIQUE (device_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_posts_device ON saved_posts(device_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created ON saved_posts(created_at DESC);
