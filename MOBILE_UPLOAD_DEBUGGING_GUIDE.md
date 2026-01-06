# Mobile Insurance Policy Upload - Debugging Guide

## Issue
Files are uploaded to Supabase storage bucket on mobile but NOT being saved to the `policy_documents` column in the database.

## Root Cause Analysis
The updated code now includes comprehensive logging to help identify where the issue occurs.

## Steps to Debug

### 1. Enable Developer Console on Mobile
**iOS (Safari)**:
- Connect iPhone to Mac
- Open Safari → Develop → [Device Name] → [Your App]
- Console tab will appear at the bottom

**Android (Chrome)**:
- Connect Android device via USB
- Open Chrome → chrome://inspect
- Find your PWA and click "Inspect"
- Console tab appears

### 2. Test on Mobile and Check Console Output

**When uploading files, you should see:**
```
📦 Starting file upload: {count: 2, documentName: "...", accountOwner: "..."}
⬆️ Uploading file 1/2: document.pdf
✅ File 1 uploaded: https://...
⬆️ Uploading file 2/2: image.jpg
✅ File 2 uploaded: https://...
📝 Updating file list: {newCount: 2, totalCount: 2}
📥 Files changed in parent: [https://..., https://...]
📋 Current policy documents state: [https://..., https://...]
```

**When saving the policy, you should see:**
```
📤 Submitting policy with documents: {
  documentCount: 2,
  documents: [https://..., https://...],
  isEdit: false
}
```

### 3. Identify Where It Breaks

#### Scenario A: Files don't upload to storage
- Look for: `⬆️ Uploading file` messages missing
- **Fix**: Check Supabase permissions, file size, network
- **Next**: Contact Supabase support

#### Scenario B: Files upload but URLs don't return
- Look for: `❌ File X upload failed (no URL returned)`
- **Fix**: Check if `getPublicUrl()` is working
- **Next**: Verify Supabase storage bucket is public

#### Scenario C: Files uploaded but state not updating
- Look for: `📥 Files changed in parent` is missing
- **Fix**: React state issue on mobile
- **Next**: Check if form has focus issues

#### Scenario D: State has files but form doesn't submit them
- Look for: `📤 Submitting policy with documents:` has empty array
- **Fix**: State clearing too early or form submission timing
- **Next**: Save should be disabled during upload

#### Scenario E: API request succeeds but database not updated
- Look for: No error in console but files not in DB
- **Fix**: Check backend route handling
- **Next**: Verify backend is receiving the array correctly

### 4. Network Request Inspection

In mobile DevTools:

1. Open **Network** tab
2. Perform upload and save
3. Find PUT/POST request to `/api/insurance-policies`
4. Check **Request Payload**:
   ```json
   {
     "policy_type": "...",
     "policy_documents": ["https://...", "https://..."],
     ...
   }
   ```
5. Check **Response**:
   ```json
   {
     "success": true,
     "data": {
       "id": "...",
       "policy_documents": ["https://...", "https://..."],
       ...
     }
   }
   ```

### 5. Common Mobile Issues

#### Issue: Touch event not triggering file picker
- **Sign**: No upload logs appear at all
- **Fix**: Check if file input is hidden and properly accessible
- **Solution**: Ensure input has proper z-index and isn't hidden by other elements

#### Issue: File upload succeeds but state clears on blur
- **Sign**: Files appear briefly then disappear
- **Fix**: Prevent form blur from clearing state
- **Solution**: Check useEffect dependencies

#### Issue: Browser refresh loses files before save
- **Sign**: Files show but disappear on soft focus change
- **Fix**: This is expected, files are only local state until saved
- **Solution**: User must save within same form session

#### Issue: Save button not responding on mobile
- **Sign**: Can't click save button
- **Fix**: Check if button is covered by keyboard
- **Solution**: Add padding below button in mobile view

### 6. Check Backend Response

Add this temporary debug code to see what backend receives:

In `src/server/src/routes/insurancePolicies.ts`, add at the top of POST route:

```typescript
router.post('/', async (req: Request, res: Response<ApiResponse<InsurancePolicy>>) => {
  try {
    console.log('📥 Received POST request:', {
      body: req.body,
      hasDocuments: !!req.body.policy_documents,
      documentCount: Array.isArray(req.body.policy_documents) ? req.body.policy_documents.length : 0,
      documentType: typeof req.body.policy_documents,
      documents: req.body.policy_documents
    });
    
    // ... rest of the code
```

### 7. Verify Database Column Type

Open Supabase Dashboard:
1. Go to Tables → insurance_policies
2. Scroll right to `policy_documents` column
3. Verify:
   - Type: `text[]` (text array)
   - NOT `text` or `json`
   - Default: `'{}'` (empty array)

If it's wrong type, it will cause conversion issues on mobile.

### 8. Test Data Format

Run this in Supabase SQL Editor:

```sql
-- Check a newly saved policy
SELECT id, policy_name, policy_documents, pg_typeof(policy_documents) as doc_type
FROM insurance_policies
WHERE created_at > now() - interval '1 hour'
LIMIT 1;
```

Should show:
- `policy_documents`: `{https://..., https://...}` (array format)
- `doc_type`: `text[]`

If it shows as string or JSON, that's the issue.

### 9. Clear Cache and Retry

On mobile:
1. **PWA**: Go to Settings → App Management → Clear Cache
2. **Browser**: Hamburger → History → Clear Browsing Data
3. **Hard Refresh**: Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
4. Retry upload

### 10. Enable Extra Logging

For even more detail, uncomment these lines in code before testing:

In `src/utils/documentUpload.ts`, add after file upload:
```typescript
console.log('🔗 Generated public URL:', publicUrl);
console.log('📄 File path used:', filePath);
console.log('🪣 Bucket name:', bucketName);
```

## Checklist Before Debugging

- [ ] Backend is running (test with `/health` endpoint)
- [ ] Supabase connection is active
- [ ] `policy_documents` column exists and is `text[]` type
- [ ] File input is accessible on mobile
- [ ] Mobile browser has console access
- [ ] Network request logging is enabled

## Expected Behavior

### Web (Working ✓)
1. Upload files → URLs appear in UI
2. Save policy → API request includes URLs
3. Check DB → URLs saved in `policy_documents`

### Mobile (After Fix)
1. Upload files → Console shows uploads complete
2. Save policy → Console shows submission with URLs
3. Check DB → URLs saved in `policy_documents`
4. Reload page → Documents still visible

## If Issue Persists

After checking all logs:

1. **Export the logs** from mobile console (take screenshots)
2. **Check Supabase logs** for API errors:
   - Go to Supabase Dashboard → Logs
   - Filter for recent requests
3. **Check backend logs** (if self-hosted):
   ```bash
   npm run dev  # shows console output
   ```
4. **Verify network connectivity**:
   - Slow 3G can cause timeouts
   - Upload might complete but response lost
   - Network tab shows request timing

## Performance Notes

- Large files (>5MB) might timeout on mobile networks
- Slow upload means documents might not be ready when form submits
- Current code waits for all uploads to complete before allowing save ✓

## After Fix Verification

Once documents save to DB on mobile:

1. [ ] Upload files on mobile
2. [ ] Save policy
3. [ ] Check Supabase - see URLs in column
4. [ ] Refresh mobile page - documents still visible
5. [ ] Edit policy on mobile - documents appear in upload section
6. [ ] Delete one document - verify only deleted one removed
7. [ ] Upload more documents - verify array grows

Test is complete! 🎉
