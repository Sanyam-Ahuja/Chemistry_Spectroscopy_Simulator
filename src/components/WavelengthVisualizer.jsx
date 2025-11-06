import React, { useState, useEffect } from 'react';
import SpectrumBar from './SpectrumBar';
import { getAbsorbedColor, getObservedColor, getObservedColorMultiRange, getColorBand } from '../utils/colorUtils';

const WavelengthVisualizer = ({ initialWavelength = 450, exampleWavelengths = [], onManualChange }) => {
  const [inputMode, setInputMode] = useState('single'); // 'single' or 'range'
  const [wavelength, setWavelength] = useState(initialWavelength);
  const [inputValue, setInputValue] = useState(initialWavelength.toString());
  const [wavelengths, setWavelengths] = useState([]); // Multiple discrete wavelengths
  const [isFromExample, setIsFromExample] = useState(false); // Track if wavelengths are from example
  const [absorptionRanges, setAbsorptionRanges] = useState([]);
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [rangeError, setRangeError] = useState('');
  const [mode, setMode] = useState('ideal');
  const [showInfo, setShowInfo] = useState(false);
  
  // Update wavelength when initialWavelength prop changes (e.g., from example clicks)
  useEffect(() => {
    setWavelength(initialWavelength);
    setInputValue(initialWavelength.toString());
  }, [initialWavelength]);
  
  // Update wavelengths array when exampleWavelengths changes (for multi-wavelength examples)
  useEffect(() => {
    if (exampleWavelengths.length > 1) {
      // Example has multiple wavelengths (like Chlorophyll-a)
      // Add all wavelengths except the first one (which is the main wavelength)
      const additionalWavelengths = exampleWavelengths.slice(1);
      setWavelengths(additionalWavelengths);
      setIsFromExample(true);
      setInputMode('single'); // Make sure we're in single mode
    } else if (exampleWavelengths.length === 1 && isFromExample) {
      // Single wavelength example - only clear if previously from example
      setWavelengths([]);
      setIsFromExample(false);
    }
    // Don't touch wavelengths when exampleWavelengths is empty - user might be adding manually
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exampleWavelengths]);
  
  const handleWavelengthChange = (e) => {
    const value = e.target.value;
    setInputValue(value); // Allow free typing
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 380 && numValue <= 780) {
      setWavelength(numValue);
      if (onManualChange) onManualChange(); // Clear example selection
    }
  };
  
  const handleBlur = () => {
    // On blur, validate and correct if needed
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < 380) {
      setWavelength(380);
      setInputValue('380');
    } else if (numValue > 780) {
      setWavelength(780);
      setInputValue('780');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBlur(); // Validate on Enter
      e.target.blur(); // Remove focus
    }
  };
  
  const addWavelength = () => {
    // Use the wavelength state, not inputValue, since it's already validated
    const wl = wavelength;
    
    // Validate wavelength
    if (isNaN(wl)) {
      alert('Please enter a valid number');
      return;
    }
    if (wl < 380 || wl > 780) {
      alert('Wavelength must be between 380 and 780 nm');
      return;
    }
    
    // Don't add if already in the array
    if (wavelengths.includes(wl)) {
      alert('This wavelength is already added');
      return;
    }
    
    setWavelengths([...wavelengths, wl]);
    setIsFromExample(false); // Mark as manual addition
    if (onManualChange) onManualChange(); // Clear example selection
  };
  
  const removeWavelength = (wl) => {
    setWavelengths(wavelengths.filter(w => w !== wl));
  };
  
  const addAbsorptionRange = () => {
    const min = parseInt(rangeMin);
    const max = parseInt(rangeMax);
    
    setRangeError('');
    
    // Validation
    if (isNaN(min) || isNaN(max)) {
      setRangeError('Please enter valid wavelength values');
      return;
    }
    if (min < 380 || max > 780 || min >= max) {
      setRangeError('Invalid range. Ensure 380 ≤ min < max ≤ 780');
      return;
    }
    if (max - min > 150) {
      setRangeError('Range too wide! Scientific absorption bands are typically ≤150 nm');
      return;
    }
    if (max - min < 10) {
      setRangeError('Range too narrow! Minimum range is 10 nm');
      return;
    }
    
    // Check for overlaps
    const overlaps = absorptionRanges.some(range => 
      (min <= range.max && max >= range.min)
    );
    if (overlaps) {
      setRangeError('Range overlaps with existing absorption range');
      return;
    }
    
    setAbsorptionRanges([...absorptionRanges, { min, max }]);
    setRangeMin('');
    setRangeMax('');
    if (onManualChange) onManualChange(); // Clear example selection
  };
  
  const removeAbsorptionRange = (index) => {
    setAbsorptionRanges(absorptionRanges.filter((_, i) => i !== index));
  };
  
  const absorbedColor = getAbsorbedColor(wavelength);
  
  // Calculate observed color based on mode and wavelengths
  let observedColor;
  if (inputMode === 'single') {
    if (wavelengths.length > 0) {
      // If multiple wavelengths added, blend their complementary colors
      // Include the main wavelength AND all additional wavelengths
      const allWavelengths = [wavelength, ...wavelengths];
      const ranges = allWavelengths.map(wl => ({ min: wl - 5, max: wl + 5 }));
      observedColor = getObservedColorMultiRange(ranges, mode);
    } else {
      observedColor = getObservedColor(wavelength, mode);
    }
  } else {
    observedColor = getObservedColorMultiRange(absorptionRanges, mode);
  }
  
  const colorBand = getColorBand(wavelength);
  
  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">
          🌈 Wavelength Absorption → Observed Color
        </h2>
        <p className="text-gray-600 text-sm">
          Enter a wavelength to see what color is absorbed and what color the compound appears
        </p>
      </div>
      
      {/* Mode Switcher */}
      <div className="flex gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-2 border-indigo-200">
        <button
          type="button"
          onClick={() => setInputMode('single')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
            inputMode === 'single'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-indigo-100'
          }`}
        >
          📍 Single Wavelength
        </button>
        <button
          type="button"
          onClick={() => setInputMode('range')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
            inputMode === 'range'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-indigo-100'
          }`}
        >
          📊 Multiple Ranges
        </button>
      </div>

      {/* Input Controls */}
      {inputMode === 'single' ? (
        <div className="space-y-4 fade-in">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Wavelength (nm)
              </label>
              <div className="tooltip">
                <input
                  type="number"
                  min="380"
                  max="780"
                  value={inputValue}
                  onChange={handleWavelengthChange}
                  onBlur={handleBlur}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter 380-780"
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 text-lg font-semibold"
                />
                <span className="tooltiptext">Type exact wavelength value</span>
              </div>
            </div>
            
            <div className="tooltip">
              <button
                type="button"
                onClick={addWavelength}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all"
              >
                + Add Wavelength
              </button>
              <span className="tooltiptext">Add multiple wavelengths (like Chlorophyll)</span>
            </div>
            
            <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-lg border-2 border-purple-200">
              <span className="text-sm font-semibold text-gray-700">Color Mode:</span>
              <label className="flex items-center gap-2 cursor-pointer tooltip">
                <input
                  type="radio"
                  name="mode"
                  value="ideal"
                  checked={mode === 'ideal'}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Ideal</span>
                <span className="tooltiptext">Pure complementary color theory</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer tooltip">
                <input
                  type="radio"
                  name="mode"
                  value="real"
                  checked={mode === 'real'}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Real</span>
                <span className="tooltiptext">Simulates human eye perception</span>
              </label>
            </div>
          </div>
          
          {/* Display added wavelengths */}
          {wavelengths.length > 0 && (
            <div className="bg-green-50 p-3 rounded-lg border-2 border-green-300 fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-green-800 text-sm">✨ Multiple Wavelengths</h3>
                <span className="text-xs text-gray-600 italic">Like Chlorophyll-a!</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {wavelengths.map((wl, index) => (
                  <div key={index} className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-green-400 color-transition">
                    <span className="font-semibold text-gray-700 text-sm">{wl} nm</span>
                    <button
                      type="button"
                      onClick={() => removeWavelength(wl)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border-2 border-orange-200">
            <h3 className="font-bold text-orange-800 mb-3">Add Absorption Range</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Min λ (nm)
                </label>
                <input
                  type="number"
                  min="380"
                  max="780"
                  value={rangeMin}
                  onChange={(e) => setRangeMin(e.target.value)}
                  placeholder="380"
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Max λ (nm)
                </label>
                <input
                  type="number"
                  min="380"
                  max="780"
                  value={rangeMax}
                  onChange={(e) => setRangeMax(e.target.value)}
                  placeholder="530"
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                type="button"
                onClick={addAbsorptionRange}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all"
              >
                + Add Range
              </button>
            </div>
            {rangeError && (
              <p className="mt-2 text-sm text-red-600 font-semibold">⚠️ {rangeError}</p>
            )}
            <p className="mt-2 text-xs text-gray-600 italic">
              💡 Scientific absorption bands are typically 10-150 nm wide
            </p>
          </div>
          
          {/* Display absorption ranges */}
          {absorptionRanges.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3">Active Absorption Ranges</h3>
              <div className="space-y-2">
                {absorptionRanges.map((range, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                    <span className="font-semibold text-gray-700">
                      Range {index + 1}: {range.min} - {range.max} nm ({range.max - range.min} nm wide)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAbsorptionRange(index)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-lg border-2 border-purple-200">
            <span className="text-sm font-semibold text-gray-700">Color Mode:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
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
                name="mode"
                value="real"
                checked={mode === 'real'}
                onChange={(e) => setMode(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Real</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Spectrum Bar */}
      <SpectrumBar 
        wavelength={inputMode === 'single' && wavelengths.length === 0 ? wavelength : null} 
        wavelengths={inputMode === 'single' && wavelengths.length > 0 ? [wavelength, ...wavelengths] : []}
        absorptionRanges={inputMode === 'range' ? absorptionRanges : []}
        onWavelengthClick={setWavelength} 
      />
      
      {/* Color Swatches */}
      <div className="grid md:grid-cols-2 gap-4 fade-in">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-purple-200 shadow-lg">
          <h3 className="text-base font-bold text-purple-700 mb-3 flex items-center gap-2">
            <span>🎨</span>
            {(inputMode === 'range' && absorptionRanges.length > 1) || (inputMode === 'single' && wavelengths.length >= 1) 
              ? 'Absorbed Colors' 
              : 'Absorbed Color'}
          </h3>
          {inputMode === 'single' && wavelengths.length > 0 ? (
            <div className="space-y-2">
              {/* Show main wavelength first */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-16 h-16 rounded-lg shadow-lg border-2 border-white flex-shrink-0 color-transition"
                  style={{ backgroundColor: absorbedColor }}
                />
                <div className="text-xs">
                  <p className="font-semibold text-gray-700">{wavelength} nm</p>
                  <p className="text-gray-600 font-mono text-xs">{absorbedColor}</p>
                </div>
              </div>
              {/* Show additional wavelengths */}
              {wavelengths.map((wl, index) => {
                const wlColor = getAbsorbedColor(wl);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-lg shadow-md border-2 border-white flex-shrink-0 color-transition"
                      style={{ backgroundColor: wlColor }}
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-gray-700">{wl} nm</p>
                      <p className="text-gray-600 font-mono text-xs">{wlColor}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : inputMode === 'range' && absorptionRanges.length > 0 ? (
            <div className="space-y-2">
              {absorptionRanges.map((range, index) => {
                const rangeColor = getObservedColorMultiRange([range], 'ideal');
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-lg shadow-md border-2 border-white flex-shrink-0 color-transition"
                      style={{ backgroundColor: rangeColor }}
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-gray-700">{range.min}-{range.max} nm</p>
                      <p className="text-gray-600 font-mono text-xs">{rangeColor}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div 
                className="w-20 h-20 rounded-lg shadow-xl border-4 border-white color-transition"
                style={{ backgroundColor: absorbedColor }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {wavelength} nm
                </p>
                <p className="text-xs text-gray-600 font-mono">{absorbedColor}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200 shadow-lg">
          <h3 className="text-base font-bold text-green-700 mb-3 flex items-center gap-2">
            <span>👁️</span>
            Observed Color
          </h3>
          <div className="flex items-center gap-3">
            <div 
              className="w-20 h-20 rounded-lg shadow-xl border-4 border-white color-transition"
              style={{ backgroundColor: observedColor }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                What you see
              </p>
              <p className="text-xs text-gray-600 font-mono">{observedColor}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Toggle */}
      <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="w-full flex items-center justify-between text-left font-semibold text-indigo-700 hover:text-indigo-900"
        >
          <span>ℹ️ More Info: How does this work?</span>
          <span className="text-2xl">{showInfo ? '−' : '+'}</span>
        </button>
        
        {showInfo && (
          <div className="mt-3 text-sm text-gray-700 space-y-2 pt-3 border-t border-indigo-200">
            <p>
              <strong>Ideal Mode:</strong> Uses fixed complementary color relationships based on the color wheel. 
              For example, if a compound absorbs blue light, it appears orange (blue's complement).
            </p>
            <p>
              <strong>Real Mode:</strong> Calculates the complementary color using RGB inversion, which 
              approximates how human perception would see the reflected wavelengths. This often gives 
              more natural-looking results.
            </p>
            <p className="text-xs italic text-gray-500 mt-3">
              💡 In spectroscopy, the color you see is the color that is NOT absorbed—it's the 
              wavelengths that are reflected or transmitted!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WavelengthVisualizer;
