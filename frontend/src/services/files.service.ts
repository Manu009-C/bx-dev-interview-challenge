export interface FileUploadResponse {
  file: {
    id: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    s3Bucket: string;
    s3Key: string;
    thumbnailUrl: string | null;
    userId: string;
    uploadedAt: string;
  };
  message: string;
}

export interface FileDownloadResponse {
  downloadUrl: string;
  expiresIn: number;
}

export interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  s3Bucket: string;
  s3Key: string;
  thumbnailUrl: string | null;
  userId: string;
  uploadedAt: string;
}

export class FilesService {
  private baseUrl = 'http://localhost:3000/api/files';
  private getToken: (() => Promise<string | null>) | null = null;

  // Method to set the token getter function from the React component
  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    if (!this.getToken) {
      throw new Error('Token getter not set. Call setTokenGetter() first.');
    }
    
    const token = await this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserFiles(): Promise<FileMetadata[]> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.statusText}`);
    }

    return response.json();
  }

  async getFileDownloadUrl(fileId: string): Promise<FileDownloadResponse> {
    const response = await fetch(`${this.baseUrl}/${fileId}/download`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get download URL: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${fileId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    return response.json();
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    const response = await fetch(`${this.baseUrl}/${fileId}/metadata`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get file metadata: ${response.statusText}`);
    }

    return response.json();
  }
}
