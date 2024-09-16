'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp, Upload, Menu, X } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import Image from 'next/image'
import { toPng } from 'html-to-image';

const simpleChars = ' .:-=+*#%@';
const complexChars = '" .\'^,":;Il!i><~+_-?][{}1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"';

interface AsciiOptions {
  width?: number;
  colored?: boolean;
  negative?: boolean;
  complex?: boolean;
  asciiChars?: string;
  customFgColor?: string;
  customBgColor?: string;
  redWeight?: number;
  greenWeight?: number;
  blueWeight?: number;
}

function getCharBrightness(char: string) {
  return complexChars.indexOf(char) / complexChars.length;
}

function imageToAscii(imageElement: HTMLImageElement, options: AsciiOptions = {}) {
  const {
    width = 100,
    colored = false,
    negative = false,
    complex = false,
    asciiChars = complex ? complexChars : simpleChars,
    customFgColor,
    customBgColor,
    redWeight = 0.299,   // Default weight for red
    greenWeight = 0.587, // Default weight for green
    blueWeight = 0.114   // Default weight for blue
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to get 2D context');

  const charAspectRatio = 0.5;

  const scaleFactor = width / imageElement.width;
  canvas.width = width;
  canvas.height = Math.floor(imageElement.height * scaleFactor * charAspectRatio);

  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let asciiArt = '';

  const outputCanvas = document.createElement('canvas');
  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) throw new Error('Unable to get 2D context for output canvas');

  const charWidth = 10;
  const charHeight = 20;
  outputCanvas.width = canvas.width * charWidth;
  outputCanvas.height = canvas.height * charHeight;
  outputCtx.font = `${charHeight}px monospace`;
  outputCtx.textBaseline = 'top';

  // Fill background
  outputCtx.fillStyle = customBgColor || 'white';
  outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const offset = (y * canvas.width + x) * 4;
      const r = imageData.data[offset];
      const g = imageData.data[offset + 1];
      const b = imageData.data[offset + 2];

      // Use customized weights for brightness calculation
      let brightness = redWeight * r + greenWeight * g + blueWeight * b;

      if (negative) {
        brightness = 255 - brightness;
      }

      const normalizedBrightness = brightness / 255;
      let closestChar = ' ';
      let minDifference = 1;

      for (const char of asciiChars) {
        const charBrightness = getCharBrightness(char);
        const difference = Math.abs(normalizedBrightness - charBrightness);
        if (difference < minDifference) {
          minDifference = difference;
          closestChar = char;
        }
      }

      if (colored) {
        outputCtx.fillStyle = `rgb(${r},${g},${b})`;
      } else {
        outputCtx.fillStyle = customFgColor || 'black';
      }
      outputCtx.fillText(closestChar, x * charWidth, y * charHeight);
      asciiArt += closestChar;
    }
    asciiArt += '\n';
  }

  return { imageUrl: outputCanvas.toDataURL(), asciiText: asciiArt };
}

export function ImageConverterComponent() {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [asciiText, setAsciiText] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [colored, setColored] = useState(false)
  const [negative, setNegative] = useState(false)
  const [complex, setComplex] = useState(false)
  const [rgbWeights, setRgbWeights] = useState({ red: 0.299, green: 0.587, blue: 0.114 })
  const [width, setWidth] = useState<string>("100")
  const [customAscii, setCustomAscii] = useState<string>("")
  const [charColor, setCharColor] = useState<string>("#ffffff")
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

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
      const img = new window.Image()
      img.onload = () => {
        const options = {
          width: parseInt(width),
          colored: colored,
          negative: negative,
          complex: complex,
          asciiChars: customAscii || undefined,
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
      }
      img.src = image
    }
  }

  const clearImage = () => {
    setImage(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const changeImage = () => {
    fileInputRef.current?.click()
  }

  const saveAsImage = async () => {
    if (resultRef.current) {
      const dataUrl = await toPng(resultRef.current);
      const link = document.createElement('a');
      link.download = 'ascii-art.png';
      link.href = dataUrl;
      link.click();
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

  useEffect(() => {
    if (result) {
      setActiveTab("result")
    }
  }, [result])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Image Converter</h1>
          <nav className="hidden lg:flex space-x-4">
            <Button variant="ghost">Guide</Button>
            <Button variant="ghost">About</Button>
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Guide</DropdownMenuItem>
              <DropdownMenuItem>About</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
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
                        {!image ? (
                          <div className="flex justify-center items-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-100">
                              <div className="flex flex-col justify-center items-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                              </div>
                              <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                            </label>
                          </div>
                        ) : (
                          <div className="relative">
                            <Image src={image} alt="Uploaded" className="max-w-full h-auto rounded-lg" layout="responsive" width={800} height={400} />
                            <div className="absolute top-2 right-2 flex space-x-2">
                              <Button size="icon" variant="secondary" onClick={clearImage}>
                                <X className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary" onClick={changeImage}>
                                Change
                              </Button>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="result" className="mt-4">
                        {result ? (
                          <div className="space-y-4">
                            <div ref={resultRef} className="relative max-w-full overflow-x-auto" dangerouslySetInnerHTML={{ __html: result }} />
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
                      </TabsContent>
                    </Tabs>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="width">Width</Label>
                        <Input id="width" type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Enter width" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="colored"
                          checked={colored}
                          onCheckedChange={setColored}
                        />
                        <Label htmlFor="colored">Colored</Label>
                      </div>
                    </div>
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="flex items-center justify-between w-full">
                          Advanced Options
                          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="negative"
                            checked={negative}
                            onCheckedChange={setNegative}
                          />
                          <Label htmlFor="negative">Negative</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="complex"
                            checked={complex}
                            onCheckedChange={setComplex}
                          />
                          <Label htmlFor="complex">Complex</Label>
                        </div>
                        <div>
                          <Label htmlFor="customAscii">Custom ASCII Char</Label>
                          <Input id="customAscii" type="text" value={customAscii} onChange={(e) => setCustomAscii(e.target.value)} placeholder="Enter custom ASCII char" />
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="charColor">Char Color</Label>
                              <Input id="charColor" type="color" value={charColor} onChange={(e) => setCharColor(e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="backgroundColor">Background Color</Label>
                              <Input id="backgroundColor" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Label>RGB Weights (must sum to 1)</Label>
                          <div className="grid grid-cols-3 gap-4">
                            {Object.entries(rgbWeights).map(([color, weight]) => (
                              <div key={color}>
                                <Label htmlFor={`${color}Weight`}>{color.charAt(0).toUpperCase() + color.slice(1)}</Label>
                                <Input
                                  id={`${color}Weight`}
                                  type="number"
                                  value={weight}
                                  min={0}
                                  max={1}
                                  step={0.001}
                                  onChange={(e) => setRgbWeights({ ...rgbWeights, [color]: parseFloat(e.target.value) })}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    <Button type="submit" className="w-full" disabled={!image}>Process</Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}