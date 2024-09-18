'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { imageToAscii } from '@/utils/asciiConverter';
import { Header } from '@/components/header';
import { ImageUpload } from '@/components/image-upload';
import { ResultDisplay } from '@/components/result-display';
import { ConversionOptions } from '@/components/conversion-options';

export function ImageConverterComponent() {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [asciiText, setAsciiText] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [colored, setColored] = useState(false)
  const [negative, setNegative] = useState(false)
  const [rgbWeights, setRgbWeights] = useState({ red: 0.299, green: 0.587, blue: 0.114 })
  const [width, setWidth] = useState<number>(150)
  const [asciiChars, setAsciiChars] = useState<string>(' .:-=+*#%@')
  const [charColor, setCharColor] = useState<string>("#ffffff")
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const EPSILON = 1e-10; // A small number close to zero

    const totalRgbWeight = Object.values(rgbWeights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalRgbWeight - 1) > EPSILON) {
      console.log("Invalid RGB Weights: ", totalRgbWeight);
      toast({
        title: "Invalid RGB Weights",
        description: "RGB weights must sum to 1",
        variant: "destructive",
      });
      return;
    }

    if (image) {
      setIsLoading(true)
      const img = new window.Image()
      img.onload = () => {
        const options = {
          width: width,
          colored: colored,
          negative: negative,
          asciiChars: asciiChars,
          customFgColor: charColor,
          customBgColor: backgroundColor,
          redWeight: rgbWeights.red,
          greenWeight: rgbWeights.green,
          blueWeight: rgbWeights.blue
        };

        const { imageUrl, asciiText } = imageToAscii(img, options);
        setResult(`<img src="${imageUrl}" alt="ASCII Art" style="max-width: 100%;" />`);
        setAsciiText(asciiText);
        setActiveTab("result");
        setIsLoading(false)
      }
      img.src = image
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    if (result) {
      setActiveTab("result")
    }
  }, [result])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 order-1">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="result">Result</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-4">
                        <ImageUpload image={image} setImage={setImage} />
                      </TabsContent>
                      <TabsContent value="result" className="mt-4">
                        <ResultDisplay result={result} asciiText={asciiText} />
                      </TabsContent>
                    </Tabs>
                    <ConversionOptions
                      width={width}
                      setWidth={setWidth}
                      charColor={charColor}
                      setCharColor={setCharColor}
                      backgroundColor={backgroundColor}
                      setBackgroundColor={setBackgroundColor}
                      colored={colored}
                      setColored={setColored}
                      negative={negative}
                      setNegative={setNegative}
                      asciiChars={asciiChars}
                      setAsciiChars={setAsciiChars}
                      rgbWeights={rgbWeights}
                      setRgbWeights={(weights: { red: number; green: number; blue: number }) => setRgbWeights(weights)}
                      showAdvanced={showAdvanced}
                      setShowAdvanced={setShowAdvanced}
                    />
                    <Button type="submit" className="w-full" disabled={!image || isLoading}>
                      {isLoading ? 'Processing...' : 'Process'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
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