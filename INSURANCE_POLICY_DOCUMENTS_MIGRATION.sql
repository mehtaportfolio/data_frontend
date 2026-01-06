-- Add policy_documents column to insurance_policies table
-- This migration adds support for storing multiple policy document URLs

BEGIN;

-- Check if column exists before adding it (Supabase specific)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'insurance_policies' 
    AND column_name = 'policy_documents'
  ) THEN
    ALTER TABLE insurance_policies 
    ADD COLUMN policy_documents text[] DEFAULT '{}';
    
    -- Create index for faster queries
    CREATE INDEX idx_insurance_policies_has_documents 
    ON insurance_policies USING GIN (policy_documents);
  END IF;
END $$;

COMMIT;
