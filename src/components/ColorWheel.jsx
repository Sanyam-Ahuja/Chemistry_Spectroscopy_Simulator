import React from 'react';
import { getColorBand, COMPLEMENTARY_COLORS } from '../utils/colorUtils';

const ColorWheel = ({ wavelength }) => {
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw color wheel
    const colors = [
      { angle: 0, color: '#FF0000', name: 'Red' },
      { angle: 60, color: '#FF8000', name: 'Orange' },
      { angle: 120, color: '#FFFF00', name: 'Yellow' },
      { angle: 180, color: '#00FF00', name: 'Green' },
      { angle: 240, color: '#0000FF', name: 'Blue' },
      { angle: 300, color: '#8B00FF', name: 'Violet' }
    ];
    
    // Draw wheel segments
    colors.forEach((colorObj, index) => {
      const startAngle = (colorObj.angle - 30) * Math.PI / 180;
      const endAngle = (colorObj.angle + 30) * Math.PI / 180;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colorObj.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Highlight absorbed and observed colors if wavelength is set
    if (wavelength) {
      const band = getColorBand(wavelength);
      if (band && COMPLEMENTARY_COLORS[band]) {
        const absorbedColor = COMPLEMENTARY_COLORS[band].absorbed;
        const observedColor = COMPLEMENTARY_COLORS[band].observed;
        
        // Find angles for absorbed and observed
        const colorAngles = {
          '#FF0000': 0,      // Red
          '#FF8000': 60,     // Orange
          '#FFFF00': 120,    // Yellow
          '#00FF00': 180,    // Green
          '#0000FF': 240,    // Blue
          '#00FFFF': 270,    // Cyan
          '#8B00FF': 300,    // Violet
          '#FF00FF': 210     // Magenta
        };
        
        // Draw absorbed indicator
        const absorbedAngle = colorAngles[absorbedColor] || 0;
        const absX = centerX + Math.cos(absorbedAngle * Math.PI / 180) * (radius - 40);
        const absY = centerY + Math.sin(absorbedAngle * Math.PI / 180) * (radius - 40);
        
        ctx.beginPath();
        ctx.arc(absX, absY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = absorbedColor;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ABS', absX, absY + 4);
        
        // Draw observed indicator
        const observedAngle = (colorAngles[observedColor] || 180);
        const obsX = centerX + Math.cos(observedAngle * Math.PI / 180) * (radius - 40);
        const obsY = centerY + Math.sin(observedAngle * Math.PI / 180) * (radius - 40);
        
        ctx.beginPath();
        ctx.arc(obsX, obsY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = observedColor;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('OBS', obsX, obsY + 4);
        
        // Draw connecting line
        ctx.beginPath();
        ctx.moveTo(absX, absY);
        ctx.lineTo(obsX, obsY);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [wavelength]);
  
  return (
    <div className="bg-white rounded-xl shadow-2xl p-6">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">
          🎨 Color Wheel Helper
        </h2>
        <p className="text-gray-600 text-sm">
          Complementary colors sit opposite each other on the wheel
        </p>
      </div>
      
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          className="rounded-lg"
        />
      </div>
      
      <div className="mt-4 bg-purple-50 rounded-lg p-3 border-2 border-purple-200">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-4 border-black bg-white flex items-center justify-center text-xs font-bold">
              ABS
            </div>
            <span className="font-semibold text-gray-700">Absorbed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-4 border-black bg-white flex items-center justify-center text-xs font-bold">
              OBS
            </div>
            <span className="font-semibold text-gray-700">Observed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorWheel;
