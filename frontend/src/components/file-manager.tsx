"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useAuth } from "@clerk/clerk-react";
import { FilesService } from "../services/files.service";
import { FileUpload } from "./file-upload";
import { FilesTable } from "./files-table";
import { AuthOverlay } from "./auth-overlay";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function FileManager() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [filesService] = useState(() => new FilesService());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Set up the token getter for the files service
  useEffect(() => {
    filesService.setTokenGetter(getToken);
  }, [filesService, getToken]);

  // Query to fetch user files
  const {
    data: files = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["files"],
    queryFn: () => filesService.getUserFiles(),
    enabled: isSignedIn,
  });

  // Mutation to upload file
  const uploadMutation = useMutation({
    mutationFn: (file: File) => filesService.uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setSelectedFile(null);
      toast.success("File uploaded successfully!");
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  // Mutation to delete file
  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => filesService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("File deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  // Function to handle file download
  const handleDownload = async (fileId: string) => {
    try {
      const response = await filesService.getFileDownloadUrl(fileId);
      window.open(response.downloadUrl, "_blank");
      toast.success("Download started!");
    } catch (error: any) {
      toast.error(`Download failed: ${error.message}`);
    }
  };

  // Function to handle file upload
  const handleFileUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  // Function to handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  // Function to handle file deletion
  const handleFileDelete = (fileId: string) => {
    deleteMutation.mutate(fileId);
  };

  return (
    <AuthOverlay>
      <div className="space-y-8">
        {/* File Upload Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 " />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClearFile={() => setSelectedFile(null)}
              disabled={!isSignedIn || uploadMutation.isPending}
            />
            
            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    Ready to upload: {selectedFile.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleFileUpload}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      "Upload File"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Files Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Files</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          
          <FilesTable
            files={files}
            onDelete={handleFileDelete}
            onDownload={handleDownload}
            isLoading={isLoading}
          />
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent>
              <p className="text-destructive text-sm">
                Error loading files: {error.message}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthOverlay>
  );
}
