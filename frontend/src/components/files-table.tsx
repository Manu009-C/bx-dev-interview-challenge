"use client";

import { useState } from "react";
import { FileMetadata } from "../services/files.service";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ExternalLink, Trash2, File, Image, FileText, FileSpreadsheet, FileSliders } from "lucide-react";

interface FilesTableProps {
  files: FileMetadata[];
  onDelete: (fileId: string) => void;
  onDownload: (fileId: string) => Promise<void>;
  isLoading?: boolean;
}

export function FilesTable({ files, onDelete, onDownload, isLoading = false }: FilesTableProps) {
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    } else if (mimeType === "application/pdf") {
      return <FileText className="h-4 w-4" />;
    } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return <FileSpreadsheet className="h-4 w-4" />;
    } else if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
      return <FileSliders className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const getFileTypeBadge = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Badge variant="secondary">Image</Badge>;
    } else if (mimeType === "application/pdf") {
      return <Badge variant="secondary">PDF</Badge>;
    } else if (mimeType.includes("word")) {
      return <Badge variant="secondary">Word</Badge>;
    } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return <Badge variant="secondary">Excel</Badge>;
    } else if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
      return <Badge variant="secondary">PowerPoint</Badge>;
    } else if (mimeType === "text/plain") {
      return <Badge variant="secondary">Text</Badge>;
    } else {
      return <Badge variant="outline">Document</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
                  {getFileIcon(file.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getFileTypeBadge(file.mimeType)}
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
