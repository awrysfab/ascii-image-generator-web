import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Maximize2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface ResultDisplayProps {
  result: string | null
  asciiText: string
}

export function ResultDisplay({ result, asciiText }: ResultDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const saveAsImage = () => {
    if (result) {
      const imgSrc = result.match(/src="([^"]+)"/)?.[1];
      if (imgSrc) {
        const link = document.createElement('a');
        link.href = imgSrc;
        link.download = 'ascii-art.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiText).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "ASCII art has been copied to your clipboard",
      });
    });
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div>
      {result ? (
        <div className="flex justify-center items-center flex-col space-y-4">
          <div ref={resultRef} className="relative max-w-xs overflow-x-auto cursor-pointer group" onClick={toggleFullscreen}>
            <div dangerouslySetInnerHTML={{ __html: result }} />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={saveAsImage}>Save as Image</Button>
            <Button onClick={copyToClipboard}>Copy ASCII</Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed">
          <p className="text-gray-500">Converted image will appear here</p>
        </div>
      )}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={toggleFullscreen}>
          <div className="max-w-4xl max-h-[90vh] overflow-auto bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <div dangerouslySetInnerHTML={{ __html: result || '' }} />
          </div>
        </div>
      )}
    </div>
  )
}