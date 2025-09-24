# Backend API Documentation

## Authentication

All file management endpoints require authentication via Clerk JWT tokens.

**Headers Required:**
```
Authorization: Bearer <clerk-jwt-token>
```

## File Management Endpoints

### Upload File
- **POST** `/api/files/upload`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (file upload)
- **Response**: 
```json
{
  "file": {
    "id": "uuid",
    "originalName": "document.pdf",
    "fileName": "users/user-id/uuid-document.pdf",
    "mimeType": "application/pdf",
    "size": 1024,
    "s3Bucket": "bonusx-bucket",
    "s3Key": "users/user-id/uuid-document.pdf",
    "thumbnailUrl": null,
    "userId": "user-id",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "File uploaded successfully"
}
```

### Get User Files
- **GET** `/api/files`
- **Response**: Array of file objects

### Get File Download URL
- **GET** `/api/files/:id/download`
- **Response**:
```json
{
  "downloadUrl": "https://s3.amazonaws.com/bucket/presigned-url",
  "expiresIn": 3600
}
```

### Get File Metadata
- **GET** `/api/files/:id/metadata`
- **Response**: File object

### Delete File
- **DELETE** `/api/files/:id`
- **Response**:
```json
{
  "message": "File deleted successfully"
}
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/bonusx_db

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=NINJA_ACCESS_KEY
S3_SECRET_ACCESS_KEY=NINJA_SECRET_KEY
S3_BUCKET_NAME=bonusx-bucket
S3_REGION=us-east-1

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_Y3JlYXRpdmUtY29sdC02MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_PEM_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA55zZWpy/h/6UjrPXq1bi
Z31hSzw9vyOYuKTUmiqeYPNl/eimksFo0Jupo+rtllpH8+ax6rl6/mexTd9ohOZB
mvz5eq0FCwRN/09WjqyEga3bDnu/2QlgM4lvIRXqoO6l67BRBwIXkamdhmfCc2yd
ob+XppGtf4suchoDZVpbqVp943liqlUGDlk8DLa976wZRhtjAes2HhH9li4PIUL7
lJPOFdLu6nbDq7uT6cAPl1JGLOlD8VOsVnh+CEutmhW6HzxKHMB3ySDbsZlRcbuS
t1VAtsjoxQI1TyiaHE1Add9rkxoVn7Cf5NVMxBs5k9IcwVwZ+AwSQeiS+0IVs3aU
1wIDAQAB
-----END PUBLIC KEY-----
# OR use JWKS URL instead of PEM key (recommended)
CLERK_JWKS_URL=https://creative-colt-60.clerk.accounts.dev/.well-known/jwks.json

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Supported File Types

- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Maximum file size: 10MB

## Database Schema

### Users Table
- `id` (string, primary key) - Clerk user ID
- `email` (string, unique)
- `firstName` (string, nullable)
- `lastName` (string, nullable)
- `profileImageUrl` (string, nullable)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Files Table
- `id` (uuid, primary key)
- `originalName` (string) - Original filename
- `fileName` (string) - S3 key
- `mimeType` (string) - File MIME type
- `size` (bigint) - File size in bytes
- `s3Bucket` (string) - S3 bucket name
- `s3Key` (string) - S3 object key
- `thumbnailUrl` (string, nullable) - Thumbnail URL
- `userId` (string) - Foreign key to users.id
- `uploadedAt` (timestamp)
