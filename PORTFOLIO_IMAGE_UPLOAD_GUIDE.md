# Portfolio Image Upload Implementation Guide

## Overview

The portfolio image upload feature in Widymotret-FE requires backend support for two main endpoints:

1. **`POST /api/upload`** - Handles file uploads and returns a URL
2. **`PUT /api/content/:section/:field`** - Persists image URLs to the database
3. **`GET /api/content/:section/:field`** - Retrieves saved image URLs

---

## Backend Endpoints Required

### 1. Image Upload Endpoint

**Endpoint:** `POST /api/upload`

**Authentication:** Required (Bearer token)

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body Parameter: `file` (File)
- Headers: `Authorization: Bearer <token>`

**Response Format:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "/uploads/portfolio/uuid-filename.jpg"
  }
}
```

**Expected Behavior:**
- Accept image files (JPG, PNG, WebP, etc.) up to 5MB
- Store file on server with unique filename
- Return relative URL path (starting with `/uploads/`)
- Frontend will prepend the API base URL for display

**Error Response:**
```json
{
  "success": false,
  "message": "File size exceeds 5MB limit"
}
```

---

### 2. Content Update Endpoint

**Endpoint:** `PUT /api/content/:section/:field`

**Authentication:** Required (Bearer token)

**Request:**
```json
{
  "value": "/uploads/portfolio/image-uuid.jpg"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Content updated successfully",
  "data": {
    "id": "content-uuid",
    "section": "portfolio",
    "field": "portrait_p1",
    "value": "/uploads/portfolio/image-uuid.jpg",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Parameters:**
- `section`: string (e.g., `"portfolio"`)
- `field`: string (e.g., `"portrait_p1"`, `"event_e1"`)
- `value`: string (URL or path)

**Database Table Schema:**
```sql
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR(50) NOT NULL,
  field VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  admin_id INTEGER REFERENCES admins(id),
  UNIQUE(section, field)
);
```

---

### 3. Content Retrieval Endpoint

**Endpoint:** `GET /api/content/:section/:field`

**Authentication:** Optional (public read, auth optional)

**Response Format:**
```json
{
  "success": true,
  "message": "Content retrieved successfully",
  "data": {
    "id": "content-uuid",
    "section": "portfolio",
    "field": "portrait_p1",
    "value": "/uploads/portfolio/image-uuid.jpg",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Section Content Retrieval Endpoint (Batch Load)

**Endpoint:** `GET /api/content/:section`

**Response Format:**
```json
{
  "success": true,
  "message": "Section content retrieved successfully",
  "data": [
    {
      "id": "content-uuid-1",
      "section": "portfolio",
      "field": "portrait_p1",
      "value": "/uploads/portfolio/image-1.jpg",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "content-uuid-2",
      "section": "portfolio",
      "field": "portrait_p2",
      "value": "/uploads/portfolio/image-2.jpg",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Frontend Field Naming Convention

Field names follow this pattern: `{category}_{image_id}`

**Examples:**
- `portrait_p1` → Portfolio image p1 in portrait category
- `event_e1` → Portfolio image e1 in event category
- `editorial_ed1` → Portfolio image ed1 in editorial category
- `retouching_r1` → Portfolio image r1 in retouching category

**Categories:**
- `portrait` - Portrait Photography
- `event` - Event and Wedding Coverage
- `editorial` - Editorial and Brand Shots
- `retouching` - Image Retouching and Editing

**Image IDs:** See [src/data/portfolio.ts](src/data/portfolio.ts) for full list

---

## Upload Flow Diagram

```
┌─────────────────────────┐
│  User selects image     │
│  via EditableImage UI   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  POST /api/upload                       │
│  - Validate file (type, size)           │
│  - Generate unique filename             │
│  - Store in /public/uploads/portfolio   │
│  - Return relative URL                  │
└────────┬────────────────────────────────┘
         │
         ▼ (if upload succeeds)
┌──────────────────────────────────────────┐
│  PUT /api/content/portfolio/{field}      │
│  - Save URL to database                  │
│  - Record admin_id & timestamp           │
│  - Return saved content record           │
└────────┬─────────────────────────────────┘
         │
         ▼ (if save succeeds)
┌──────────────────────────────────────────┐
│  EditableImage displays new image        │
│  - Shows preview with resolveMediaUrl    │
│  - Shows success message                 │
└──────────────────────────────────────────┘
```

---

## Frontend URL Resolution

The frontend has a `resolveMediaUrl()` utility in [src/utils/mediaUrl.ts](src/utils/mediaUrl.ts):

```typescript
export const resolveMediaUrl = (value: string): string => {
  if (!value) return value;

  // Already absolute URL
  if (/^https?:\/\//i.test(value)) return value;

  // Uploaded assets are stored on backend
  if (value.startsWith('/uploads/')) {
    return `${API_ORIGIN}${value}`;
  }
  if (value.startsWith('uploads/')) {
    return `${API_ORIGIN}/${value}`;
  }

  // Public assets remain relative to frontend
  return value;
};
```

**API Origin:** `https://widymotret-be-production.up.railway.app` (or local dev server)

---

## Testing the Workflow

### 1. Admin Login
1. Navigate to `/admin/portfolio`
2. Login with admin credentials

### 2. Upload Image
1. Click on image in EditableImage component
2. Click pencil icon to enable edit mode
3. Click upload button or file input
4. Select an image file (JPG, PNG, WebP)
5. Should see preview
6. Click Save button

### 3. Verify Persistence
1. Refresh the page
2. Image should still appear (loaded from database)
3. Edit other categories - images should be independent

### 4. Frontend Display
1. Navigate to `/portfolio` public page
2. Switch between categories
3. Verify images display correctly
4. Check that uploaded images appear with correct URLs

---

## Error Handling

### Common Errors

| Issue | Cause | Fix |
|-------|-------|-----|
| Upload fails with 401 | No/invalid token | Re-login to admin panel |
| Upload fails with 413 | File > 5MB | Compress image before upload |
| Upload fails with 400 | Invalid file type | Use JPG, PNG, WebP format |
| Images show broken | URL not resolving | Check API_ORIGIN in frontend |
| Saved images don't persist | DB error or API issue | Check backend logs |

---

## Environment Variables

**Frontend (.env.local):**
```
VITE_API_URL=https://widymotret-be-production.up.railway.app
# or for local development:
VITE_API_URL=http://localhost:3000
```

---

## File Structure

```
Backend (expected):
├── /uploads
│   └── /portfolio
│       ├── uuid-image-1.jpg
│       ├── uuid-image-2.jpg
│       └── ...
├── routes/
│   ├── /api/upload (POST)
│   └── /api/content (PUT, GET)
└── models/
    └── content.ts

Frontend:
├── src/
│   ├── components/admin/EditableImage.tsx
│   ├── pages/admin/AdminPortfolio.tsx
│   ├── pages/Portfolio.tsx
│   ├── stores/contentStore.ts
│   ├── services/contentApi.ts
│   ├── utils/mediaUrl.ts
│   └── data/portfolio.ts
```

---

## Next Steps

1. **Implement backend endpoints** if not already done
2. **Test upload functionality** in admin panel
3. **Verify images display** in public Portfolio page
4. **Monitor backend logs** for any errors
5. **Set up CORS properly** to allow cross-origin requests

---

## Support for Multiple Projects

The same content management system could support multiple projects:
- Woven UI Gallery → `section: "woven-gallery"`
- MTK Materials → `section: "mtk-content"`
- Others → `section: "project-name"`

All using the same `/api/content/:section/:field` endpoint.

---

**Last Updated:** 2025-01-15
