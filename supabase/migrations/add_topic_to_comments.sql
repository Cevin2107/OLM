-- Migration: Add topic column to comments
-- Run this in your Supabase SQL Editor
ALTER TABLE comments ADD COLUMN IF NOT EXISTS topic text;
