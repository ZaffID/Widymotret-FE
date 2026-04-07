# Portfolio Image Upload - Troubleshooting & Testing Guide

## Quick Start Checklist

- [ ] Backend `/api/upload` endpoint is working
- [ ] Backend `/api/content` endpoints are implemented  
- [ ] Admin authentication is configured
- [ ] Frontend environment variables are set
- [ ] Database table `content` exists
- [ ] `/public/uploads/portfolio/` directory exists on server

---

## Step 1: Verify Backend Health

### 1.1 Check Upload Endpoint

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <admin-token>" \
  -F "file=@test-image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "/uploads/portfolio/a1b2c3d4-e5f6.jpg"
  }
}
```

**Common Issues:**
- ❌ `401 Unauthorized` → Invalid or missing token
- ❌ `413 Payload Too Large` → File > 5MB
- ❌ `400 Invalid image file` → Wrong file type
- ❌ `500 Failed to save file` → Permissions or disk space issue

### 1.2 Check Content Endpoints

**Test GET /api/content/portfolio/portrait_p1:**
```bash
curl http://localhost:3000/api/content/portfolio/portrait_p1
```

**Expected Response (when no data exists):**
```json
{
  "success": false,
  "message": "Content not found"
}
```

**If you've saved data:**
```json
{
  "success": true,
  "message": "Content retrieved",
  "data": {
    "id": "uuid",
    "section": "portfolio",
    "field": "portrait_p1",
    "value": "/uploads/portfolio/image.jpg",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

**Test PUT /api/content/portfolio/portrait_p1:**
```bash
curl -X PUT http://localhost:3000/api/content/portfolio/portrait_p1 \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"value": "/uploads/portfolio/test.jpg"}'
```

---

## Step 2: Check Frontend Configuration

### 2.1 Verify API URL

**File:** `src/services/contentApi.ts`

```typescript
const API_BASE = `${import.meta.env.VITE_API_URL || 'https://widymotret-be-production.up.railway.app'}/api`;
```

**Local Development:**
Create `.env.local`:
```
VITE_API_URL=http://localhost:3000
```

### 2.2 Check Image URL Resolution

**File:** `src/utils/mediaUrl.ts`

The `resolveMediaUrl()` function should:
1. Keep absolute URLs (http://, https://) as-is
2. Prepend API_ORIGIN to `/uploads/` paths
3. Keep public assets (`/portrait/`, etc.) relative

**Test in browser console:**
```javascript
import { resolveMediaUrl } from './utils/mediaUrl.ts';

// Should return: https://api.example.com/uploads/portfolio/image.jpg
resolveMediaUrl('/uploads/portfolio/image.jpg');

// Should return: /portrait/portrait (1).png
resolveMediaUrl('/portrait/portrait (1).png');

// Should return: https://example.com/image.jpg
resolveMediaUrl('https://example.com/image.jpg');
```

---

## Step 3: Test Admin Panel

### 3.1 Access Admin Portfolio

1. Navigate to `http://localhost:5173/admin/portfolio`
2. Login with admin credentials
3. Select a category (e.g., "Portrait Photography")
4. Should see grid of portfolio images (e.g., p1, p2, p3, p4, p5)

### 3.2 Upload Test Image

1. Click on any image in the grid
2. A border should appear (edit mode)
3. Click one of the action buttons:
   - **Pencil icon**: Edit mode toggle
   - **Upload button**: File input
   - **Trash icon**: Delete (if implemented)

4. Click upload button or file input
5. Select an image file from your computer
6. Should see:
   - File validation message (if invalid)
   - Or preview of image after upload

### 3.3 Save and Verify

1. After upload, click "Simpan" (Save) button
2. Wait for success message
3. Refresh the page
4. Image should still appear (persisted to database)

**If image disappears after refresh:**
- ❌ Backend `/api/content` save failed
- ❌ contentStore not loading data at startup
- ❌ Database not persisting data

---

## Step 4: Test Public Portfolio Page

### 4.1 View Portfolio

1. Navigate to `http://localhost:5173/portfolio`
2. Should load portfolio images
3. Images might be placeholder URLs initially

### 4.2 Verify Image Loading

**Check browser Network tab:**
- Look for image requests
- Should see URLs like: `https://api.example.com/uploads/portfolio/uuid-name.jpg`
- Or public assets: `http://localhost:5173/portrait/portrait (1).png`

**If images don't load:**
- ❌ URL is incorrect
- ❌ Backend serving files incorrectly
- ❌ CORS issue (check browser console)

### 4.3 Test Category Switching

1. Click different category buttons
2. Images should change
3. Previously uploaded images should persist

---

## Step 5: Browser Console Debugging

### 5.1 Enable Debug Logs

The components have built-in debug logging:

**AdminPortfolio:**
```
[AdminHome] Portfolio grid onSave: portfolio_grid_0 = /uploads/...
```

**EditableImage:**
```
[DEBUG EditableImage] File selected: filename.jpg, size: 1234567, type: image/jpeg
[DEBUG EditableImage] Upload response: {success: true, data: {url: "..."}}
[DEBUG EditableImage] Setting currentValue to: /uploads/portfolio/uuid.jpg
[DEBUG EditableImage] Saving: section=portfolio, field=portrait_p1, value=/uploads/...
[DEBUG EditableImage] Save response: {success: true, data: {...}}
```

**View console output:**
1. Open browser DevTools: F12
2. Go to Console tab
3. Look for debug messages starting with `[DEBUG` or `[AdminHome]`

### 5.2 Monitor Network Requests

1. Open DevTools → Network tab
2. Perform upload action
3. Should see:
   - `POST /api/upload` → Response with URL
   - `PUT /api/content/portfolio/portrait_p1` → Response with saved data

---

## Common Issues & Fixes

### Issue: Upload fails with "Failed to connect to server"
**Cause:** Backend is down or URL is incorrect  
**Fix:**
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check `VITE_API_URL` in `.env.local`
3. Check CORS configuration on backend

### Issue: Upload succeeds but image doesn't save
**Cause:** `PUT /api/content` endpoint failing  
**Fix:**
1. Check backend logs for database errors
2. Verify `content` table exists in database
3. Verify admin token is valid

### Issue: Uploaded image shows broken image icon
**Cause:** Image URL not resolving correctly  
**Fix:**
1. Check `resolveMediaUrl()` function
2. Verify backend is serving uploaded files
3. Check file permissions on server

### Issue: Images appear after upload but disappear after refresh
**Cause:** contentStore not loading data at startup  
**Fix:**
1. Verify `contentStore.loadSection('portfolio')` is called
2. Check admin panel console for load errors
3. Verify `GET /api/content/portfolio` endpoint returns data

### Issue: "File harus berupa gambar" (File must be image) error
**Cause:** Invalid file type or corrupted file  
**Fix:**
1. Use JPEG, PNG, or WebP format
2. Try different image file
3. Check file magic bytes are correct

### Issue: "File terlalu besar" (File too large) error
**Cause:** Image file > 5MB  
**Fix:**
1. Compress image using online tool or image editor
2. Use format with better compression (WebP vs PNG)
3. Increase backend file size limit (if needed)

---

## Database Verification

### Check Table Exists
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'content'
);
```

### View Content Records
```sql
SELECT * FROM content WHERE section = 'portfolio' ORDER BY field;
```

### Check Specific Field
```sql
SELECT * FROM content 
WHERE section = 'portfolio' AND field = 'portrait_p1';
```

### Count by Category
```sql
SELECT 
    SUBSTRING(field, 1, POSITION('_' IN field)-1) as category,
    COUNT(*) as count
FROM content
WHERE section = 'portfolio'
GROUP BY category;
```

---

## Performance Monitoring

### Frontend

**Check React Profiler:**
1. Install "React Developer Tools" extension
2. Open Profiler tab
3. Go to admin panel
4. Perform image upload
5. Check for performance issues

### Backend

**Monitor Upload Performance:**
- Log upload time: Start to finish
- Monitor disk I/O during save
- Check memory usage during multipart parsing

**Database Performance:**
- Monitor INSERT/UPDATE times
- Check query execution with EXPLAIN ANALYZE
- Verify indexes are being used

---

## Integration Checklist

- [ ] Backend `/api/upload` endpoint implemented
- [ ] Backend `/api/content` endpoints implemented
- [ ] Frontend `EditableImage` component using endpoints
- [ ] Frontend `AdminPortfolio` page refactored
- [ ] Frontend `Portfolio` page loading from contentStore
- [ ] Admin authentication working
- [ ] File upload validation (type, size)
- [ ] Image URL persistence
- [ ] Public image display
- [ ] Error handling implemented
- [ ] CORS configured
- [ ] Database migrations applied
- [ ] File permissions correct
- [ ] Logs configured for debugging

---

## Testing Scenarios

### Scenario 1: Fresh Upload
```
1. Admin logs in
2. Goes to /admin/portfolio
3. Selects "Portrait Photography" category
4. Clicks on first image
5. Uploads new JPG file
6. Clicks Save
7. Sees success message
8. Refreshes page
9. Image still visible with new content
10. Goes to public /portfolio page
11. New image also visible there
```

### Scenario 2: Multiple Categories
```
1. Upload image to Portrait category
2. Switch to Event category
3. Upload image there too
4. Go back to Portrait
5. Portrait image still there
6. Switch to Editorial
7. Upload image
8. All three categories maintain their images
```

### Scenario 3: File Validation
```
1. Try uploading text file → Error: "Must be image"
2. Try uploading 10MB file → Error: "File too large"
3. Upload valid image → Success
4. Try replacing with invalid file → Error, keeps old image
```

---

## Next Steps If Issues Persist

1. **Check backend logs** for detailed error messages
2. **Check database logs** for SQL errors
3. **Enable CORS debugging** to see what's blocked
4. **Test with Postman** to isolate frontend vs backend
5. **Compare with reference implementation** (PORTFOLIO_BACKEND_REFERENCE.rs)
6. **Ask in documentation** if specific endpoint format differs

---

**Last Updated:** 2025-01-15
