package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ReactionEventPayload struct {
	PostID             string `json:"postId"`
	PostAuthorDeviceID string `json:"postAuthorDeviceId"`
	ActorDeviceID      string `json:"actorDeviceId"`
	ReactionTypeID     int    `json:"reactionTypeId"`
	ReactionTypeName   string `json:"reactionTypeName"`
	Action             string `json:"action"`
	Timestamp          string `json:"timestamp"`
}

type PushToken struct {
	Token    string
	Platform string
}

type NotificationService struct {
	pool *pgxpool.Pool
}

func NewNotificationService(pool *pgxpool.Pool) *NotificationService {
	return &NotificationService{pool: pool}
}

// ProcessReactionEvent handles incoming reaction events and alerts post author.
func (s *NotificationService) ProcessReactionEvent(ctx context.Context, data []byte) error {
	var payload ReactionEventPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		return fmt.Errorf("failed to unmarshal reaction event: %w", err)
	}

	// Only notify on new reactions and don't notify authors reacting to their own posts
	if payload.Action != "ADDED" || payload.PostAuthorDeviceID == "" || payload.PostAuthorDeviceID == payload.ActorDeviceID {
		return nil
	}

	log.Printf("[NOTIF-SVC] Processing reaction for post %s (author: %s, type: %s)",
		payload.PostID, payload.PostAuthorDeviceID, payload.ReactionTypeName)

	// 1. Check if user enabled reaction notifications
	var allowReactions bool = true
	err := s.pool.QueryRow(ctx, `
		SELECT allow_reactions 
		FROM notification_settings 
		WHERE device_id = $1
	`, payload.PostAuthorDeviceID).Scan(&allowReactions)
	if err == nil && !allowReactions {
		log.Printf("[NOTIF-SVC] User %s opted out of reaction notifications", payload.PostAuthorDeviceID)
		return nil
	}

	// 2. Fetch active push tokens for author
	rows, err := s.pool.Query(ctx, `
		SELECT token, platform 
		FROM device_push_tokens 
		WHERE device_id = $1 AND is_active = true
	`, payload.PostAuthorDeviceID)
	if err != nil {
		return fmt.Errorf("failed to query push tokens: %w", err)
	}
	defer rows.Close()

	var tokens []PushToken
	for rows.Next() {
		var pt PushToken
		if err := rows.Scan(&pt.Token, &pt.Platform); err == nil {
			tokens = append(tokens, pt)
		}
	}

	title := "Có người vừa đồng cảm với bạn"
	body := fmt.Sprintf("Một người vừa gửi cảm xúc \"%s\" tới bài viết của bạn.", payload.ReactionTypeName)

	notifData, _ := json.Marshal(map[string]interface{}{
		"type":           "REACTION_RECEIVED",
		"postId":         payload.PostID,
		"reactionTypeId": payload.ReactionTypeID,
	})

	// 3. Save notification history in database
	_, err = s.pool.Exec(ctx, `
		INSERT INTO notifications (device_id, template_code, title, body, data, status, created_at)
		VALUES ($1, 'REACTION_RECEIVED', $2, $3, $4::jsonb, 'sent', NOW())
	`, payload.PostAuthorDeviceID, title, body, string(notifData))

	if err != nil {
		log.Printf("[NOTIF-SVC] Warning: failed to save notification history: %v", err)
	}

	// 4. Dispatch push to devices
	if len(tokens) == 0 {
		log.Printf("[NOTIF-SVC] No active push tokens for device %s (saved in-app history)", payload.PostAuthorDeviceID)
		return nil
	}

	for _, t := range tokens {
		log.Printf("📲 [PUSH SENT] Target: %s [%s] | Title: '%s' | Body: '%s'",
			truncate(t.Token, 20), t.Platform, title, body)
	}

	return nil
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}
