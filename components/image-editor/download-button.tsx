"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DownloadButtonProps {
  processedImage: string;
  filterName: string;
}

export default function DownloadButton({ processedImage, filterName }: DownloadButtonProps) {
  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement("a")
      link.href = processedImage
      link.download = `${filterName}.png`;
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Button onClick={downloadImage} className="bg-blue-600 hover:bg-blue-700 text-white">
      <Download className="mr-2 h-4 w-4" /> Download
    </Button>
  )
}

