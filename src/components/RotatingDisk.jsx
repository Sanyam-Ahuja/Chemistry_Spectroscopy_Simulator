import React, { useState, useRef, useEffect } from 'react';
import { wavelengthToRGB, rgbToHex } from '../utils/colorUtils';

const RotatingDisk = () => {
  const [excludedRanges, setExcludedRanges] = useState([]);
  const [isRotating, setIsRotating] = useState(false);
  const [rangeMin, setRangeMin] = useState('380');
  const [rangeMax, setRangeMax] = useState('450');
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rotationRef = useRef(0);
  const speedRef = useRef(0);
  const blendFactorRef = useRef(0);
  
  // Draw the continuous spectrum wheel
  const drawDisk = React.useCallback(() => {
    // Helper function to get excluded wavelength count
    const getExcludedWavelengthCount = () => {
      let count = 0;
      excludedRanges.forEach(range => {
        count += (range.max - range.min + 1);
      });
      return count;
    };
    
    // Calculate the mixed color RGB values (for interpolation)
    const calculateMixedColorRGB = () => {
      const step = 2; // Sample every 2nm for better accuracy
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let wl = 380; wl <= 780; wl += step) {
        const isExcluded = excludedRanges.some(range => 
          wl >= range.min && wl <= range.max
        );
        
        if (!isExcluded) {
          const rgb = wavelengthToRGB(wl);
          r += rgb.r;
          g += rgb.g;
          b += rgb.b;
          count++;
        }
      }
      
      if (count === 0) return { r: 0, g: 0, b: 0 }; // All excluded = black
      
      // For full spectrum (no exclusions), boost to white
      const totalPossible = 201; // (780-380)/2 + 1
      const completeness = count / totalPossible;
      
      if (completeness > 0.95) {
        // If nearly all wavelengths present, return pure white
        return { r: 255, g: 255, b: 255 };
      }
      
      // Calculate average
      r = r / count;
      g = g / count;
      b = b / count;
      
      // Boost brightness for better color representation
      const max = Math.max(r, g, b);
      if (max > 0) {
        const boost = Math.min(255 / max, 1.5);
        r = Math.min(255, Math.round(r * boost));
        g = Math.min(255, Math.round(g * boost));
        b = Math.min(255, Math.round(b * boost));
      }
      
      return { r, g, b };
    };
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 140;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context for rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRef.current);
    ctx.translate(-centerX, -centerY);
    
    // First, collect all active (non-excluded) wavelengths
    const totalSegments = 400;
    const activeWavelengths = [];
    
    for (let i = 0; i < totalSegments; i++) {
      const wavelength = 380 + (i / totalSegments) * 400;
      const isExcluded = excludedRanges.some(range => 
        wavelength >= range.min && wavelength <= range.max
      );
      
      if (!isExcluded) {
        activeWavelengths.push(wavelength);
      }
    }
    
    // If no active wavelengths, draw black circle
    if (activeWavelengths.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // Draw only active wavelengths, expanded to fill the full circle
      const blendFactor = blendFactorRef.current;
      const anglePerSegment = (2 * Math.PI) / activeWavelengths.length;
      
      activeWavelengths.forEach((wavelength, index) => {
        const startAngle = index * anglePerSegment - Math.PI / 2;
        const endAngle = startAngle + anglePerSegment;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // Get the original wavelength color
        const rgb = wavelengthToRGB(wavelength);
        const originalColor = { r: rgb.r, g: rgb.g, b: rgb.b };
        
        // Get the mixed result color
        const mixedRgb = calculateMixedColorRGB();
        
        // Interpolate between original and mixed based on blend factor
        const r = Math.round(originalColor.r * (1 - blendFactor) + mixedRgb.r * blendFactor);
        const g = Math.round(originalColor.g * (1 - blendFactor) + mixedRgb.g * blendFactor);
        const b = Math.round(originalColor.b * (1 - blendFactor) + mixedRgb.b * blendFactor);
        
        ctx.fillStyle = rgbToHex(r, g, b);
        ctx.fill();
        
        // Fade out segment borders as we blend
        const borderOpacity = 0.08 * (1 - blendFactor);
        ctx.strokeStyle = `rgba(255, 255, 255, ${borderOpacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    }
    
    ctx.restore();
    
    // Draw center circle with wavelength count
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Add wavelength count text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const activeCount = 400 - getExcludedWavelengthCount();
    ctx.fillText(`${activeCount}`, centerX, centerY - 5);
    ctx.font = '8px Arial';
    ctx.fillText('nm', centerX, centerY + 8);
  }, [excludedRanges]);
  
  // Animation loop for rotation with acceleration and blending
  useEffect(() => {
    if (isRotating) {
      const maxSpeed = 0.3;
      const acceleration = 0.005;
      const blendSpeed = 0.02;
      
      const animate = () => {
        // Accelerate rotation speed
        if (speedRef.current < maxSpeed) {
          speedRef.current += acceleration;
        }
        
        // Increase blend factor as speed increases (colors start mixing)
        if (blendFactorRef.current < 1) {
          blendFactorRef.current = Math.min(1, blendFactorRef.current + blendSpeed);
        }
        
        rotationRef.current += speedRef.current;
        drawDisk();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Decelerate when stopping
      if (speedRef.current > 0 || blendFactorRef.current > 0) {
        const decelerate = () => {
          speedRef.current = Math.max(0, speedRef.current - 0.01);
          blendFactorRef.current = Math.max(0, blendFactorRef.current - 0.03);
          rotationRef.current += speedRef.current;
          drawDisk();
          
          if (speedRef.current > 0 || blendFactorRef.current > 0) {
            animationRef.current = requestAnimationFrame(decelerate);
          } else {
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
            }
          }
        };
        animationRef.current = requestAnimationFrame(decelerate);
      } else {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        drawDisk();
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRotating, drawDisk]);
  
  useEffect(() => {
    drawDisk();
  }, [drawDisk]);
  
  // Helper to get excluded wavelength count (for display in UI)
  const getExcludedWavelengthCount = () => {
    let count = 0;
    excludedRanges.forEach(range => {
      count += (range.max - range.min + 1);
    });
    return count;
  };
  
  // Calculate the mixed color as hex (for display in UI)
  const calculateMixedColor = () => {
    const step = 2;
    let r = 0, g = 0, b = 0, count = 0;
    
    for (let wl = 380; wl <= 780; wl += step) {
      const isExcluded = excludedRanges.some(range => 
        wl >= range.min && wl <= range.max
      );
      
      if (!isExcluded) {
        const rgb = wavelengthToRGB(wl);
        r += rgb.r;
        g += rgb.g;
        b += rgb.b;
        count++;
      }
    }
    
    if (count === 0) return '#000000';
    
    const totalPossible = 201;
    const completeness = count / totalPossible;
    
    if (completeness > 0.95) {
      return '#FFFFFF';
    }
    
    r = r / count;
    g = g / count;
    b = b / count;
    
    const max = Math.max(r, g, b);
    if (max > 0) {
      const boost = Math.min(255 / max, 1.5);
      r = Math.min(255, Math.round(r * boost));
      g = Math.min(255, Math.round(g * boost));
      b = Math.min(255, Math.round(b * boost));
    }
    
    return rgbToHex(r, g, b);
  };
  
  const addExcludedRange = () => {
    const min = parseInt(rangeMin);
    const max = parseInt(rangeMax);
    
    if (isNaN(min) || isNaN(max)) {
      alert('Please enter valid numbers');
      return;
    }
    if (min < 380 || max > 780 || min >= max) {
      alert('Invalid range. Min must be < Max, and both within 380-780 nm');
      return;
    }
    
    setExcludedRanges([...excludedRanges, { min, max }]);
  };
  
  const removeExcludedRange = (index) => {
    setExcludedRanges(excludedRanges.filter((_, i) => i !== index));
  };
  
  const clearAllExclusions = () => {
    setExcludedRanges([]);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-2xl p-6">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-2 flex items-center gap-2">
          🌈 Advanced Spectrum Wheel
        </h2>
        <p className="text-gray-600 text-sm">
          Continuous wavelength spectrum (380-780 nm). Exclude ranges to see the resulting mixed color.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Disk Display */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200">
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="rounded-full shadow-2xl"
                style={{ background: '#000' }}
              />
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <div className="text-gray-600 font-semibold">Active</div>
                <div className="text-lg font-bold text-green-600">
                  {400 - getExcludedWavelengthCount()} nm
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <div className="text-gray-600 font-semibold">Excluded</div>
                <div className="text-lg font-bold text-red-600">
                  {getExcludedWavelengthCount()} nm
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white text-lg shadow-lg transition-all hover:scale-105 ${
              isRotating
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}
          >
            {isRotating ? '⏸️ Stop Rotation' : '▶️ Spin to Mix'}
          </button>
          
          {/* Result Display */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-orange-300 shadow-md">
            <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <span>🎨</span>
              Resulting Mixed Color
            </h3>
            <div
              className="w-full h-28 rounded-lg shadow-xl border-4 border-white color-transition"
              style={{ backgroundColor: calculateMixedColor() }}
            />
            <p className="text-sm text-gray-700 font-mono mt-3 text-center bg-white px-3 py-2 rounded-lg">
              {calculateMixedColor()}
            </p>
            <p className="text-xs text-gray-600 mt-2 text-center italic">
              💡 This is the color you'd see when spinning
            </p>
          </div>
        </div>
        
        {/* Wavelength Exclusion Controls */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border-2 border-red-300">
            <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <span>🚫</span>
              Exclude Wavelength Ranges
            </h3>
            
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Min (nm)
                  </label>
                  <input
                    type="number"
                    min="380"
                    max="780"
                    value={rangeMin}
                    onChange={(e) => setRangeMin(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 text-center font-semibold"
                    placeholder="380"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Max (nm)
                  </label>
                  <input
                    type="number"
                    min="380"
                    max="780"
                    value={rangeMax}
                    onChange={(e) => setRangeMax(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 text-center font-semibold"
                    placeholder="450"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={addExcludedRange}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-all hover:scale-105"
              >
                ➕ Exclude This Range
              </button>
            </div>
            
            {/* Display excluded ranges */}
            {excludedRanges.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-red-800 text-sm">Excluded Ranges:</h4>
                  <button
                    type="button"
                    onClick={clearAllExclusions}
                    className="text-xs text-red-600 hover:text-red-800 underline font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {excludedRanges.map((range, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm border border-red-200"
                    >
                      <span className="font-semibold text-gray-700 text-sm">
                        {range.min} - {range.max} nm
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExcludedRange(index)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Scientific Info Panel */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-300">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span>🔬</span>
              Scientific Notes
            </h3>
            <ul className="text-xs text-gray-700 space-y-2">
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>Continuous Spectrum:</strong> Shows all 400 visible wavelengths (380-780nm)</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>Excluded Ranges:</strong> Appear as black/dimmed sections</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>Spinning:</strong> Simulates additive light mixing of remaining wavelengths</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>All wavelengths:</strong> White light (full spectrum)</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>No wavelengths:</strong> Black (complete absorption)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatingDisk;
