-- Add index on entity_id for efficient hypothesis lookups
CREATE INDEX IF NOT EXISTS idx_intent_hypothesis_entity_id 
    ON intent_hypotheses(entity_id);

-- Add index on type for filtering by hypothesis type
CREATE INDEX IF NOT EXISTS idx_intent_hypothesis_type 
    ON intent_hypotheses(type);

-- Composite index for common query pattern (entity_id + type)
CREATE INDEX IF NOT EXISTS idx_intent_hypothesis_entity_type 
    ON intent_hypotheses(entity_id, type);
