import { BodyType } from '../types';

// Simple pseudo-random number generator for reproducibility if needed
const random = () => Math.random();

export const generatePlanetTexture = (type: BodyType, baseColorHex: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;

  // Fill Background
  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, w, h);

  // Helper to convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 128, g: 128, b: 128 };
  };

  const baseRgb = hexToRgb(baseColorHex);

  // --- texture logic based on type ---

  if (type === BodyType.Star) {
    // Noise + bright spots
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 50;
      data[i] = Math.min(255, Math.max(0, baseRgb.r + noise + 20));
      data[i + 1] = Math.min(255, Math.max(0, baseRgb.g + noise));
      data[i + 2] = Math.min(255, Math.max(0, baseRgb.b + noise));
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  } else if (type === BodyType.GasGiant) {
    // Horizontal bands
    for (let y = 0; y < h; y++) {
      const band = Math.sin(y / h * 20) * 0.2 + Math.sin(y / h * 50) * 0.1;
      const noise = (Math.random() - 0.5) * 0.1;
      const factor = 1 + band + noise;
      
      ctx.fillStyle = `rgba(${Math.min(255, baseRgb.r * factor)}, ${Math.min(255, baseRgb.g * factor)}, ${Math.min(255, baseRgb.b * factor)}, 0.5)`;
      ctx.fillRect(0, y, w, 1);
    }
    
    // Storms (Great Red Spot style)
    if (Math.random() > 0.5) {
        ctx.beginPath();
        ctx.ellipse(w * 0.6, h * 0.6, 40, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 0, 0, 0.2)';
        ctx.fill();
    }

  } else if (type === BodyType.EarthLike) {
    // Simple noise for continents
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    // Base is Ocean (Blueish)
    // We draw "land" on top
    for (let i = 0; i < data.length; i += 4) {
      // Very crude noise approximation
      const x = (i / 4) % w;
      const y = Math.floor((i / 4) / w);
      
      const scale = 0.02;
      const noise = Math.sin(x * scale) * Math.cos(y * scale) + Math.sin(x * scale * 3 + y * scale * 2) * 0.5;
      
      if (noise > 0.3) {
        // Land (Green/Brown)
        data[i] = 34 + Math.random() * 20;
        data[i + 1] = 139 + Math.random() * 20;
        data[i + 2] = 34;
        data[i + 3] = 255;
      } else {
        // Water (Blue)
        data[i] = 30;
        data[i + 1] = 144;
        data[i + 2] = 255 - Math.random() * 20;
        data[i + 3] = 255;
      }
      
      // Clouds
      if (Math.random() > 0.96) {
         data[i] = 255;
         data[i+1] = 255;
         data[i+2] = 255;
         data[i+3] = 200; // Transparent clouds
      }
    }
    ctx.putImageData(imageData, 0, 0);

  } else {
    // Rocky / Ice / Default
    // Craters and noise
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 40;
      data[i] = Math.min(255, Math.max(0, baseRgb.r + noise));
      data[i + 1] = Math.min(255, Math.max(0, baseRgb.g + noise));
      data[i + 2] = Math.min(255, Math.max(0, baseRgb.b + noise));
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    
    // Draw some craters
    for(let c=0; c<10; c++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const r = Math.random() * 10 + 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.stroke();
    }
  }

  return canvas.toDataURL();
};
