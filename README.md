# GroundFix

**GNSS-independent local navigation for low-altitude autonomous UAVs.**

A static, single-page project site for the GroundFix system — a terrestrial
UWB anchor network fused with inertial sensing (IMU, barometer, magnetometer,
optical flow) through an Extended Kalman Filter, built to keep UAVs
positioned when GNSS is degraded, denied, or spoofed.

## Preview

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying with GitHub Pages

1. Push this folder to a GitHub repository (e.g. as the repo root, or under `/docs`).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   pick your branch, and the folder (`/root` or `/docs`).
4. Save — GitHub will publish the site at `https://<username>.github.io/<repo>/`.

## Structure

```
index.html   — page markup and content
style.css    — design tokens, layout, responsive rules
script.js    — mobile nav toggle + the ranging-console canvas animation
```

## Customizing

- Replace the `https://github.com/` links in `index.html` with your actual
  repository URL (nav bar, hero CTA, footer).
- Colors, type, and spacing are defined as CSS custom properties at the top
  of `style.css` under `:root`.
- The hero visualization is a self-contained canvas simulation in
  `script.js` — no external chart library required.
