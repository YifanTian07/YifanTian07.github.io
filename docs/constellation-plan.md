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

### 360-degree background correction

The finite nebula planes and fractional identity-to-view quaternion interpolation
were replaced. A one-degree yaw step across 180 degrees previously produced a
43.08-degree background jump. The sky now integrates complete orientation deltas,
rebasing its input when a category changes without resetting its accumulated pose.

The nebula is a radius-180 enclosing sphere with a continuous 3D procedural shader.
Stars cover complete spherical shells, and the galactic dust follows a closed great
circle. There are 69,800 stars and bright points in the background. The camera far
plane is 300, beyond the sky even at maximum zoom distance. No rectangular sky
texture, planar boundary, UV seam or fractional-rotation branch remains.

Regression evidence: three complete turns about horizontal, vertical and diagonal
axes each have a maximum one-degree output step for one-degree input. All 256
sampled ray directions hit the sky from the maximum camera offset. Category entry
preserves the sky orientation. Forward, reverse and polar views are captured for
visual review; pause, category tints, mobile layout and frame cadence are checked.

### Persistent backgrounds and category themes (original design)

`galaxy-environment.js` provides scenery shared by the overview and every detail
scene: a nebula band, two star-depth layers, stellar dust, a ringed gas planet,
an orbiting moon and a distant rocky world. The three layers respond to view
rotation at different strengths. Background objects are excluded from hit testing.
Autonomous movement respects pause/reduced-motion settings and tab visibility.

Each category supplies its environment hue: about uses teal, research uses blue,
papers uses violet and projects uses amber. Nebulae, dust, stars and distant worlds
blend toward this tint; overview restores the mixed deep-blue environment. Content
planets keep their individual identity colors. The scenery persists across entries
instead of allocating new textures on every navigation.

Verification includes background-only pixel comparisons while paused and after
horizontal/vertical key input, autonomous motion, all four theme mappings, return
to overview, and a mobile paper-scene screenshot.

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
