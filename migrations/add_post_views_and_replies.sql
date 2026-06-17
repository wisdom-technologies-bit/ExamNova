-- Migration: Add post views tracking and contact message reply threads
-- Created: 2026-06-17

-- Create post_views table to track views
CREATE TABLE IF NOT EXISTS post_views (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_ip VARCHAR(45),
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_ip)
);

-- Create index for efficient view counting
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);

-- Add views_count column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create contact_message_replies table for reply threads
CREATE TABLE IF NOT EXISTS contact_message_replies (
  id SERIAL PRIMARY KEY,
  contact_message_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_contact_replies_message_id ON contact_message_replies(contact_message_id);
CREATE INDEX IF NOT EXISTS idx_contact_replies_created_at ON contact_message_replies(created_at);
