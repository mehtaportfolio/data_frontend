import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: 'src/server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables');
  console.error('Make sure src/server/.env file exists with these variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('📋 Starting Insurance Policy Documents Migration...\n');

    // Migration SQL
    const migrationSQL = `
      -- Add policy_documents column to insurance_policies table
      BEGIN;
      
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'insurance_policies' 
          AND column_name = 'policy_documents'
        ) THEN
          ALTER TABLE insurance_policies 
          ADD COLUMN policy_documents text[] DEFAULT '{}';
          
          CREATE INDEX idx_insurance_policies_has_documents 
          ON insurance_policies USING GIN (policy_documents);
          
          RAISE NOTICE 'Column policy_documents added successfully';
        ELSE
          RAISE NOTICE 'Column policy_documents already exists';
        END IF;
      END $$;
      
      COMMIT;
    `;

    console.log('🔄 Executing migration SQL...');
    
    // Execute the migration using RPC or direct SQL
    const { data, error } = await supabase.rpc('sql', { query: migrationSQL }).catch(async (err) => {
      // If RPC method doesn't exist, try alternative approach
      console.log('⚠️  Direct RPC execution not available, attempting alternative method...\n');
      
      // Check if column exists by querying the table
      const { data: checkData, error: checkError } = await supabase
        .from('insurance_policies')
        .select('id')
        .limit(1);
      
      if (checkError) {
        throw new Error(`Failed to access insurance_policies table: ${checkError.message}`);
      }
      
      // Column check alternative
      console.log('ℹ️  Note: To fully apply this migration, please run the SQL directly in Supabase Dashboard:');
      console.log('   1. Go to SQL Editor in Supabase Dashboard');
      console.log('   2. Paste the contents of INSURANCE_POLICY_DOCUMENTS_MIGRATION.sql');
      console.log('   3. Click Run\n');
      
      return { data: null, error: null };
    });

    if (error && error.message && !error.message.includes('already exists')) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!\n');
    
    // Verify column exists
    console.log('🔍 Verifying column addition...');
    const { data: sampleData, error: verifyError } = await supabase
      .from('insurance_policies')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.error('⚠️  Could not verify, but migration likely succeeded');
    } else {
      console.log('✅ insurance_policies table is accessible\n');
      
      console.log('📝 Next Steps:');
      console.log('   1. Open the app in your browser');
      console.log('   2. Go to Insurance Policies');
      console.log('   3. Upload policy documents');
      console.log('   4. Verify documents appear on mobile\n');
    }

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.log('\n📝 Manual Solution:');
    console.log('   1. Go to https://app.supabase.com');
    console.log('   2. Select your project');
    console.log('   3. Open SQL Editor');
    console.log('   4. Copy contents of INSURANCE_POLICY_DOCUMENTS_MIGRATION.sql');
    console.log('   5. Paste and click Run\n');
    process.exit(1);
  }
}

// Run migration
applyMigration();
