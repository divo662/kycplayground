-- API Keys Table Schema
-- This table stores API keys for KYCPlayground users

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE, -- Store hashed version of the key
    key_prefix VARCHAR(50) NOT NULL,
    permissions JSON NOT NULL, -- Array of permission strings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP NULL,
    expires_at TIMESTAMP NULL, -- Optional expiration date
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_key_hash (key_hash),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Sample permissions:
-- - verifications:read
-- - verifications:write  
-- - webhooks:manage
-- - analytics:read
-- - billing:read

-- Example INSERT statement:
-- INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, permissions, is_active) 
-- VALUES (
--     'key_1234567890',
--     'user_123',
--     'Production API Key',
--     'hashed_key_value_here',
--     'kyc_prod_',
--     '["verifications:read", "verifications:write", "webhooks:manage"]',
--     true
-- );

-- Note: In production, you should:
-- 1. Hash the API keys before storing them (never store plain text)
-- 2. Implement proper user authentication
-- 3. Add rate limiting per API key
-- 4. Add audit logging for API key usage
-- 5. Implement key rotation policies 