import React from 'react';
import { wavelengthToRGB, rgbToHex } from '../utils/colorUtils';

const SpectrumBar = ({ wavelength, wavelengths = [], absorptionRanges = [], onWavelengthClick }) => {
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw spectrum gradient
    for (let i = 0; i < width; i++) {
      const wl = 380 + (i / width) * (780 - 380);
      const rgb = wavelengthToRGB(wl);
      ctx.fillStyle = rgbToHex(rgb.r, rgb.g, rgb.b);
      ctx.fillRect(i, 0, 1, height);
    }
    
    // Draw absorption ranges if provided
    if (absorptionRanges && absorptionRanges.length > 0) {
      absorptionRanges.forEach((range) => {
        const xMin = ((range.min - 380) / (780 - 380)) * width;
        const xMax = ((range.max - 380) / (780 - 380)) * width;
        
        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(xMin, 0, xMax - xMin, height);
        
        // Draw borders
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(xMin, 0);
        ctx.lineTo(xMin, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xMax, 0);
        ctx.lineTo(xMax, height);
        ctx.stroke();
      });
    }
    
    // Draw multiple discrete wavelengths if provided
    if (wavelengths && wavelengths.length > 0) {
      wavelengths.forEach((wl) => {
        const x = ((wl - 380) / (780 - 380)) * width;
        
        // Draw marker line
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw marker circle at top
        ctx.fillStyle = '#FF00FF';
        ctx.beginPath();
        ctx.arc(x, 10, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
    
    // Draw single wavelength marker if provided (and no multiple wavelengths)
    if (wavelength && wavelength >= 380 && wavelength <= 780 && 
        (!absorptionRanges || absorptionRanges.length === 0) &&
        (!wavelengths || wavelengths.length === 0)) {
      const x = ((wavelength - 380) / (780 - 380)) * width;
      
      // Draw marker line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Draw marker circle at top
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, 10, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [wavelength, wavelengths, absorptionRanges]);
  
  const handleClick = (e) => {
    if (!onWavelengthClick) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const wl = Math.round(380 + (x / canvas.width) * (780 - 380));
    
    if (wl >= 380 && wl <= 780) {
      onWavelengthClick(wl);
    }
  };
  
  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={800}
        height={60}
        className="w-full rounded-lg shadow-lg cursor-pointer border-2 border-white"
        onClick={handleClick}
      />
      <div className="flex justify-between text-xs text-gray-700 font-semibold px-1">
        <span>380 nm (Violet)</span>
        <span>780 nm (Red)</span>
      </div>
    </div>
  );
};

export default SpectrumBar;
