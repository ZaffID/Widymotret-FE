# Content API Integration Guide

## Overview

Sistem content management menggunakan mock API di `src/services/contentApi.ts` yang siap untuk diintegrasikan dengan backend API real setelah tersedia.

## Current Status

- **Status**: Mock API (Development Mode)
- **Location**: `src/services/contentApi.ts`
- **Data Store**: In-memory Map (tidak persisten)
- **Authentication**: Menggunakan token dari authStore

## Content Sections & Fields

### 1. Hero Section (`hero`)
- `title` - Hero main title
- `subtitle` - Hero subtitle/description

### 2. Introduction Section (`introduction`)
- `heading` - Main heading "Halo, Anda sudah menemukan kami!"
- `description1` - First paragraph
- `description2` - Second paragraph

### 3. About Section (`about`)
- `title` - "Widymotret"
- `description1` - First paragraph about studio
- `description2` - Second paragraph about approach

### 4. Services Section (`services`)
- `title` - Section heading
- `subtitle` - Section subheading

### 5. Booking Process Section (`booking`)
- `title` - "Alur Booking"
- `subtitle` - Section description
- `step1_title`, `step1_description`
- `step2_title`, `step2_description`
- `step3_title`, `step3_description`
- `step4_title`, `step4_description`
- `step5_title`, `step5_description`
- `step6_title`, `step6_description`

### 6. Portfolio Section (`portfolio`)
- `title` - Section heading

### 7. Featured Shots Section (`featured`)
- `title` - Section heading
- `subtitle` - Section description

### 8. Testimonials Section (`testimonials`)
- `title` - Section heading

### 9. Settings Section (`settings`)
- `phone` - Contact phone number
- `email` - Contact email
- `address` - Physical address
- `whatsapp` - WhatsApp number (without + sign)
- `instagram` - Instagram handle

## Current API Functions

```typescript
// Get single content field
getContent(section: string, field: string): Promise<ApiResponse<EditableContent>>

// Get all content for a section
getSectionContent(section: string): Promise<ApiResponse<EditableContent[]>>

// Update single field
updateContent(section: string, field: string, value: string): Promise<ApiResponse<EditableContent>>

// Batch update multiple fields
batchUpdateContent(updates: Array<{section, field, value}>): Promise<ApiResponse<EditableContent[]>>

// Delete content field
deleteContent(section: string, field: string): Promise<ApiResponse<void>>

// Get all content
getAllContent(): Promise<ApiResponse<EditableContent[]>>
```

## API Response Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface EditableContent {
  id: string;
  section: string;
  field: string;
  value: string;
  updated_at: string;
}
```

## Backend Integration Steps

When backend API is ready, follow these steps:

### Step 1: Update contentApi.ts
Replace mock implementation with real API calls:

```typescript
// Example - Replace getContent function
export const getContent = async (
  section: string,
  field: string
): Promise<ApiResponse<EditableContent>> => {
  const token = authStore.getToken();
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/content/${section}/${field}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to fetch content',
        error: `HTTP ${response.status}`,
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'Content fetched successfully',
      data: data,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Error fetching content',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};
```

### Step 2: Define Backend API Endpoints

Suggested endpoint structure:

**GET** `/api/content/:section/:field`
- Fetch single content field
- Returns: `{ data: EditableContent }`

**GET** `/api/content/:section`
- Fetch all content in a section
- Returns: `{ data: EditableContent[] }`

**GET** `/api/content`
- Fetch all content
- Returns: `{ data: EditableContent[] }`

**POST/PUT** `/api/content/:section/:field`
- Update single field
- Body: `{ value: string }`
- Returns: `{ data: EditableContent }`

**POST** `/api/content/batch`
- Batch update multiple fields
- Body: `{ updates: Array<{section, field, value}> }`
- Returns: `{ data: EditableContent[] }`

**DELETE** `/api/content/:section/:field`
- Delete content field
- Returns: `{ success: boolean }`

### Step 3: Authentication

All endpoints should require Bearer token authentication:
```
Authorization: Bearer {token}
```

Token is available via `authStore.getToken()`

### Step 4: Environment Configuration

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:3000
```

Update contentApi.ts:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

## Database Schema (Suggested)

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY,
  section VARCHAR(255) NOT NULL,
  field VARCHAR(255) NOT NULL,
  value TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section, field),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## Admin Components Using Content API

1. **EditableText.tsx** - Handles single field editing with UI
2. **contentStore.ts** - Manages content state in frontend
3. **AdminHome.tsx** - Admin interface with tabs for each section

## Error Handling

All API functions already include error handling:
- Network errors are caught
- HTTP errors are returned with status codes
- Messages are user-friendly
- Success/error notifications appear in UI

## Future Enhancements

1. **Image Upload** - Create `EditableImage` component similar to `EditableText`
2. **Service Management** - Add CRUD for services (not just content fields)
3. **Rich Text Editor** - Replace textarea with rich text editor for descriptions
4. **Revision History** - Track content changes over time
5. **Rollback** - Ability to revert to previous versions
6. **Multi-language** - Support for Indonesian and English content

## Testing

Current mock API includes:
- 300-800ms simulated network delays
- In-memory data persistence during session
- Proper error responses for non-existent fields

To test with real backend:
1. Comment out mock data initialization
2. Replace API functions with real endpoints
3. Ensure backend returns correct response structure
4. Test with real network delays

## Notes

- All timestamps use ISO 8601 format
- IDs are auto-generated on backend
- Content is case-sensitive
- Section/field names use snake_case
- Validation should happen on both frontend (UI feedback) and backend (security)
