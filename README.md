<div align="center">

# 🎭 LA CASA DE PAPEL // CINEMATIC HEIST EXPERIENCE

<p align="center">
  <strong>An ultra-immersive, WebGL & Three.js 3D cinematic heist web application inspired by <em>Money Heist (La Casa de Papel)</em>.</strong>
</p>

<p align="center">
  <a href="https://spectacular-sopapillas-9b9206.netlify.app/"><img src="https://img.shields.io/badge/Live_Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/Abhitechdev/cinematic-heist-experience"><img src="https://img.shields.io/badge/Repository-cinematic--heist--experience-c91414?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" /></a>
  <a href="https://greensock.com/gsap/"><img src="https://img.shields.io/badge/GSAP_3-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

<p align="center">
  🌐 <strong>Live Website:</strong> <a href="https://spectacular-sopapillas-9b9206.netlify.app/"><strong>https://spectacular-sopapillas-9b9206.netlify.app/</strong></a>
</p>

<p align="center">
  🔴 <strong>"THE PLAN IS ALREADY IN MOTION."</strong> 🔴
</p>

---

</div>

## 📌 Overview

**Cinematic Heist Experience** is a state-of-the-art web application that puts you in the control center of the Royal Mint heist. Combining high-performance WebGL 3D graphics, procedural physical models, synchronized Web Audio synthesis, and GSAP camera kinematics, this experience transforms standard web browsing into a Hollywood-grade heist simulation.

---

## ✨ Key Features & Architectural Highlights

### 🏛️ 1. Interactive 3D Neoclassical Architecture
- **Procedural 3D Bank Model**: Full neoclassical wireframe complex complete with 8 fluted classical columns, golden triangular pediment, west administrative wing, east minting printing hall, rooftop parapet with a real-time flashing red beacon spire, and subterranean vault cutaways.
- **Clickable Room Sectors**: Click directly on 3D hitboxes or quick badges to smoothly glide the camera and orient the model towards:
  - `SEC-A1`: Grand Colonnade & Main Ingress
  - `SEC-B2`: Administration & Cashier Wing
  - `SEC-C3`: Minting & Printing Press Hall
  - `SEC-R4`: Rooftop Sniper Parapet & Broadcast Spire
  - `SEC-V0`: Subterranean 40-Ton Vault Core
- **Volumetric Holographic Focus**: Pulsing crimson cubic room highlight box framing the active sector with synchronized tactical telemetry.
- **360° Orbit Drag**: Damped inertia drag controls supporting both desktop mouse navigation and mobile touch gestures.

### 🗺️ 2. 3D Isometric Holographic Blueprint
- **Multi-Level Elevation System**: 4 elevated structural floor slabs spanning Level +1 (Rooftop), Level 0 (Ground Entry), Level -1 (Sub-Vault), and Level -2 (Subterranean Extraction).
- **Holographic Laser Trajectory**: Glowing red curved 3D tube guiding the heist route through checkpoints.
- **Interactive Radar Beacons**: Click any of the 5 mission checkpoints (`SEC-01` to `SEC-05`) to glide the isometric camera directly to that architectural elevation.
- **Dual-Mode Display**: Seamless toggle between `[3D ISOMETRIC PROJECTION]` and `[2D CAD SCHEMATIC]`.

### 🔐 3. Physical 3D Vault Opening & Gold Bullion
- **Mechanical Vault Door**: Radial locking pins, pneumatic bolts, central rotating wheel, and reinforced circular vault bulkhead.
- **Interactive Security Keypad**: Audio-reactive keypad interface. Entering the master override code triggers physical bolt retraction, door swing animation, and alarm system state changes.
- **Subterranean Bullion Treasury**: Unseals stacks of realistic high-purity gold bars with specular lighting and atmospheric smoke.

### 🎈 4. Blimp Escape & Money Rain Cinematic Sequence
- **Tactical Zeppelin Airship**: 3D airship envelope featuring observation gondola, red stabilizer fins, and dual turbine propulsion.
- **Dynamic Banknote & Gold Fall**: Tumbling Spanish banknotes and falling bullion with individualized aerodynamic drag, tumbling rotation, and depth layering.

### 👥 5. Tactical Crew Dossiers
- Interactive tactical dossiers for **El Profesor**, **Tokyo**, **Berlin**, **Nairobi**, **Rio**, and **Denver**.
- Code names, specialized roles, biometric statistics, security clearances, and authentic voice quote audio playback.

### 🎵 6. Web Audio Sound Engine & Waveform Visualizer
- Low-latency procedural Web Audio synthesizer providing mechanical gear clicks, vault hums, radar pings, alarm sirens, and keypad feedback.
- Background heist soundtrack with interactive playback controls, mute toggles, and live visualizer waveforms.

### ⚡ 7. Ultra-Smooth Performance & Mobile Adaptation
- Optimized requestAnimationFrame loop with RAF timestamp throttling.
- Hardware-accelerated GPU transforms with zero layout thrashing.
- Fluid custom magnetic cursor with interactive hover detection.
- Full mobile and touch screen responsiveness.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) |
| **3D Graphics & WebGL** | [Three.js](https://threejs.org/) |
| **Animation & Camera Physics** | [GSAP (GreenSock)](https://greensock.com/), [ScrollTrigger](https://greensock.com/scrolltrigger/) |
| **Smooth Scrolling** | [Lenis](https://lenis.darkroom.engineering/) |
| **Audio Synthesis** | Native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) |
| **Icons & UI Elements** | [Lucide React](https://lucide.dev/) |
| **Styling** | Vanilla CSS, CSS Grid, Flexbox, Custom Design Tokens |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhitechdev/cinematic-heist-experience.git
   cd cinematic-heist-experience
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production bundle will be generated in the `dist/` directory.

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## 📂 Project Architecture

```
├── public/                     # Static assets, audio, logos, textures, gold bars
│   └── assets/
│       ├── dossiers/           # Crew character imagery
│       ├── money-heist-theme.mp3 # Atmospheric heist audio
│       └── gold-bar-*.png      # High-resolution gold bar assets
├── src/
│   ├── components/
│   │   ├── common/             # AudioPlayer, Preloader, Header, CustomCursor
│   │   ├── sections/           # Heist sections:
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PlanSection.tsx
│   │   │   ├── BankRevealSection.tsx  # 3D Neoclassical Architecture & Rooms
│   │   │   ├── CrewSection.tsx
│   │   │   ├── BlueprintSection.tsx   # 3D Isometric Holographic Blueprint
│   │   │   ├── VaultSection.tsx       # Physical 3D Vault & Keypad
│   │   │   ├── BlimpEscapeSection.tsx # 3D Blimp & Money Rain
│   │   │   └── FinalPlanSection.tsx
│   │   └── three/              # Three.js WebGL scenes & procedural assets:
│   │       ├── InteractiveBankModel3D.tsx  # Neoclassical bank building
│   │       ├── BlueprintModel3D.tsx        # 4-level isometric blueprint
│   │       ├── VaultScene3D.tsx            # Physical vault door & gold
│   │       ├── BlimpEscape3D.tsx           # 3D blimp & banknote physics
│   │       └── Scene3D.tsx                 # Core global Three.js canvas
│   ├── data/                   # Crew dossiers, blueprint nodes, audio metadata
│   ├── lib/                    # soundEngine.ts (Web Audio synthesizer)
│   ├── types/                  # TypeScript interface definitions
│   ├── App.tsx                 # Main layout & section orchestration
│   └── main.tsx                # App entrypoint & Lenis smooth scroll
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 👨‍💻 About The Developer

<div align="center">

<img src="https://github.com/Abhitechdev.png" width="120" height="120" style="border-radius: 50%; border: 3px solid #c91414;" alt="Abhishek Avatar" />

### **Abhishek**
**Creative Technologist & Full-Stack Developer**

[![GitHub Profile](https://img.shields.io/badge/GitHub-Abhitechdev-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Abhitechdev)
[![Repository](https://img.shields.io/badge/Project-cinematic--heist--experience-c91414?style=for-the-badge&logo=git&logoColor=white)](https://github.com/Abhitechdev/cinematic-heist-experience)
[![Live Site](https://img.shields.io/badge/Live_Site-Visit_Demo-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://spectacular-sopapillas-9b9206.netlify.app/)

*Passionate about building high-fidelity cinematic web experiences, interactive 3D WebGL environments, and next-generation frontend architectures.*

</div>

---

## 📄 License & Disclaimer

This project is created for educational, portfolio, and artistic showcase purposes. Inspired by the television series *La Casa de Papel* (Money Heist). All trademarks and related copyrights are property of their respective owners.

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  <sub>Designed & engineered with precision by <a href="https://github.com/Abhitechdev">Abhishek (@Abhitechdev)</a>.</sub>
</div>
