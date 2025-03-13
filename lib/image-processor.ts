import cv from "@techstark/opencv-js";

export type FilterType =
  | "none"
  | "grayscale"
  | "sepia"
  | "blur"
  | "sharpen"
  | "edges"
  | "emboss"
  | "threshold"
  | "cartoon";

export const applyGrayscale = (src: any, dst: any): void => {
  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

  if (dst.channels() === 1) {
    cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
  }
};

export const applySepia = (src: any, dst: any): void => {
  src.copyTo(dst);
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
};

export const applyBlur = (src: any, dst: any): void => {
  cv.GaussianBlur(src, dst, new cv.Size(7, 7), 0);
};

export const applySharpen = (src: any, dst: any): void => {
  const kernel = cv.matFromArray(
    3,
    3,
    cv.CV_32F,
    [0, -1, 0, -1, 5, -1, 0, -1, 0]
  );
  cv.filter2D(src, dst, -1, kernel);
  kernel.delete();
};

export const applyEdges = (src: any, dst: any): void => {
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.Canny(gray, gray, 50, 150);
  cv.cvtColor(gray, dst, cv.COLOR_GRAY2RGBA);
  gray.delete();
};

export const applyEmboss = (src: any, dst: any): void => {
  const embossKernel = cv.matFromArray(
    3,
    3,
    cv.CV_32F,
    [-2, -1, 0, -1, 1, 1, 0, 1, 2]
  );
  cv.filter2D(src, dst, -1, embossKernel);
  embossKernel.delete();
};

export const applyThreshold = (src: any, dst: any): void => {
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.threshold(gray, gray, 127, 255, cv.THRESH_BINARY);
  cv.cvtColor(gray, dst, cv.COLOR_GRAY2RGBA);
  gray.delete();
};

export const applyCartoon = (src: any, dst: any): void => {
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.medianBlur(gray, gray, 5);
  const edges = new cv.Mat();
  cv.adaptiveThreshold(
    gray,
    edges,
    255,
    cv.ADAPTIVE_THRESH_MEAN_C,
    cv.THRESH_BINARY,
    9,
    9
  );
  cv.cvtColor(edges, dst, cv.COLOR_GRAY2RGBA);
  gray.delete();
  edges.delete();
};

export const processImageWithFilter = (
  imageSource: string,
  filter: FilterType,
  setIsProcessing: (isProcessing: boolean) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    setIsProcessing(true);

    const imgElement = document.createElement("img");
    imgElement.crossOrigin = "anonymous";

    imgElement.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        ctx.drawImage(imgElement, 0, 0);

        const src = cv.imread(canvas);
        const dst = new cv.Mat();

        try {
          if (filter === "none") {
            src.copyTo(dst);
          } else if (filter === "grayscale") {
            applyGrayscale(src, dst);
          } else if (filter === "sepia") {
            applySepia(src, dst);
          } else if (filter === "blur") {
            applyBlur(src, dst);
          } else if (filter === "sharpen") {
            applySharpen(src, dst);
          } else if (filter === "edges") {
            applyEdges(src, dst);
          } else if (filter === "emboss") {
            applyEmboss(src, dst);
          } else if (filter === "threshold") {
            applyThreshold(src, dst);
          } else if (filter === "cartoon") {
            applyCartoon(src, dst);
          }

          cv.imshow(canvas, dst);
          const processedImageUrl = canvas.toDataURL();

          resolve(processedImageUrl);
        } finally {
          src.delete();
          dst.delete();
        }
      } catch (error) {
        console.error("Error processing image:", error);
        reject(error);
      } finally {
        setIsProcessing(false);
      }
    };

    imgElement.onerror = (error) => {
      console.error("Error loading image:", error);
      setIsProcessing(false);
      reject(new Error("Failed to load image"));
    };

    imgElement.src = imageSource;
  });
};

export const filters: [FilterType, string][] = [
  ["none", "/filter-preview/none.jpg"],
  ["grayscale", "/filter-preview/grayscale.jpg"],
  ["sepia", "/filter-preview/sepia.jpg"],
  ["blur", "/filter-preview/blur.jpg"],
  ["sharpen", "/filter-preview/sharpen.jpg"],
  ["edges", "/filter-preview/edges.jpg"],
  ["emboss", "/filter-preview/emboss.jpg"],
  ["threshold", "/filter-preview/threshold.jpg"],
  ["cartoon", "/filter-preview/cartoon.jpg"],
];
