"use client";

import { useState } from "react";
import { FileMetadata, FileExtensionType } from "../services/files.service";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ExternalLink, Trash2, File, Image, FileText, Music } from "lucide-react";

interface FilesTableProps {
  files: FileMetadata[];
  onDelete: (fileId: string) => void;
  onDownload: (fileId: string) => Promise<void>;
  isLoading?: boolean;
}

export function FilesTable({ files, onDelete, onDownload, isLoading = false }: FilesTableProps) {
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const getFileIcon = (extensionType: FileExtensionType) => {
    switch (extensionType) {
      case FileExtensionType.PNG:
      case FileExtensionType.JPG:
        return <Image className="h-4 w-4" />;
      case FileExtensionType.PDF:
        return <FileText className="h-4 w-4" />;
      case FileExtensionType.MP3:
        return <Music className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getFileTypeBadge = (extensionType: FileExtensionType) => {
    switch (extensionType) {
      case FileExtensionType.PNG:
        return <Badge variant="secondary">PNG</Badge>;
      case FileExtensionType.JPG:
        return <Badge variant="secondary">JPG</Badge>;
      case FileExtensionType.PDF:
        return <Badge variant="secondary">PDF</Badge>;
      case FileExtensionType.MP3:
        return <Badge variant="secondary">MP3</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatFileSize = (sizeInMB: number | string) => {
    // Ensure size is a number (database may return decimal as string)
    const size = typeof sizeInMB === 'string' ? parseFloat(sizeInMB) : sizeInMB;
    
    if (size === 0 || isNaN(size)) return "0 MB";
    if (size < 1) {
      return `${(size * 1024).toFixed(2)} KB`;
    }
    if (size < 1024) {
      return `${size.toFixed(2)} MB`;
    }
    return `${(size / 1024).toFixed(2)} GB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (fileId: string) => {
    setDeletingFileId(fileId);
    try {
      await onDelete(fileId);
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleDownload = async (fileId: string) => {
    setDownloadingFileId(fileId);
    try {
      await onDownload(fileId);
    } finally {
      setDownloadingFileId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Upload your first file using the area above</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Files ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getFileIcon(file.extensionType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getFileTypeBadge(file.extensionType)}
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(file.uploadedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file.id)}
                  disabled={downloadingFileId === file.id}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(file.id)}
                  disabled={deletingFileId === file.id}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  {deletingFileId === file.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
