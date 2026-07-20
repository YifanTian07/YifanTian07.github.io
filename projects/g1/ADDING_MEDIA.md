# Adding media to the G1 project page

The page already contains six production-ready media slots. Adding real project material only requires copying files and editing one manifest—no HTML changes.

## 1. Prepare the files

| Slot | Suggested filename | Recommended format |
| --- | --- | --- |
| Project overview | `g1-overview.mp4` | H.264 MP4, 16:9, 10–30 s |
| Upper-body teleoperation | `teleop-upper.webp` | WebP/JPG, 4:3 or 3:2 |
| Whole-body teleoperation | `teleop-whole.webp` | WebP/JPG, 4:3 or 3:2 |
| Isaac Sim screenshot | `isaac-sim.webp` | WebP/JPG, 16:9 |
| Isaac Sim rollout | `isaac-sim-rollout.mp4` | H.264 MP4, 16:9 |
| Physical G1 result | `g1-real-robot.mp4` | H.264 MP4, 16:9 |

For GitHub Pages, keep videos short and compressed. 1080p H.264 MP4 is the safest browser-compatible choice. Remove faces, access tokens, room details, or other sensitive information before publishing.

## 2. Copy files into the media folder

Place them in:

```text
projects/g1/media/
```

## 3. Enable each file in the manifest

Open `projects/g1/media-manifest.js` and fill in `src`. For an image:

```js
teleopUpper: {
  type: "image",
  src: "media/teleop-upper.webp",
  alt: { en: "Apple Vision Pro upper-body teleoperation", zh: "Apple Vision Pro 上肢遥操作" }
}
```

For a video, you can also set a poster image:

```js
realRobot: {
  type: "video",
  src: "media/g1-real-robot.mp4",
  poster: "media/g1-real-robot-poster.webp",
  alt: { en: "Physical Unitree G1 deployment", zh: "Unitree G1 真机部署效果" }
}
```

Leave `src: ""` for material that is not ready. The designed placeholder remains visible automatically.

## 4. Preview and publish

Run a local static server from the repository root, then visit `/projects/g1/`. After checking both languages and mobile layout:

```powershell
git add projects/g1
git commit -m "content: add G1 project media"
git push origin main
```

GitHub Pages will update the public page after the deployment finishes.
