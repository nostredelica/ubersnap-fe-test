"use client";

import DownloadButton from "@/components/image-editor/download-button";
import ImagePreview from "@/components/image-editor/image-preview";
import ImageUploader from "@/components/image-editor/image-uploader";
import UrlImageLoader from "@/components/image-editor/url-image-loader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { filters } from "@/lib/image-processor";
import cv from "@techstark/opencv-js";
import { useEffect, useState } from "react";

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("none");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cvLoaded, setCvLoaded] = useState<boolean>(false);

  useEffect(() => {
    cv.onRuntimeInitialized = () => {
      console.log("OpenCV.js initialized");
      setCvLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (image && cvLoaded) {
      processImage();
    }
  }, [image, filter, cvLoaded]);

  const processImage = () => {
    if (!cv || !image) return;

    setIsProcessing(true);

    const imgElement = document.createElement("img");
    imgElement.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imgElement.width;
      canvas.height = imgElement.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(imgElement, 0, 0);

      const src = cv.imread(canvas);
      const dst = new cv.Mat();

      try {
        src.copyTo(dst);

        switch (filter) {
          case "grayscale":
            window.cv.cvtColor(src, dst, window.cv.COLOR_RGBA2GRAY);
            break;
          case "sepia":
            const rgbaPlanes = new cv.MatVector();
            cv.split(dst, rgbaPlanes);

            const r = rgbaPlanes.get(0);
            const g = rgbaPlanes.get(1);
            const b = rgbaPlanes.get(2);
            const a = rgbaPlanes.get(3);

            const rNew = new cv.Mat();
            const gNew = new cv.Mat();
            const bNew = new cv.Mat();

            cv.addWeighted(r, 0.393, g, 0.769, 0, rNew);
            cv.addWeighted(rNew, 1, b, 0.189, 0, rNew);

            cv.addWeighted(r, 0.349, g, 0.686, 0, gNew);
            cv.addWeighted(gNew, 1, b, 0.168, 0, gNew);

            cv.addWeighted(r, 0.272, g, 0.534, 0, bNew);
            cv.addWeighted(bNew, 1, b, 0.131, 0, bNew);

            const newRgbaPlanes = new cv.MatVector();
            newRgbaPlanes.push_back(rNew);
            newRgbaPlanes.push_back(gNew);
            newRgbaPlanes.push_back(bNew);
            newRgbaPlanes.push_back(a);

            cv.merge(newRgbaPlanes, dst);

            rgbaPlanes.delete();
            r.delete();
            g.delete();
            b.delete();
            a.delete();
            rNew.delete();
            gNew.delete();
            bNew.delete();
            newRgbaPlanes.delete();
            break;
          case "blur":
            window.cv.GaussianBlur(src, dst, new window.cv.Size(7, 7), 0);
            break;
          case "sharpen":
            let kernel = window.cv.matFromArray(
              3,
              3,
              window.cv.CV_32F,
              [0, -1, 0, -1, 5, -1, 0, -1, 0]
            );
            window.cv.filter2D(src, dst, -1, kernel);
            break;
          case "edges":
            window.cv.Canny(src, dst, 50, 150);
            break;
          case "emboss":
            let embossKernel = window.cv.matFromArray(
              3,
              3,
              window.cv.CV_32F,
              [-2, -1, 0, -1, 1, 1, 0, 1, 2]
            );
            window.cv.filter2D(src, dst, -1, embossKernel);
            break;
          case "threshold":
            window.cv.threshold(src, dst, 127, 255, window.cv.THRESH_BINARY);
            break;
          case "cartoon":
            let gray = new window.cv.Mat();
            window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
            window.cv.medianBlur(gray, gray, 5);
            let edges = new window.cv.Mat();
            window.cv.adaptiveThreshold(
              gray,
              edges,
              255,
              window.cv.ADAPTIVE_THRESH_MEAN_C,
              window.cv.THRESH_BINARY,
              9,
              9
            );
            window.cv.cvtColor(edges, dst, window.cv.COLOR_GRAY2RGBA);
            gray.delete();
            edges.delete();
            break;
          case "hsv":
            window.cv.cvtColor(src, dst, window.cv.COLOR_RGB2HSV);
            break;
        }

        cv.imshow(canvas, dst);
        setProcessedImage(canvas.toDataURL());
      } catch (error) {
        console.error("Error processing image:", error);
      } finally {
        src.delete();
        dst.delete();
        setIsProcessing(false);
      }
    };

    imgElement.src = image;
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
                  <span className="bg-white px-4 font-semibold">Import Image from URL</span>
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
