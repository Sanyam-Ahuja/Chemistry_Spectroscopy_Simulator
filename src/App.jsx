import React, { useState } from 'react';
import WavelengthVisualizer from './components/WavelengthVisualizer';
import ColorWheel from './components/ColorWheel';
import RotatingDisk from './components/RotatingDisk';
import Examples from './components/Examples';
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
        
        {/* Main Visualizer */}
        <WavelengthVisualizer 
          initialWavelength={selectedWavelength}
          exampleWavelengths={exampleWavelengths}
          onManualChange={() => {
            setSelectedExample(null);
            setExampleWavelengths([]);
          }}
        />
        
        {/* Color Wheel and Disk Side by Side */}
        <div className="grid lg:grid-cols-2 gap-8">
          <ColorWheel wavelength={selectedWavelength} />
          <RotatingDisk />
        </div>
        
        {/* Examples */}
        <Examples onExampleClick={handleExampleClick} selectedExample={selectedExample} />
        
        {/* Footer */}
        <footer className="text-center text-white mt-12 pb-4">
          <p className="text-sm opacity-80">
            Built with React + Tailwind CSS | Interactive Spectroscopy Education Tool
          </p>
          <p className="text-xs opacity-60 mt-2">
            Ideal Mode uses complementary color theory • Real Mode simulates human perception
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
