import React, { useState } from 'react';
import WavelengthVisualizer from './components/WavelengthVisualizer';
import ColorWheel from './components/ColorWheel';
import RotatingDisk from './components/RotatingDisk';
import Examples from './components/Examples';
import Footer from './components/Footer';
import { EXAMPLES } from './utils/colorUtils';

function App() {
  const [selectedWavelength, setSelectedWavelength] = useState(450);
  const [selectedExample, setSelectedExample] = useState(null);
  const [exampleWavelengths, setExampleWavelengths] = useState([]);
  
  const handleExampleClick = (exampleIndex) => {
    const example = EXAMPLES[exampleIndex];
    setSelectedWavelength(example.wavelength);
    setSelectedExample(exampleIndex);
    
    // Handle examples with multiple wavelengths (like Chlorophyll-a)
    const wavelengths = [example.wavelength];
    if (example.wavelength2) {
      wavelengths.push(example.wavelength2);
    }
    setExampleWavelengths(wavelengths);
    
    // Scroll to top to see the visualizer
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            🌈 Spectroscopy Color Visualizer
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Explore how wavelength absorption creates the colors we see in chemistry
          </p>
        </header>
        
        {/* Advanced Spectrum Wheel - Top Priority */}
        <RotatingDisk />
        
        {/* Main Visualizer */}
        <WavelengthVisualizer 
          initialWavelength={selectedWavelength}
          exampleWavelengths={exampleWavelengths}
          onManualChange={() => {
            setSelectedExample(null);
            setExampleWavelengths([]);
          }}
        />
        
        {/* Color Wheel */}
        <ColorWheel wavelength={selectedWavelength} />
        
        {/* Examples */}
        <Examples onExampleClick={handleExampleClick} selectedExample={selectedExample} />
      </div>
      
      {/* Footer with Credits */}
      <Footer />
    </div>
  );
}

export default App;
