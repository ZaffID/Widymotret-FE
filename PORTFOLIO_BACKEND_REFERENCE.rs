// ===================================
// PORTFOLIO IMAGE MANAGEMENT ENDPOINTS
// ===================================
// Add these endpoints to your Actix-web backend (main.rs or separate module)
//
// Features:
// - File upload to /uploads/portfolio/
// - Image URL persistence to database
// - Content CRUD operations
// ===================================

use actix_web::{post, put, get, web, HttpResponse, HttpRequest, responder::Responder};
use actix_multipart::Multipart;
use futures::stream::StreamExt;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::io::Write;
use uuid::Uuid;
use chrono::Utc;

// ========== DATA STRUCTURES ==========

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct EditableContent {
    pub id: String,
    pub section: String,
    pub field: String,
    pub value: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadResponse {
    pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateContentRequest {
    pub value: String,
}

// ========== HELPER: Auth Guard ==========

#[derive(Debug)]
pub struct AdminUser {
    pub admin_id: i32,
    pub username: String,
}

pub async fn extract_admin(
    pool: &PgPool,
    req: &HttpRequest,
) -> Result<AdminUser, HttpResponse> {
    // Extract Bearer token
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let token = if auth_header.starts_with("Bearer ") {
        &auth_header[7..]
    } else {
        return Err(HttpResponse::Unauthorized()
            .json(ApiResponse::<()> {
                success: false,
                message: "Missing or invalid Authorization header".to_string(),
                data: None,
            }));
    };

    // Validate token and get admin_id (implement your auth logic here)
    // This is a placeholder - implement based on your auth system
    let admin_id: Result<i32, _> = validate_admin_token(pool, token).await;
    
    match admin_id {
        Ok(id) => Ok(AdminUser {
            admin_id: id,
            username: "admin".to_string(),
        }),
        Err(_) => Err(HttpResponse::Unauthorized()
            .json(ApiResponse::<()> {
                success: false,
                message: "Invalid or expired token".to_string(),
                data: None,
            })),
    }
}

// Placeholder: Replace with your actual token validation
async fn validate_admin_token(pool: &PgPool, token: &str) -> Result<i32, String> {
    // TODO: Implement your JWT/session validation here
    // Example: decode JWT, check expiry, verify admin role
    // For now, return a hardcoded admin_id
    Ok(1)
}

// ========== ENDPOINT 1: Upload Image ==========

/// POST /api/upload
/// Handles file upload to /public/uploads/portfolio/
#[post("/api/upload")]
pub async fn upload_image(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    mut payload: Multipart,
) -> impl Responder {
    // Verify admin
    let admin = match extract_admin(pool.get_ref(), &req).await {
        Ok(a) => a,
        Err(resp) => return resp,
    };

    // Extract file from multipart
    while let Some(item) = payload.next().await {
        if let Ok(mut field) = item {
            let filename = field.name();
            if filename != "file" {
                continue;
            }

            // Read file data
            let mut data = Vec::new();
            while let Some(chunk) = field.next().await {
                match chunk {
                    Ok(bytes) => data.extend_from_slice(&bytes),
                    Err(_) => {
                        return HttpResponse::BadRequest().json(ApiResponse::<()> {
                            success: false,
                            message: "Failed to read file".to_string(),
                            data: None,
                        })
                    }
                }
            }

            // Validate file size (max 5MB)
            if data.len() > 5 * 1024 * 1024 {
                return HttpResponse::BadRequest().json(ApiResponse::<()> {
                    success: false,
                    message: "File size exceeds 5MB limit".to_string(),
                    data: None,
                });
            }

            // Validate file type (basic check)
            if !is_valid_image(&data) {
                return HttpResponse::BadRequest().json(ApiResponse::<()> {
                    success: false,
                    message: "Invalid image file".to_string(),
                    data: None,
                });
            }

            // Generate unique filename
            let unique_id = Uuid::new_v4();
            let file_ext = get_file_extension(&data);
            let filename = format!("{}.{}", unique_id, file_ext);
            let filepath = format!("public/uploads/portfolio/{}", filename);

            // Save file to disk
            if let Err(e) = std::fs::write(&filepath, &data) {
                eprintln!("Failed to write file: {}", e);
                return HttpResponse::InternalServerError().json(ApiResponse::<()> {
                    success: false,
                    message: "Failed to save file".to_string(),
                    data: None,
                });
            }

            // Return success with relative URL
            let url = format!("/uploads/portfolio/{}", filename);
            return HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "File uploaded successfully".to_string(),
                data: Some(UploadResponse { url }),
            });
        }
    }

    HttpResponse::BadRequest().json(ApiResponse::<()> {
        success: false,
        message: "No file provided".to_string(),
        data: None,
    })
}

// ========== ENDPOINT 2: Update Content ==========

/// PUT /api/content/:section/:field
/// Saves or updates a content field (including portfolio image URLs)
#[put("/api/content/{section}/{field}")]
pub async fn update_content(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    path: web::Path<(String, String)>,
    body: web::Json<UpdateContentRequest>,
) -> impl Responder {
    // Verify admin
    let admin = match extract_admin(pool.get_ref(), &req).await {
        Ok(a) => a,
        Err(resp) => return resp,
    };

    let (section, field) = path.into_inner();

    // Upsert content record
    let sql = r#"
        INSERT INTO content (id, section, field, value, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (section, field) DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = EXCLUDED.updated_at
        RETURNING id, section, field, value, updated_at
    "#;

    let now = Utc::now().to_rfc3339();
    let record_id = Uuid::new_v4().to_string();

    match sqlx::query_as::<_, EditableContent>(sql)
        .bind(&record_id)
        .bind(&section)
        .bind(&field)
        .bind(&body.value)
        .bind(&now)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(record) => {
            eprintln!(
                "[Content] Updated {}.{} by admin {} = {}",
                section, field, admin.admin_id, body.value
            );
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Content updated successfully".to_string(),
                data: Some(record),
            })
        }
        Err(e) => {
            eprintln!("[Content] Error updating {}.{}: {}", section, field, e);
            HttpResponse::InternalServerError().json(ApiResponse::<()> {
                success: false,
                message: format!("Database error: {}", e),
                data: None,
            })
        }
    }
}

// ========== ENDPOINT 3: Get Single Content ==========

/// GET /api/content/:section/:field
/// Retrieves a single content field (public read)
#[get("/api/content/{section}/{field}")]
pub async fn get_content(
    pool: web::Data<PgPool>,
    path: web::Path<(String, String)>,
) -> impl Responder {
    let (section, field) = path.into_inner();

    let sql = "SELECT id, section, field, value, updated_at FROM content WHERE section = $1 AND field = $2";

    match sqlx::query_as::<_, EditableContent>(sql)
        .bind(&section)
        .bind(&field)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(record)) => {
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Content retrieved".to_string(),
                data: Some(record),
            })
        }
        Ok(None) => {
            HttpResponse::NotFound().json(ApiResponse::<()> {
                success: false,
                message: "Content not found".to_string(),
                data: None,
            })
        }
        Err(e) => {
            eprintln!("[Content] Error fetching {}.{}: {}", section, field, e);
            HttpResponse::InternalServerError().json(ApiResponse::<()> {
                success: false,
                message: "Database error".to_string(),
                data: None,
            })
        }
    }
}

// ========== ENDPOINT 4: Get Section Content ==========

/// GET /api/content/:section
/// Retrieves all content fields for a section (public read)
#[get("/api/content/{section}")]
pub async fn get_section_content(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> impl Responder {
    let section = path.into_inner();

    let sql = "SELECT id, section, field, value, updated_at FROM content WHERE section = $1 ORDER BY field";

    match sqlx::query_as::<_, EditableContent>(sql)
        .bind(&section)
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(records) => {
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "Section content retrieved".to_string(),
                data: Some(records),
            })
        }
        Err(e) => {
            eprintln!("[Content] Error fetching section {}: {}", section, e);
            HttpResponse::InternalServerError().json(ApiResponse::<()> {
                success: false,
                message: "Database error".to_string(),
                data: None,
            })
        }
    }
}

// ========== ENDPOINT 5: Get All Content ==========

/// GET /api/content
/// Retrieves all content from all sections (public read)
#[get("/api/content")]
pub async fn get_all_content(pool: web::Data<PgPool>) -> impl Responder {
    let sql = "SELECT id, section, field, value, updated_at FROM content ORDER BY section, field";

    match sqlx::query_as::<_, EditableContent>(sql)
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(records) => {
            HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: "All content retrieved".to_string(),
                data: Some(records),
            })
        }
        Err(e) => {
            eprintln!("[Content] Error fetching all content: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()> {
                success: false,
                message: "Database error".to_string(),
                data: None,
            })
        }
    }
}

// ========== HELPER FUNCTIONS ==========

fn is_valid_image(data: &[u8]) -> bool {
    // Check magic bytes for common image formats
    if data.len() < 4 {
        return false;
    }

    // JPEG: FF D8 FF
    if data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF {
        return true;
    }

    // PNG: 89 50 4E 47
    if data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47 {
        return true;
    }

    // WebP: RIFF ... WEBP
    if data.len() >= 12
        && data[0] == 0x52
        && data[1] == 0x49
        && data[2] == 0x46
        && data[3] == 0x46
        && data[8] == 0x57
        && data[9] == 0x45
        && data[10] == 0x42
        && data[11] == 0x50
    {
        return true;
    }

    false
}

fn get_file_extension(data: &[u8]) -> &'static str {
    if data.len() < 4 {
        return "bin";
    }

    // JPEG
    if data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF {
        return "jpg";
    }

    // PNG
    if data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47 {
        return "png";
    }

    // WebP
    if data.len() >= 12
        && &data[0..4] == b"RIFF"
        && &data[8..12] == b"WEBP"
    {
        return "webp";
    }

    "bin"
}

// ========== DATABASE SETUP ==========

// Run this SQL to create the required table:
/*
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section VARCHAR(50) NOT NULL,
    field VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    admin_id INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section, field)
);

CREATE INDEX idx_content_section ON content(section);
CREATE INDEX idx_content_section_field ON content(section, field);
*/

// ========== REGISTER ROUTES IN main.rs ==========

/*
In your App configuration, add:

    .route("/api/upload", post().to(upload_image))
    .route("/api/content", get().to(get_all_content))
    .route("/api/content/{section}", get().to(get_section_content))
    .route("/api/content/{section}/{field}", get().to(get_content))
    .route("/api/content/{section}/{field}", put().to(update_content))

Also ensure multipart is configured:
    use actix_multipart::MultipartError;
    
    app.app_data(web::JsonConfig::default()
        .error_handler(|err, _req| {
            // ... error handling
        })
    )
    .app_data(web::PayloadConfig::default()
        .limit(10 * 1024 * 1024)) // 10MB max
*/
