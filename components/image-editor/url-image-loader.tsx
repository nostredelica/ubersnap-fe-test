"use client";

import type React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";
import { useState } from "react";

interface UrlImageLoaderProps {
  setImage: (image: string | null) => void;
}

export default function UrlImageLoader({ setImage }: UrlImageLoaderProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const img = new Image();

      const imageLoadPromise = new Promise<string>((resolve, reject) => {
        img.onload = () => {
          console.log("Image loaded from URL:", url);
          console.log("Image dimensions:", img.width, "x", img.height);

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            try {
              ctx.drawImage(img, 0, 0);

              const dataUrl = canvas.toDataURL("image/png");
              console.log("Data URL created, length:", dataUrl.length);
              resolve(dataUrl);
            } catch (err) {
              console.error("Error drawing image to canvas:", err);

              reject(
                new Error(
                  "Unable to process image. It may be protected by CORS policy."
                )
              );
            }
          } else {
            reject(new Error("Could not create canvas context"));
          }
        };

        img.onerror = (e) => {
          console.error("Error loading image from URL:", e);
          reject(
            new Error(
              "Failed to load image from URL. Please check the URL and try again."
            )
          );
        };

        img.crossOrigin = "anonymous";
        img.src = url;
      });

      const dataUrl = await imageLoadPromise;
      setImage(dataUrl);
      setUrl("");
    } catch (err) {
      console.error("Error loading image from URL:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load image from URL"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleUrlSubmit} className="space-y-3">
        <div className="space-y-1">
          <div className="flex gap-2">
            <Input
              id="image-url"
              type="url"
              placeholder="https:"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 outline-none"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-200 hover:bg-blue-300 text-blue-800"
            >
              <Link className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Load"}
            </Button>
          </div>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="bg-red-50 text-red-800 border-red-200"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
