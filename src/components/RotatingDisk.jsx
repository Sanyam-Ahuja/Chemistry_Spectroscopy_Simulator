import React, { useState, useRef, useEffect } from 'react';
import { VIBGYOR_COLORS, mixColors } from '../utils/colorUtils';

const RotatingDisk = () => {
  const [enabledColors, setEnabledColors] = useState(
    VIBGYOR_COLORS.map((_, i) => i < 7) // All enabled by default
  );
  const [isRotating, setIsRotating] = useState(false);
  const [mode, setMode] = useState('ideal');
  const canvasRef = useRef(null);
  
  const drawDisk = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const activeColors = VIBGYOR_COLORS.filter((_, i) => enabledColors[i]);
    const segmentAngle = (2 * Math.PI) / activeColors.length;
    
    if (isRotating && activeColors.length > 0) {
      // When rotating fast, show the mixed color result
      const mixedColor = mixColors(activeColors, mode);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = mixedColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      // When stopped, show individual segments
      activeColors.forEach((colorObj, index) => {
        const startAngle = index * segmentAngle - Math.PI / 2;
        const endAngle = startAngle + segmentAngle;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colorObj.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
      });
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#333333';
    ctx.fill();
  }, [enabledColors, isRotating, mode]);
  
  useEffect(() => {
    drawDisk();
  }, [drawDisk]);
  
  const toggleColor = (index) => {
    const newEnabled = [...enabledColors];
    newEnabled[index] = !newEnabled[index];
    setEnabledColors(newEnabled);
  };
  
  const getResultColor = () => {
    const activeColors = VIBGYOR_COLORS.filter((_, i) => enabledColors[i]);
    return mixColors(activeColors, mode);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-2xl p-6">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">
          💿 Rotating Color Disk Simulator
        </h2>
        <p className="text-gray-600 text-sm">
          Select colors and spin the disk to see color mixing in action
        </p>
      </div>
      
      {/* Mode Toggle */}
      <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-lg border-2 border-purple-200 mb-4">
        <span className="text-sm font-semibold text-gray-700">Mixing Mode:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="diskMode"
            value="ideal"
            checked={mode === 'ideal'}
            onChange={(e) => setMode(e.target.value)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Ideal</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="diskMode"
            value="real"
            checked={mode === 'real'}
            onChange={(e) => setMode(e.target.value)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Real</span>
        </label>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Disk Display */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={isRotating ? 'rotating' : ''}>
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="rounded-full shadow-2xl border-4 border-gray-300"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${
              isRotating
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isRotating ? '⏸ Stop' : '▶ Rotate'}
          </button>
        </div>
        
        {/* Color Controls */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-purple-200">
            <h3 className="font-bold text-purple-700 mb-3">Enable/Disable Colors:</h3>
            <div className="space-y-2">
              {VIBGYOR_COLORS.map((colorObj, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={enabledColors[index]}
                    onChange={() => toggleColor(index)}
                    className="w-5 h-5"
                  />
                  <div
                    className="w-8 h-8 rounded-md border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: colorObj.color }}
                  />
                  <span className="font-semibold text-gray-700">{colorObj.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Result Display */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-orange-200">
            <h3 className="font-bold text-orange-700 mb-3">Mixed Color Result:</h3>
            <div
              className="w-full h-24 rounded-lg shadow-lg border-4 border-white"
              style={{ backgroundColor: getResultColor() }}
            />
            <p className="text-xs text-gray-600 font-mono mt-2">{getResultColor()}</p>
            <p className="text-xs text-gray-500 mt-2 italic">
              {mode === 'ideal' 
                ? 'Using additive color mixing'
                : 'Using RGB averaging (more realistic)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatingDisk;
