# 🌈 Spectroscopy Color Visualizer

An interactive React.js web application that visualizes color absorption and reflection in spectroscopy. Built with React and Tailwind CSS for an intuitive, scientifically accurate, and beautiful learning experience.

## ✨ Features

### 1. Wavelength Absorption → Observed Color Visualizer
- Input any wavelength (380-780 nm) to see what color is absorbed
- View the complementary observed color (what the compound appears)
- Interactive spectrum bar with clickable wavelength selection
- **Ideal Mode**: Uses fixed complementary colors from color theory
- **Real Mode**: Applies RGB-based color mixing for more natural appearance

### 2. Color Wheel Helper
- Visual representation of complementary color relationships
- Shows absorbed wavelength and its opposite reflected color
- Highlights the spectroscopic principle of complementary colors

### 3. Rotating Color Disk Simulator
- Interactive VIBGYOR disk with selectable color segments
- Animated rotation to simulate color mixing
- Real-time color blending preview
- Toggle between ideal (additive) and real (averaged) mixing modes

### 4. Educational Examples
- 5 real-world chemical compounds:
  - β-Carotene (appears orange)
  - Chlorophyll-a (appears green)
  - KMnO₄ (appears purple)
  - Crystal Violet Dye (appears violet)
  - Dichromate Ion (appears orange)
- Click any example to auto-populate the visualizer

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

## 🎨 Technology Stack

- **React 18** - Modern functional components with hooks
- **Tailwind CSS** - Utility-first styling
- **Canvas API** - For spectrum visualization and color wheel
- **PostCSS** - CSS processing

## 📚 Scientific Principles

### Complementary Colors in Spectroscopy
When a compound absorbs light at a specific wavelength, it appears as the **complementary color** to what was absorbed:

- **Absorbed Blue** → Appears Orange
- **Absorbed Green** → Appears Magenta/Purple
- **Absorbed Yellow** → Appears Violet
- **Absorbed Red** → Appears Cyan

### Modes Explained

**Ideal Mode**: Uses traditional color wheel complementary relationships. Perfect for teaching basic concepts.

**Real Mode**: Approximates human color perception using RGB color space transformations. More realistic for actual spectroscopic observations.

## 🎯 Usage Tips

1. **Experiment with Wavelengths**: Try different values to see how color changes across the visible spectrum
2. **Compare Modes**: Switch between Ideal and Real to understand different color models
3. **Use Examples**: Start with real compounds to understand practical applications
4. **Color Disk**: Disable individual colors to see how they contribute to the final mixed color

## 📖 Educational Context

This tool is designed for:
- Chemistry students learning about spectroscopy
- Understanding visible light absorption
- Visualizing complementary color theory
- Interactive exploration of color mixing principles

## 🤝 Contributing

Feel free to fork, modify, and use this project for educational purposes.

## 📝 License

This project is open source and available for educational use.

---

**Built with ❤️ for chemistry education**
