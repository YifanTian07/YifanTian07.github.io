# Homepage constellation update — 2026-09-05

## Accepted user requirements

- Retain Ocean Glass colors and make the homepage a 3D star-cluster space.
- Four clusters: about, research interests, papers, projects.
- Wheel and keyboard navigation center a category; double-click expands it.
- Expanded items retain spatial distribution and show their main content.
- Update student year to Year 2 / 大二; retain cohort 2025.
- Plan the change before implementation.

## Revised interaction and modeling — 2026-09-05

The user requested a second visual pass: fluorescent galaxies without connecting
lines, full-screen movement in both axes, no bottom controls, upward flick to exit,
and individually themed planets with color-matched descriptions.

The active scene now uses a locally hosted Three.js WebGL renderer. `galaxy-engine.js`
owns particle galaxies, procedural sphere textures, atmosphere, lighting, camera
rotation and projection. `constellation.js` owns translated content and interaction.
The old Canvas projection and card carousel have been replaced.

Gestures: drag in either axis to orbit; wheel/trackpad moves the view on both axes;
pinch or Ctrl+wheel changes distance. Double-click a galaxy to enter. Click a planet
for its colored note. A mostly vertical upward flick over 110 px within 420 ms exits
the group; slower vertical drags continue orbiting. Escape is the keyboard equivalent.
The note itself scrolls normally. Arrow keys rotate the view; Tab and Enter provide
direct access to all celestial labels. There are no bottom navigation buttons.

## Original implementation sequence

1. Add a progressive-enhancement spatial navigation layer over the existing semantic document.
2. Render deterministic 3D point clouds on Canvas, with perspective, depth and restrained animation.
3. Add category navigation and CSS 3D detail cards; reuse translated document content.
4. Preserve paper figures, arXiv links, project links and the G1 case study.
5. Add visible controls, touch swipe, Enter/Escape, pause motion, and a reading-view fallback.
6. Verify desktop/mobile behavior and publish through existing Git version control.

## Acceptance evidence

Browser checks at 1440px and 390px cover category count, double-click expansion,
keyboard navigation, Escape, paper image loading, paper links, G1 link,
language changes, reading-view round trip, wheel, swipe and pause controls.
Screenshots are saved under the ignored tmp directory. No 3D library or hosted
asset dependency is needed. Without JavaScript the existing document is visible.
