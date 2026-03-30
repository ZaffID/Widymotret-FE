# Portfolio Image Upload - Quick Reference

## URLs

```
Admin Panel:     http://localhost:5173/admin/portfolio
Public Portfolio: http://localhost:5173/portfolio/?category=portrait
```

## Backend Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/upload` | ✓ | Upload image file |
| PUT | `/api/content/:section/:field` | ✓ | Save content to DB |
| GET | `/api/content/:section/:field` | - | Get single field |
| GET | `/api/content/:section` | - | Get all fields in section |

## Database

**Table:** `content`
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY,
  section VARCHAR(50),
  field VARCHAR(100),
  value TEXT,
  updated_at TIMESTAMP,
  UNIQUE(section, field)
);
```

## Field Naming

Format: `{category}_{image_id}`

Categories:
- `portrait` (p1-p5)
- `event` (e1-e5)
- `editorial` (ed1-ed5)
- `retouching` (r1-r6)

Example: `portrait_p1`, `event_e2`

## Frontend Components

| File | Purpose |
|------|---------|
| `AdminPortfolio.tsx` | Admin upload UI |
| `EditableImage.tsx` | Image upload component |
| `Portfolio.tsx` | Public portfolio display |
| `contentStore.ts` | State management |
| `contentApi.ts` | API calls |
| `mediaUrl.ts` | URL resolution |

## Upload Response Format

```json
{
  "success": true,
  "data": {
    "url": "/uploads/portfolio/uuid-name.jpg"
  }
}
```

## Save Response Format

```json
{
  "success": true,
  "data": {
    "section": "portfolio",
    "field": "portrait_p1",
    "value": "/uploads/portfolio/uuid.jpg",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Invalid token | Re-login |
| 413 Payload Too Large | File > 5MB | Compress image |
| Invalid image file | Wrong type | Use JPG/PNG/WebP |
| Failed to connect | Backend down | Check API_URL |
| Content not found | No saved data | Upload first |

## Debug Tips

**Console Logs:**
```javascript
// Check EditableImage debug logs
console: [DEBUG EditableImage] Saving: ...

// Check uploads
POST /api/upload → Check response URL format

// Check saves
PUT /api/content/portfolio/portrait_p1 → Check response
```

**Quick Tests:**
```bash
# Test upload
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@image.jpg"

# Test content get
curl http://localhost:3000/api/content/portfolio/portrait_p1

# Test content save
curl -X PUT http://localhost:3000/api/content/portfolio/portrait_p1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "/uploads/portfolio/test.jpg"}'
```

## Environment Variables

```
VITE_API_URL=http://localhost:3000         # Dev
VITE_API_URL=https://api.example.com       # Prod
```

## First-Time Checklist

- [ ] Backend `/api/upload` endpoint working
- [ ] Backend content endpoints working
- [ ] Database `content` table exists
- [ ] Admin authentication working
- [ ] CORS configured
- [ ] Upload directory permissions OK
- [ ] Frontend environment variables set
- [ ] Admin can login to /admin/portfolio
- [ ] Upload works and saves to DB
- [ ] Images appear on /portfolio page
- [ ] Images persist after refresh

