import { LoaderIcon } from "lucide-react";

interface ImagePreviewProps {
  originalImage: string;
  processedImage: string | null;
  isProcessing: boolean;
}

export default function ImagePreview({
  originalImage,
  processedImage,
  isProcessing,
}: ImagePreviewProps) {
  return (
    <div className="space-y-2 flex justify-center items-center flex-col">
      <div className="relative w-96 max-xs:w-60 rounded-lg overflow-hidden flex items-center justify-center min-h-[200px]">
        {!processedImage ? (
          <div className="flex flex-col items-center ">
            <LoaderIcon className="animate-spin h-8 w-8 mb-2" />
          </div>
        ) : (
          <img
            src={processedImage || originalImage}
            alt={isProcessing ? "Original" : "Processed"}
            className="w-full h-auto"
          />
        )}

        {/* {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-col items-center text-white">
              <LoaderIcon className="animate-spin h-8 w-8 mb-2" />
              <div>Processing...</div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
