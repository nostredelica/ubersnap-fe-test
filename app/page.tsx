"use client";

import DownloadButton from "@/components/image-editor/download-button";
import ImagePreview from "@/components/image-editor/image-preview";
import ImageUploader from "@/components/image-editor/image-uploader";
import UrlImageLoader from "@/components/image-editor/url-image-loader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { filters, FilterType, processImageWithFilter } from "@/lib/image-processor";
import cv from "@techstark/opencv-js";
import { useEffect, useState } from "react";

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("none");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cvLoaded, setCvLoaded] = useState<boolean>(false);

  useEffect(() => {
    cv.onRuntimeInitialized = () => {
      console.log("OpenCV.js initialized");
      setCvLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (image && cvLoaded && !isProcessing) {
      handleProcessImage();
    }
  }, [image, filter, cvLoaded]);

  const handleProcessImage = async () => {
    if (!cv || !image) return;

    try {
      const result = await processImageWithFilter(
        image,
        filter,
        setIsProcessing
      );
      setProcessedImage(result);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleCancel = () => {
    setFilter("none");

    setImage(null);
    setProcessedImage(null);
  };

  const handleSetImage = (image: string | null) => {
    setImage(image);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-slate-200 p-4 md:p-8">
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          {!image && (
            <>
              <ImageUploader setFilter={setFilter} setImage={handleSetImage} />
              <div className="relative flex flex-col w-full gap-4 my-6">
                <Separator className="mb-4" />
                <Label
                  htmlFor="image-url"
                  className="text-sm font-medium absolute flex justify-center w-full items-center -top-[10px]"
                >
                  <span className="bg-white px-4 font-semibold">
                    Import Image from URL
                  </span>
                </Label>
                <UrlImageLoader setImage={handleSetImage} />
              </div>
            </>
          )}

          {image && (
            <div className="mt-8 space-y-6">
              <ImagePreview
                originalImage={image}
                processedImage={processedImage}
                isProcessing={isProcessing}
              />

              {processedImage && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-medium text-blue-700 mb-4">
                      Filter Previews
                    </h3>
                    <div className="flex gap-4 max-lg:overflow-x-scroll">
                      {filters.map(([item, thumbnail]) => (
                        <div
                          key={item}
                          className="space-y-2 w-28 cursor-pointer"
                          onClick={() => setFilter(item)}
                        >
                          <div
                            className={`border-2 rounded-lg overflow-hidden ${
                              filter === item
                                ? "border-blue-500"
                                : "border-transparent"
                            }`}
                          >
                            <img
                              src={thumbnail}
                              alt={`${item} preview`}
                              className="w-full h-auto min-w-16"
                            />
                          </div>
                          <p
                            className={`text-center text-sm text-blue-600 ${
                              filter === item ? "font-semibold" : "font-normal"
                            } capitalize`}
                          >
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <Button onClick={handleCancel} variant="outline">
                      Cancel
                    </Button>
                    <DownloadButton
                      filterName={filter}
                      processedImage={processedImage}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
