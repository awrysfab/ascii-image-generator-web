import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ConversionOptionsProps {
  width: number;
  setWidth: (value: number) => void;
  charColor: string;
  setCharColor: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  colored: boolean;
  setColored: (value: boolean) => void;
  negative: boolean;
  setNegative: (value: boolean) => void;
  rgbWeights: Record<string, number>;
  setRgbWeights: (weights: { red: number; green: number; blue: number }) => void;
  showAdvanced: boolean;
  setShowAdvanced: (value: boolean) => void;
  asciiChars: string;
  setAsciiChars: (value: string) => void;
}

export function ConversionOptions({
  width, setWidth, charColor, setCharColor, backgroundColor, setBackgroundColor,
  colored, setColored, negative, setNegative,
  rgbWeights, setRgbWeights,
  showAdvanced, setShowAdvanced,
  asciiChars, setAsciiChars
}: ConversionOptionsProps) {
  const defaultChars = ' .:-=+*#%@';
  const complexChars = '" .\'^,":;Il!i><~+_-?][{}1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"';

  const handleAsciiCharsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'default') {
      setAsciiChars(defaultChars);
    } else if (value === 'complex') {
      setAsciiChars(complexChars);
    } else {
      setAsciiChars('custom');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="width" className="text-sm font-semibold">Width</Label>
            <Input id="width" type="number" value={width} min={50} max={800} step={1} onChange={(e) => setWidth(Number(e.target.value))} placeholder="Enter width" />
          </div>
          <div>
            <Label htmlFor="charColor" className="text-sm font-semibold">Char Color</Label>
            <Input id="charColor" type="color" value={charColor} onChange={(e) => setCharColor(e.target.value)} disabled={colored} />
          </div>
          <div>
            <Label htmlFor="backgroundColor" className="text-sm font-semibold">Background Color</Label>
            <Input id="backgroundColor" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-8">
          <div className="flex items-center space-x-2">
            <Switch
              id="colored"
              checked={colored}
              onCheckedChange={setColored}
            />
            <Label htmlFor="colored" className="text-sm font-semibold">Colored</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="negative"
              checked={negative}
              onCheckedChange={setNegative}
            />
            <Label htmlFor="negative" className="text-sm font-semibold">Negative</Label>
          </div>
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
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ASCII Charset</Label>
            <div className="grid grid-cols-4 gap-4">
              <select
                id="asciiCharsSelect"
                value={asciiChars === defaultChars ? 'default' : asciiChars === complexChars ? 'complex' : 'custom'}
                onChange={handleAsciiCharsChange}
                className="w-full p-2 border rounded"
              >
                <option value="default">Default</option>
                <option value="complex">Complex</option>
                <option value="custom">Custom</option>
              </select>
              <Input
                type="text"
                value={asciiChars}
                onChange={(e) => setAsciiChars(e.target.value)}
                placeholder="Enter ASCII chars"
                className="col-span-3"
                disabled={asciiChars !== 'custom'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">RGB Weights (must sum to 1)</Label>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(rgbWeights).map(([color, weight]) => (
                <div key={color}>
                  <Label htmlFor={`${color}Weight`}>{color.charAt(0).toUpperCase() + color.slice(1)}</Label>
                  <Input
                    id={`${color}Weight`}
                    type="number"
                    value={weight as number}
                    min={0}
                    max={1}
                    step={0.001}
                    onChange={(e) => setRgbWeights({ ...rgbWeights, [color]: parseFloat(e.target.value) } as { red: number; green: number; blue: number })}
                  />
                </div>
              ))}
              <div>
                <Label className="text-sm font-semibold">Sum</Label>
                <Input
                  type="number"
                  value={Object.values(rgbWeights).reduce((sum, weight) => sum + weight, 0).toFixed(3)}
                  disabled
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}