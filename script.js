// ============================================================
// Mobile nav toggle
// ============================================================
(function () {
  const toggle = document.getElementById("navToggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("nav-links-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
})();

// ============================================================
// Ranging console — simulated UWB multilateration
// ============================================================
(function () {
  const canvas = document.getElementById("radar");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const COLORS = {
    grid: "rgba(73, 211, 199, 0.08)",
    anchor: "#49d3c7",
    anchorDim: "rgba(73, 211, 199, 0.35)",
    uav: "#ffb454",
    range: "rgba(255, 180, 84, 0.28)",
    rangeSweep: "rgba(255, 180, 84, 0.9)",
    text: "rgba(220, 234, 240, 0.55)",
  };

  const anchors = [
    { x: W * 0.16, y: H * 0.86, label: "A" },
    { x: W * 0.50, y: H * 0.90, label: "B" },
    { x: W * 0.84, y: H * 0.86, label: "C" },
  ];

  // UAV wanders gently within a bounded region above the anchors
  let uav = { x: W * 0.5, y: H * 0.32 };
  let target = randomTarget();
  let t = 0;

  function randomTarget() {
    return {
      x: W * (0.32 + Math.random() * 0.36),
      y: H * (0.18 + Math.random() * 0.28),
    };
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  // scale: pixels -> "meters" for telemetry readout (arbitrary, plausible)
  const SCALE = 0.055;

  const elA = document.getElementById("rangeA");
  const elB = document.getElementById("rangeB");
  const elC = document.getElementById("rangeC");
  const elFix = document.getElementById("fixCoord");
  const elStatus = document.getElementById("fixStatus");

  function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x <= W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawAnchor(a) {
    ctx.fillStyle = COLORS.anchor;
    ctx.beginPath();
    ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // small tower mark
    ctx.strokeStyle = COLORS.anchorDim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x, a.y + 18);
    ctx.stroke();

    ctx.font = "11px 'IBM Plex Mono', monospace";
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.fillText(a.label, a.x, a.y + 32);
  }

  function drawRangeLine(a, sweepPhase) {
    const d = dist(a, uav);
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = COLORS.range;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(uav.x, uav.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // traveling pulse along the range line
    const pulseT = (sweepPhase % 1);
    const px = a.x + (uav.x - a.x) * pulseT;
    const py = a.y + (uav.y - a.y) * pulseT;
    ctx.fillStyle = COLORS.rangeSweep;
    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fill();

    return d;
  }

  function drawUav() {
    ctx.fillStyle = COLORS.uav;
    ctx.beginPath();
    ctx.arc(uav.x, uav.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 180, 84, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(uav.x, uav.y, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "11px 'IBM Plex Mono', monospace";
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = "center";
    ctx.fillText("UAV", uav.x, uav.y - 16);
  }

  function updateTelemetry(dA, dB, dC) {
    if (elA) elA.textContent = (dA * SCALE).toFixed(2) + " m";
    if (elB) elB.textContent = (dB * SCALE).toFixed(2) + " m";
    if (elC) elC.textContent = (dC * SCALE).toFixed(2) + " m";
    if (elFix) {
      const fx = ((uav.x - W / 2) * SCALE).toFixed(2);
      const fy = ((H - uav.y) * SCALE).toFixed(2);
      elFix.textContent = fx + " , " + fy;
    }
  }

  function frame() {
    t += 1;
    ctx.clearRect(0, 0, W, H);
    drawGrid();

    // ease uav toward a wandering target
    uav.x += (target.x - uav.x) * 0.01;
    uav.y += (target.y - uav.y) * 0.01;
    if (dist(uav, target) < 4) target = randomTarget();

    const sweepPhase = t / 70;
    const dA = drawRangeLine(anchors[0], sweepPhase + 0.0);
    const dB = drawRangeLine(anchors[1], sweepPhase + 0.33);
    const dC = drawRangeLine(anchors[2], sweepPhase + 0.66);

    anchors.forEach(drawAnchor);
    drawUav();
    updateTelemetry(dA, dB, dC);

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    // draw a single static frame, no animation loop
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    const dA = drawRangeLine(anchors[0], 0);
    const dB = drawRangeLine(anchors[1], 0.33);
    const dC = drawRangeLine(anchors[2], 0.66);
    anchors.forEach(drawAnchor);
    drawUav();
    updateTelemetry(dA, dB, dC);
  } else {
    requestAnimationFrame(frame);
  }

  // occasional status flicker for realism
  if (elStatus && !reduceMotion) {
    setInterval(() => {
      elStatus.textContent = "REACQUIRING…";
      elStatus.classList.remove("status-locked");
      setTimeout(() => {
        elStatus.textContent = "LOCKED";
        elStatus.classList.add("status-locked");
      }, 550);
    }, 9000);
  }
})();
