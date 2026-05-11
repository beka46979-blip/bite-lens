-- Add email verification code field
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_code VARCHAR(255);
