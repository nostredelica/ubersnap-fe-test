"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FilterType } from "@/lib/image-processor";
import { LoaderIcon, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploaderProps {
  setImage: (image: string | null) => void;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export default function ImageUploader({
  setImage,
  setFilter,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const validateAndProcessFile = (file: File) => {
    setFilter("none");

    if (!file) {
      return;
    }

    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type", {
        description: "Please upload a PNG, JPG, JPEG, or WEBP image.",
      });
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 2MB.",
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + (100 - prev) * 0.1;
        return Math.min(newProgress, 95);
      });
    }, 100);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadProgress(100);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setTimeout(() => {
        setImage(event.target?.result as string);
        setIsLoading(false);
      }, 300);
    };

    reader.onerror = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      toast.error("Error reading file", {
        description: "There was a problem reading the image file.",
      });
      setIsLoading(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className={`w-full border-2 border-dashed rounded-lg p-6 transition-colors ${
        isDragging
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-blue-300"
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <div className="py-8 w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <LoaderIcon className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
            <p className="mb-3 text-sm text-gray-600">Uploading image...</p>
            <Progress value={uploadProgress} className="h-2 bg-gray-200" />
            <p className="mt-2 text-xs text-gray-500">
              {Math.round(uploadProgress)}%
            </p>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Drag & Drop your image here
            </h3>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-200 hover:bg-blue-300 text-blue-800"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Supports: PNG, JPG, JPEG, WEBP (Max: 2MB)
            </p>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
        />
      </div>
    </div>
  );
}
