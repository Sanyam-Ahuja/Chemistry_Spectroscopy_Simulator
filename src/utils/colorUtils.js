// Spectroscopy color utilities

// Wavelength ranges for visible spectrum
export const SPECTRUM_CONFIG = {
  violet: { min: 380, max: 450, color: '#8B00FF' },
  blue: { min: 450, max: 495, color: '#0000FF' },
  cyan: { min: 495, max: 520, color: '#00FFFF' },
  green: { min: 520, max: 565, color: '#00FF00' },
  yellow: { min: 565, max: 590, color: '#FFFF00' },
  orange: { min: 590, max: 620, color: '#FF8000' },
  red: { min: 620, max: 780, color: '#FF0000' }
};

// Complementary color relationships (ideal mode)
export const COMPLEMENTARY_COLORS = {
  violet: { absorbed: '#8B00FF', observed: '#FFFF00' }, // Violet absorbs → Yellow observed
  blue: { absorbed: '#0000FF', observed: '#FF8000' },    // Blue absorbs → Orange observed
  cyan: { absorbed: '#00FFFF', observed: '#FF0000' },    // Cyan absorbs → Red observed
  green: { absorbed: '#00FF00', observed: '#FF00FF' },   // Green absorbs → Magenta observed
  yellow: { absorbed: '#FFFF00', observed: '#8B00FF' },  // Yellow absorbs → Violet observed
  orange: { absorbed: '#FF8000', observed: '#0000FF' },  // Orange absorbs → Blue observed
  red: { absorbed: '#FF0000', observed: '#00FFFF' }      // Red absorbs → Cyan observed
};

// Convert wavelength to RGB color
export function wavelengthToRGB(wavelength) {
  let r = 0, g = 0, b = 0;
  
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0;
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0;
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
    b = 0;
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1;
    g = 0;
    b = 0;
  }
  
  // Intensity correction for edge wavelengths
  let factor = 1;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  } else if (wavelength >= 700 && wavelength <= 780) {
    factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
  }
  
  r = Math.round(r * factor * 255);
  g = Math.round(g * factor * 255);
  b = Math.round(b * factor * 255);
  
  return { r, g, b };
}

// Convert RGB to hex
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Get complementary color
export function getComplementaryRGB(r, g, b) {
  return {
    r: 255 - r,
    g: 255 - g,
    b: 255 - b
  };
}

// Determine which color band a wavelength falls into
export function getColorBand(wavelength) {
  for (const [name, range] of Object.entries(SPECTRUM_CONFIG)) {
    if (wavelength >= range.min && wavelength < range.max) {
      return name;
    }
  }
  return null;
}

// Get observed color for absorbed wavelength
export function getObservedColor(wavelength, mode = 'ideal') {
  const band = getColorBand(wavelength);
  
  if (!band) return '#FFFFFF';
  
  if (mode === 'ideal') {
    return COMPLEMENTARY_COLORS[band].observed;
  } else {
    // Real mode: use complementary RGB
    const absorbedRGB = wavelengthToRGB(wavelength);
    const complementary = getComplementaryRGB(absorbedRGB.r, absorbedRGB.g, absorbedRGB.b);
    return rgbToHex(complementary.r, complementary.g, complementary.b);
  }
}

// Get absorbed color for wavelength
export function getAbsorbedColor(wavelength) {
  const rgb = wavelengthToRGB(wavelength);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// VIBGYOR colors for color disk
export const VIBGYOR_COLORS = [
  { name: 'Violet', color: '#8B00FF', rgb: { r: 139, g: 0, b: 255 } },
  { name: 'Indigo', color: '#4B0082', rgb: { r: 75, g: 0, b: 130 } },
  { name: 'Blue', color: '#0000FF', rgb: { r: 0, g: 0, b: 255 } },
  { name: 'Green', color: '#00FF00', rgb: { r: 0, g: 255, b: 0 } },
  { name: 'Yellow', color: '#FFFF00', rgb: { r: 255, g: 255, b: 0 } },
  { name: 'Orange', color: '#FF8000', rgb: { r: 255, g: 128, b: 0 } },
  { name: 'Red', color: '#FF0000', rgb: { r: 255, g: 0, b: 0 } }
];

// Mix colors based on enabled segments
export function mixColors(enabledColors, mode = 'ideal') {
  if (enabledColors.length === 0) return '#000000';
  if (enabledColors.length === 1) return enabledColors[0].color;
  
  if (mode === 'ideal') {
    // Additive color mixing with proper normalization
    // Only produces white when ALL 7 colors are present
    let r = 0, g = 0, b = 0;
    
    enabledColors.forEach(color => {
      r += color.rgb.r;
      g += color.rgb.g;
      b += color.rgb.b;
    });
    
    // If all 7 VIBGYOR colors are selected, return white
    if (enabledColors.length === 7) {
      return '#FFFFFF';
    }
    
    // Otherwise, use weighted averaging to prevent premature white
    // This makes the mixing more realistic
    const weight = enabledColors.length / 7; // Fraction of total colors
    r = Math.min(255, Math.round((r / enabledColors.length) * (1 + weight)));
    g = Math.min(255, Math.round((g / enabledColors.length) * (1 + weight)));
    b = Math.min(255, Math.round((b / enabledColors.length) * (1 + weight)));
    
    return rgbToHex(r, g, b);
  } else {
    // Real mode: RGB averaging
    let r = 0, g = 0, b = 0;
    enabledColors.forEach(color => {
      r += color.rgb.r;
      g += color.rgb.g;
      b += color.rgb.b;
    });
    
    r = Math.round(r / enabledColors.length);
    g = Math.round(g / enabledColors.length);
    b = Math.round(b / enabledColors.length);
    
    return rgbToHex(r, g, b);
  }
}

// Get observed color when multiple wavelength ranges are absorbed
export function getObservedColorMultiRange(ranges, mode = 'ideal') {
  if (!ranges || ranges.length === 0) return '#FFFFFF';
  
  // For simplicity with multiple ranges, we'll blend the complementary colors
  const complementaryColors = ranges.map(range => {
    const midWavelength = (range.min + range.max) / 2;
    return getObservedColor(midWavelength, mode);
  });
  
  if (complementaryColors.length === 1) return complementaryColors[0];
  
  // Convert hex to RGB and average
  let r = 0, g = 0, b = 0;
  complementaryColors.forEach(hex => {
    const rgb = hexToRgb(hex);
    r += rgb.r;
    g += rgb.g;
    b += rgb.b;
  });
  
  r = Math.round(r / complementaryColors.length);
  g = Math.round(g / complementaryColors.length);
  b = Math.round(b / complementaryColors.length);
  
  return rgbToHex(r, g, b);
}

// Convert hex to RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Educational examples
export const EXAMPLES = [
  {
    name: 'β-Carotene',
    wavelength: 450,
    description: 'Absorbs blue (~450 nm)',
    appearsColor: 'Orange',
    appearsHex: '#FF8000'
  },
  {
    name: 'Chlorophyll-a',
    wavelength: 430,
    wavelength2: 662,
    description: 'Absorbs blue (~430 nm) and red (~662 nm)',
    appearsColor: 'Green',
    appearsHex: '#00FF00'
  },
  {
    name: 'KMnO₄',
    wavelength: 525,
    description: 'Absorbs green (~525 nm)',
    appearsColor: 'Purple',
    appearsHex: '#FF00FF'
  },
  {
    name: 'Crystal Violet Dye',
    wavelength: 420,
    description: 'Absorbs yellow-green (~410–430 nm)',
    appearsColor: 'Violet',
    appearsHex: '#8B00FF'
  },
  {
    name: 'Dichromate Ion (Cr₂O₇²⁻)',
    wavelength: 450,
    description: 'Absorbs blue (~450 nm)',
    appearsColor: 'Orange',
    appearsHex: '#FF8000'
  }
];
