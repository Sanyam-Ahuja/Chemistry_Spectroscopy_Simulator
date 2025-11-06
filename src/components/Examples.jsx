import React from 'react';
import { EXAMPLES } from '../utils/colorUtils';

const Examples = ({ onExampleClick, selectedExample }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-6">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">
          🧪 Educational Examples
        </h2>
        <p className="text-gray-600 text-sm">
          Click an example to see its absorption and observed color
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXAMPLES.map((example, index) => {
          const isActive = selectedExample === index;
          return (
          <button
            type="button"
            key={index}
            onClick={() => onExampleClick(index)}
            className={`text-left bg-gradient-to-br rounded-lg p-4 border-2 transition-all shadow-md hover:shadow-lg ${
              isActive 
                ? 'from-purple-200 to-pink-200 border-purple-500 border-4 shadow-xl' 
                : 'from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 hover:border-purple-400'
            }`}
          >
            <h3 className="font-bold text-purple-800 mb-2 text-lg">
              {example.name}
            </h3>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Absorbs:</span> {example.description.split('Absorbs ')[1]}
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Appears:</span>
                <div
                  className="w-20 h-8 rounded border-2 border-white shadow-sm"
                  style={{ backgroundColor: example.appearsHex }}
                />
                <span className="text-sm font-semibold text-gray-800">
                  {example.appearsColor}
                </span>
              </div>
              
              <div className="mt-3 pt-2 border-t border-purple-200">
                <span className="text-xs font-mono text-purple-600 bg-white px-2 py-1 rounded">
                  λ = {example.wavelength} nm
                  {example.wavelength2 && `, ${example.wavelength2} nm`}
                </span>
              </div>
            </div>
            {isActive && (
              <div className="mt-2 bg-purple-600 text-white text-xs font-bold py-1 px-3 rounded-full text-center">
                ✓ Currently Selected
              </div>
            )}
          </button>
        );
        })}
      </div>
      
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
        <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Key Concept</span>
        </h3>
        <p className="text-sm text-gray-700">
          When a compound absorbs light at a specific wavelength, it appears as the 
          <strong> complementary color</strong> to the absorbed wavelength. For example, 
          chlorophyll absorbs blue and red light, so it reflects green light—making plants 
          appear green to our eyes!
        </p>
      </div>
    </div>
  );
};

export default Examples;
