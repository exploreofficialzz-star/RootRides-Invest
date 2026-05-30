# RootRides Invest — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3 | UI framework |
| react-dom | ^18.3 | DOM renderer |
| vite | ^6.0 | Build tool |
| @vitejs/plugin-react | ^4.3 | Vite React integration |
| typescript | ^5.6 | Type system |
| tailwindcss | ^4.0 | Utility CSS |
| @tailwindcss/vite | ^4.0 | Tailwind Vite plugin |
| three | ^0.170 | WebGL engine (hero wave) |
| @react-three/fiber | ^8.17 | React Three.js renderer |
| @react-three/drei | ^9.114 | R3F helpers |
| framer-motion | ^11.15 | Component animations, scroll reveals |
| clsx | ^2.1 | Conditional class names |
| tailwind-merge | ^2.6 | Tailwind class deduplication |
| lucide-react | ^0.460 | Icons (header, features, particles, nav) |
| lenis | ^1.1 | Smooth scroll |

---

## Component Inventory

### Layout

| Component | Source | Notes |
|-----------|--------|-------|
| Header | Custom | Fixed, blend-mode color switch on scroll. No library needed. |
| Footer | Custom | Static 4-column grid. |

### Sections

| Component | Source | Notes |
|-----------|--------|-------|
| HeroSection | Custom | Hosts WebGL canvas + floating title card + CinematicRadialWipe overlay. |
| StatsBar | Custom | 4 stat items with CSS shimmer-gold keyframe. |
| InvestmentPlans | Custom | Bento grid + FloatingIconParticles canvas overlay. |
| TickerSection | Custom | Hosts AnimatedTextTicker. |
| WhyRootRides | Custom | 4 feature cards with CSS card-glow keyframe. |
| ReferralProgram | Custom | Dual card layout with card-glow. |
| TestimonialsSection | Custom | Hosts OrbitalTestimonialCarousel on #02231c background. |
| FAQSection | Custom | Hosts PerspectiveFoldFAQ. |
| DownloadCTA | Custom | Gradient bg, CSS float-up particles. |

### Reusable Components

| Component | Source | Reuse | Notes |
|-----------|--------|-------|-------|
| WebGLWaveSurface | Custom | 1 (Hero only) | R3F Canvas with orthographic camera, fullscreen ShaderMaterial plane. |
| CinematicRadialWipe | Custom | 1 (page-level) | Fixed overlay, 3 conic-gradient layers with staggered delays. |
| AnimatedTextTicker | Custom | 1 (Ticker only) | Owns DOM splitting + IntersectionObserver logic internally. |
| OrbitalTestimonialCarousel | Custom | 1 (Testimonials only) | setInterval-driven 3D carousel with manual rotateY transforms. |
| PerspectiveFoldFAQ | Custom | 1 (FAQ only) | Accordion with preserve-3d rotateX transforms. |
| FloatingIconParticles | Custom | 1 (InvestmentPlans only) | Imperative Canvas 2D loop, ~40 Particle instances. |

### Hooks

| Hook | Purpose |
|------|---------|
| useScrollReveal | framer-motion `useInView` wrapper for reusable section fade-in + translateY |
| useCountUp | IntersectionObserver-triggered numeric count-up for StatsBar |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| WebGL sinusoidal wave | Three.js / R3F | Custom ShaderMaterial on PlaneGeometry(2,2) with orthographic camera. Self-contained simplex noise + rotation in fragment shader. u_time driven by useFrame. | **High** 🔒 |
| Cinematic radial wipe | CSS keyframes | 3 fixed-position divs with conic-gradient animation sequence + delayed opacity fadeout. No JS animation library. | **Medium** |
| Ticker auto-scroll + per-char popIn | CSS keyframes + vanilla JS | Two duplicate `<ul>` blocks for seamless translate3d loop. IO triggers popIn keyframe on individual chars (JS splits text into spans). | **Medium** |
| Orbital 3D testimonial carousel | setInterval + inline transforms | Cards positioned via rotateY + translateZ on a preserve-3d track. 40ms setInterval increments activeIndex. Hover pauses/resumes. | **Medium** |
| Perspective fold FAQ | CSS transitions + React state | is-open class toggles rotateX transforms on front/back panels with cubic-bezier easing. preserve-3d on parent. | **Medium** |
| Floating icon particles | Canvas 2D (imperative) | requestAnimationFrame loop over Particle class instances. Sine-wave drift + mouse proximity repulsion via distance calc. Icon paths drawn with beginPath/stroke. | **High** 🔒 |
| Shimmer gold text | CSS keyframes | background-clip: text with 200% gradient and background-position animation. Pure CSS. | Low |
| Card glow breathing | CSS keyframes | Radial box-shadow oscillation on a 6s loop. Pure CSS. | Low |
| FAQ divider shimmer | CSS keyframes | ::after pseudo-element with linear-gradient background-position sweep. | Low |
| CTA float-up particles | CSS keyframes | 6-8 small divs with randomized animation-duration (8-12s), translateY + opacity decay. | Low |
| Hero content fade-in | framer-motion | motion.div with initial/animate opacity + y, 0.8s delay after mount. | Low |
| Section scroll reveals | framer-motion | useInView hook triggers staggered children (0.1s apart) with translateY + opacity. | Low |
| Investment cards stagger | framer-motion | Staggered fade-in from bottom, 0.15s delay between cards via useInView. | Low |
| Stats count-up | Custom hook | requestAnimationFrame lerp from 0 to target over 1.5s, triggered by IO. | Low |

---

## State & Logic Plan

### Header Color Switching

The header transitions between white (dark sections) and `#02231c` (light sections). This requires knowing which section the user is currently viewing.

**Plan:** Use `IntersectionObserver` on each section root element (threshold: 0.5) to track the currently visible section. Maintain `activeSectionId` in a shared ref (not React state, to avoid re-renders). The header reads the active section's background color from a `data-bg` attribute or a lookup map and applies the appropriate text color. The observer fires only on section boundaries, not on every scroll pixel.

### Ticker Character Splitting Lifecycle

The AnimatedTextTicker splits text into `<span className=