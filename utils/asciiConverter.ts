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

export function imageToAscii(imageElement: HTMLImageElement, options: AsciiOptions = {}) {
  const {
    width = 100,
    colored = false,
    negative = false,
    complex = false,
    asciiChars = complex ? complexChars : simpleChars,
    customFgColor,
    customBgColor,
    redWeight = 0.299, // Default weight for red
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