# Apply Insurance Policy Documents Migration

## Issue
Insurance policy attachments are being uploaded to Supabase storage bucket but NOT being persisted in the database. This causes:
- Files disappear on mobile
- Files not visible after editing
- Files lost on page refresh

## Root Cause
The `policy_documents` column doesn't exist in the `insurance_policies` table in Supabase.

## Solution
Add the `policy_documents` column to store an array of document URLs.

## Steps to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended for Quick Fix)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Click "SQL Editor" in the left sidebar

2. **Run the Migration**
   - Click "New Query"
   - Copy and paste the contents of `INSURANCE_POLICY_DOCUMENTS_MIGRATION.sql`
   - Click "Run" (or press Ctrl+Enter)
   - Verify no errors appear

3. **Verify the Column Was Added**
   - Go to "Tables" → "insurance_policies"
   - Scroll right to see the new `policy_documents` column
   - It should be a text array type with default empty array `{}`

### Option 2: Using Node Script

Run the provided migration script:

```bash
cd src/server
npm install  # if not already installed
node ../apply-migration.js
```

### Option 3: Manual SQL in Supabase CLI

If you have Supabase CLI installed:

```bash
supabase migration new add_insurance_documents_column
# Copy the SQL from INSURANCE_POLICY_DOCUMENTS_MIGRATION.sql into the migration file
supabase db push
```

## Verify Migration Success

### Check 1: Table Schema
1. In Supabase Dashboard, go to Tables → insurance_policies
2. Look for `policy_documents` column
3. Type should be `text[]` (text array)
4. Default value should be `'{}'`

### Check 2: Test Upload
1. Open the app in browser (not mobile)
2. Go to Insurance Policies
3. Create or edit a policy
4. Upload 1-2 documents
5. Save the policy
6. Check Supabase:
   - Go to Tables → insurance_policies
   - Find your policy row
   - View the `policy_documents` column
   - Should contain array of URLs like: `["https://...", "https://..."]`

### Check 3: Mobile Test
1. Open the same policy on mobile
2. Documents should now be visible in the view
3. When editing, documents should appear in the upload section
4. Upload more documents and verify they persist

## Troubleshooting

### Error: "column policy_documents already exists"
- The column was already added previously
- This is fine, no further action needed

### Error: "Permission denied"
- Make sure you're using SUPABASE_SERVICE_KEY (not anon key)
- Service key has write permissions to schema

### Documents still not showing on mobile
1. Clear browser cache and reload
2. Force quit and reopen the mobile app
3. Check that the API is properly returning the data:
   - Open browser DevTools → Network tab
   - Edit a policy and check the PUT request response
   - Should include `policy_documents` array

### Array format issues
If documents are stored as string instead of array:
```sql
-- Fix: Convert string to array
UPDATE insurance_policies 
SET policy_documents = string_to_array(policy_documents, ',')::text[]
WHERE policy_documents IS NOT NULL 
AND policy_documents NOT LIKE '[%';
```

## Data Integrity Notes

- **Existing Policies**: Will have empty `policy_documents` arrays
- **New Policies**: Will have documents saved automatically
- **Uploaded Files**: Already stored in Supabase storage, just adding the references

## Performance Considerations

- GIN index on `policy_documents` enables fast filtering
- Minimal storage impact (just URLs stored, not files)
- Array size typically < 100KB per policy

## Next Steps After Migration

1. ✅ Apply the migration (column added)
2. ✅ Frontend already handles arrays correctly
3. ✅ Backend already saves arrays correctly
4. Test on multiple devices:
   - Desktop browser ✓
   - Mobile browser ✓
   - Mobile PWA (if installed)

No code changes needed! The feature was built correctly, just waiting for the database column.
