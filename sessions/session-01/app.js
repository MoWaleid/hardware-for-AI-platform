// Session 01 Interactive Simulations — IEEE GUC Hardware for AI
(function () {
  "use strict";

  // ==================== SIMULATION 1: DATAPATH ====================
  const dpInputs = ["x1", "x2", "x3", "w1", "w2", "w3", "b"];
  let currentAct = "sigmoid";

  const presets = {
    corridor: { x1: 2.0, x2: 1.0, x3: 1.5, w1: 1.2, w2: 0.8, w3: 0.4, b: -6.0 },
    pillar:   { x1: 7.5, x2: 6.0, x3: 2.0, w1: 1.2, w2: 0.8, w3: 0.4, b: -6.0 },
    wall:     { x1: 8.5, x2: 0.5, x3: 9.0, w1: 1.2, w2: 0.8, w3: 0.4, b: -6.0 },
    ghost:    { x1: 4.5, x2: -3.5, x3: 2.0, w1: 1.2, w2: 0.8, w3: 0.4, b: -6.0 }
  };

  function fmtSigned(v, digits) {
    const s = v.toFixed(digits);
    return v >= 0 ? "+" + s : s;
  }

  function updateDatapath() {
    const vals = {};
    dpInputs.forEach((id) => {
      const el = document.getElementById(id);
      vals[id] = parseFloat(el.value);
      document.getElementById(id + "-val").textContent = vals[id].toFixed(1);
    });

    const p1 = vals.x1 * vals.w1;
    const p2 = vals.x2 * vals.w2;
    const p3 = vals.x3 * vals.w3;
    const dot = p1 + p2 + p3;
    const z = dot + vals.b;

    let yhat = 0;
    let slope = 0;
    let actLabel = "SIGMOID";
    let hwNote = "";

    if (currentAct === "sigmoid") {
      yhat = 1 / (1 + Math.exp(-z));
      slope = yhat * (1 - yhat);
      actLabel = "SIGMOID";
      hwNote = "<strong>Hardware cost:</strong> Requires <span class=\"mono\">e<sup>-z</sup></span> and division — typically approximated in FPGA/ASIC via a lookup table (LUT) or piecewise-linear segments.";
    } else if (currentAct === "relu") {
      yhat = Math.max(0, z);
      slope = z > 0 ? 1 : 0;
      actLabel = "ReLU";
      hwNote = "<strong>Hardware cost:</strong> Almost free in silicon — inspect the sign bit (MSB) of <span class=\"mono\">z</span> and route through a 1-bit 2:1 multiplexer (<span class=\"mono\">z &gt; 0 ? z : 0</span>).";
    } else {
      yhat = z >= 0 ? 1 : 0;
      slope = 0;
      actLabel = "STEP";
      hwNote = "<strong>Hardware cost:</strong> Single wire! Just invert the two's-complement sign bit (MSB) of <span class=\"mono\">z</span>. Zero slope everywhere prevents gradient learning.";
    }

    // Update SVG
    document.getElementById("svg-x1").textContent = vals.x1.toFixed(1);
    document.getElementById("svg-x2").textContent = vals.x2.toFixed(1);
    document.getElementById("svg-x3").textContent = vals.x3.toFixed(1);
    document.getElementById("svg-w1").textContent = vals.w1.toFixed(1);
    document.getElementById("svg-w2").textContent = vals.w2.toFixed(1);
    document.getElementById("svg-w3").textContent = vals.w3.toFixed(1);
    document.getElementById("svg-p1").textContent = fmtSigned(p1, 2);
    document.getElementById("svg-p2").textContent = fmtSigned(p2, 2);
    document.getElementById("svg-p3").textContent = fmtSigned(p3, 2);
    document.getElementById("svg-b").textContent = "b = " + vals.b.toFixed(1);
    document.getElementById("svg-z").textContent = fmtSigned(z, 2);
    document.getElementById("svg-act-name").textContent = actLabel;
    document.getElementById("svg-yhat").textContent = yhat.toFixed(3);

    // Update stat strip
    document.getElementById("stat-dot").textContent = fmtSigned(dot, 2);
    document.getElementById("stat-z").textContent = fmtSigned(z, 2);
    document.getElementById("stat-yhat").textContent = yhat.toFixed(3);
    document.getElementById("stat-slope").textContent = "Local slope f'(z) = " + slope.toFixed(3);
    document.getElementById("act-hw-note").innerHTML = hwNote;

    // Update verdict banner
    const banner = document.getElementById("drone-verdict");
    const vText = document.getElementById("verdict-text");
    const vMath = document.getElementById("verdict-math");
    if (z >= 0) {
      banner.classList.add("danger");
      vText.textContent = "OBSTACLE DETECTED — Trigger evasive climb! (z >= 0)";
    } else {
      banner.classList.remove("danger");
      vText.textContent = "CLEAR CORRIDOR — Hold altitude and speed (z < 0)";
    }
    vMath.textContent = "z = " + fmtSigned(z, 2) + " -> y_hat = " + yhat.toFixed(3);
  }

  dpInputs.forEach((id) => {
    document.getElementById(id).addEventListener("input", () => {
      document.querySelectorAll("#dp-presets button").forEach((b) => b.classList.remove("active"));
      updateDatapath();
    });
  });

  document.querySelectorAll("#dp-presets button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#dp-presets button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const p = presets[btn.dataset.preset];
      Object.keys(p).forEach((k) => {
        document.getElementById(k).value = p[k];
      });
      updateDatapath();
    });
  });

  document.querySelectorAll(".act-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".act-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentAct = btn.dataset.act;
      updateDatapath();
    });
  });

  // ==================== SIMULATION 2: 2D GEOMETRY & XOR ====================
  const droneData = [
    { x1: 1.5, x2: 1.0, y: 0 },
    { x1: 2.2, x2: 2.5, y: 0 },
    { x1: 3.0, x2: 0.8, y: 0 },
    { x1: 3.8, x2: 2.0, y: 0 },
    { x1: 1.8, x2: 4.2, y: 0 },
    { x1: 4.5, x2: 1.2, y: 0 },
    { x1: 6.2, x2: 4.5, y: 1 },
    { x1: 7.5, x2: 3.2, y: 1 },
    { x1: 5.4, x2: 6.5, y: 1 },
    { x1: 8.2, x2: 6.0, y: 1 },
    { x1: 6.8, x2: 7.8, y: 1 },
    { x1: 8.8, x2: 2.5, y: 1 }
  ];

  const xorData = [
    { x1: 2.0, x2: 2.0, y: 0, label: "(0,0) -> 0" },
    { x1: 2.0, x2: 8.0, y: 1, label: "(0,1) -> 1" },
    { x1: 8.0, x2: 2.0, y: 1, label: "(1,0) -> 1" },
    { x1: 8.0, x2: 8.0, y: 0, label: "(1,1) -> 0" }
  ];

  let activeDataset = droneData;
  const canvas = document.getElementById("geo-canvas");
  const ctx = canvas.getContext("2d");

  function toCanvasX(x1) {
    return 50 + (x1 / 10) * 560;
  }
  function toCanvasY(x2) {
    return 375 - (x2 / 10) * 340;
  }

  function renderGeometry() {
    const w1 = parseFloat(document.getElementById("gw1").value);
    const w2 = parseFloat(document.getElementById("gw2").value);
    const b = parseFloat(document.getElementById("gb").value);

    document.getElementById("gw1-val").textContent = w1.toFixed(2);
    document.getElementById("gw2-val").textContent = w2.toFixed(2);
    document.getElementById("gb-val").textContent = b.toFixed(2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Shade half-planes using a coarse grid
    const step = 8;
    for (let px = 50; px <= 610; px += step) {
      for (let py = 35; py <= 375; py += step) {
        const x1 = ((px - 50) / 560) * 10;
        const x2 = ((375 - py) / 340) * 10;
        const z = w1 * x1 + w2 * x2 + b;
        ctx.fillStyle = z >= 0 ? "rgba(180, 35, 42, 0.08)" : "rgba(0, 60, 147, 0.06)";
        ctx.fillRect(px, py, step, step);
      }
    }

    // Grid lines
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i += 2) {
      const gx = toCanvasX(i);
      const gy = toCanvasY(i);
      ctx.beginPath(); ctx.moveTo(gx, 35); ctx.lineTo(gx, 375); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(50, gy); ctx.lineTo(610, gy); ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = "11px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(i.toString(), gx, 392);
      ctx.textAlign = "right";
      ctx.fillText(i.toString(), 42, gy + 4);
    }

    // Axes border
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(50, 35, 560, 340);

    // Axis titles
    ctx.fillStyle = "#111827";
    ctx.font = "600 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("x1 : Proximity Sensor Reading (0 = far, 10 = close)", 330, 412);
    ctx.save();
    ctx.translate(16, 205);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("x2 : Closing Velocity (m/s)", 0, 0);
    ctx.restore();

    // Draw decision boundary line w1*x1 + w2*x2 + b = 0
    const pts = [];
    if (Math.abs(w2) > 1e-4) {
      const x2_at_0 = (-b - w1 * 0) / w2;
      const x2_at_10 = (-b - w1 * 10) / w2;
      if (x2_at_0 >= 0 && x2_at_0 <= 10) pts.push({ x1: 0, x2: x2_at_0 });
      if (x2_at_10 >= 0 && x2_at_10 <= 10) pts.push({ x1: 10, x2: x2_at_10 });
    }
    if (Math.abs(w1) > 1e-4) {
      const x1_at_0 = (-b - w2 * 0) / w1;
      const x1_at_10 = (-b - w2 * 10) / w1;
      if (x1_at_0 > 0 && x1_at_0 < 10) pts.push({ x1: x1_at_0, x2: 0 });
      if (x1_at_10 > 0 && x1_at_10 < 10) pts.push({ x1: x1_at_10, x2: 10 });
    }

    if (pts.length >= 2) {
      const pA = pts[0];
      const pB = pts[1];
      const cxA = toCanvasX(pA.x1);
      const cyA = toCanvasY(pA.x2);
      const cxB = toCanvasX(pB.x1);
      const cyB = toCanvasY(pB.x2);

      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cxA, cyA);
      ctx.lineTo(cxB, cyB);
      ctx.stroke();

      // Draw normal vector w from midpoint of segment
      const midX1 = 0.5 * (pA.x1 + pB.x1);
      const midX2 = 0.5 * (pA.x2 + pB.x2);
      const norm = Math.hypot(w1, w2);
      if (norm > 1e-3) {
        const startX = toCanvasX(midX1);
        const startY = toCanvasY(midX2);
        const endX = toCanvasX(midX1 + (w1 / norm) * 1.4);
        const endY = toCanvasY(midX2 + (w2 / norm) * 1.4);

        ctx.strokeStyle = "#003C93";
        ctx.fillStyle = "#003C93";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const angle = Math.atan2(endY - startY, endX - startX);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 9 * Math.cos(angle - 0.35), endY - 9 * Math.sin(angle - 0.35));
        ctx.lineTo(endX - 9 * Math.cos(angle + 0.35), endY - 9 * Math.sin(angle + 0.35));
        ctx.closePath();
        ctx.fill();

        ctx.font = "700 12px ui-monospace, monospace";
        ctx.fillText("w", endX + 10 * Math.cos(angle), endY + 10 * Math.sin(angle));
      }
    }

    // Plot data points & compute metrics
    let correct = 0;
    let totalLoss = 0;

    activeDataset.forEach((pt) => {
      const px = toCanvasX(pt.x1);
      const py = toCanvasY(pt.x2);
      const z = w1 * pt.x1 + w2 * pt.x2 + b;
      const yhat = 1 / (1 + Math.exp(-z));
      const pred = z >= 0 ? 1 : 0;
      const isRight = pred === pt.y;
      if (isRight) correct++;

      const eps = 1e-7;
      const pClip = Math.min(1 - eps, Math.max(eps, yhat));
      totalLoss += -(pt.y * Math.log(pClip) + (1 - pt.y) * Math.log(1 - pClip));

      // Halo if misclassified
      if (!isRight) {
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (pt.y === 1) {
        // Red triangle (Obstacle)
        ctx.fillStyle = "#B4232A";
        ctx.beginPath();
        ctx.moveTo(px, py - 8);
        ctx.lineTo(px - 7.5, py + 6);
        ctx.lineTo(px + 7.5, py + 6);
        ctx.closePath();
        ctx.fill();
      } else {
        // Hollow blue circle (Clear)
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#003C93";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (pt.label) {
        ctx.fillStyle = "#111827";
        ctx.font = "11px ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(pt.label, px + 14, py + 4);
      }
    });

    const norm = Math.hypot(w1, w2);
    const slopeStr = Math.abs(w2) > 1e-4 ? (-w1 / w2).toFixed(2) : "vertical";
    const distStr = norm > 1e-4 ? (Math.abs(b) / norm).toFixed(2) + " units" : "inf";
    const avgLoss = totalLoss / activeDataset.length;

    document.getElementById("geo-slope").textContent = slopeStr;
    document.getElementById("geo-dist").textContent = distStr;
    document.getElementById("geo-acc").textContent =
      correct + " / " + activeDataset.length + " (" + Math.round((100 * correct) / activeDataset.length) + "%)";
    document.getElementById("geo-loss").textContent = avgLoss.toFixed(3);
  }

  function stepGradientDescent(steps) {
    let w1 = parseFloat(document.getElementById("gw1").value);
    let w2 = parseFloat(document.getElementById("gw2").value);
    let b = parseFloat(document.getElementById("gb").value);
    const lr = 0.15;

    for (let s = 0; s < steps; s++) {
      let dw1 = 0, dw2 = 0, db = 0;
      const N = activeDataset.length;
      activeDataset.forEach((pt) => {
        const z = w1 * pt.x1 + w2 * pt.x2 + b;
        const yhat = 1 / (1 + Math.exp(-z));
        const dz = yhat - pt.y; // Clean BCE + Sigmoid cancellation!
        dw1 += dz * pt.x1;
        dw2 += dz * pt.x2;
        db += dz;
      });
      w1 -= lr * (dw1 / N);
      w2 -= lr * (dw2 / N);
      b -= lr * (db / N);
    }

    document.getElementById("gw1").value = Math.max(-4, Math.min(4, w1));
    document.getElementById("gw2").value = Math.max(-4, Math.min(4, w2));
    document.getElementById("gb").value = Math.max(-12, Math.min(12, b));
    renderGeometry();
  }

  ["gw1", "gw2", "gb"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderGeometry);
  });

  document.getElementById("btn-step").addEventListener("click", () => stepGradientDescent(1));
  document.getElementById("btn-train25").addEventListener("click", () => stepGradientDescent(25));
  document.getElementById("btn-scramble").addEventListener("click", () => {
    document.getElementById("gw1").value = (Math.random() * 4 - 2).toFixed(2);
    document.getElementById("gw2").value = (Math.random() * 4 - 2).toFixed(2);
    document.getElementById("gb").value = (Math.random() * 10 - 5).toFixed(1);
    renderGeometry();
  });

  document.getElementById("ds-drone").addEventListener("click", () => {
    document.getElementById("ds-drone").classList.add("active");
    document.getElementById("ds-xor").classList.remove("active");
    activeDataset = droneData;
    document.getElementById("gw1").value = 1.0;
    document.getElementById("gw2").value = 0.8;
    document.getElementById("gb").value = -6.5;
    renderGeometry();
  });

  document.getElementById("ds-xor").addEventListener("click", () => {
    document.getElementById("ds-xor").classList.add("active");
    document.getElementById("ds-drone").classList.remove("active");
    activeDataset = xorData;
    document.getElementById("gw1").value = 0.8;
    document.getElementById("gw2").value = 0.8;
    document.getElementById("gb").value = -5.0;
    renderGeometry();
  });

  // ==================== SIMULATION 3: BIT-WIDTH BUDGET ====================
  function updateBitWidth() {
    const N = parseInt(document.getElementById("hw-n").value, 10);
    const xBits = parseInt(document.getElementById("hw-xbits").value, 10);
    const wBits = parseInt(document.getElementById("hw-wbits").value, 10);

    document.getElementById("hw-n-val").textContent = N;
    document.getElementById("hw-xbits-val").textContent = xBits;
    document.getElementById("hw-wbits-val").textContent = wBits;

    const prodBits = xBits + wBits;
    const guardBits = Math.ceil(Math.log2(N));
    const accBits = prodBits + guardBits;

    const xMax = Math.pow(2, xBits) - 1;
    const wMin = -Math.pow(2, wBits - 1);
    const wMax = Math.pow(2, wBits - 1) - 1;
    const pMin = xMax * wMin;
    const pMax = xMax * wMax;

    document.getElementById("bw-prod").textContent = prodBits + " bits";
    document.getElementById("bw-prod-range").textContent =
      "[" + pMin.toLocaleString() + " .. +" + pMax.toLocaleString() + "]";
    document.getElementById("bw-guard").textContent = "+" + guardBits + " bits";
    document.getElementById("bw-guard-sub").textContent = "Sum of " + N + " products";
    document.getElementById("bw-acc").textContent = accBits + " bits";

    document.getElementById("arch-seq-cycles").textContent = N + " cycles";
    document.getElementById("arch-par-muls").textContent = N + " Multipliers";
    document.getElementById("arch-par-cost").textContent = N + "\u00d7";
  }

  ["hw-n", "hw-xbits", "hw-wbits"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateBitWidth);
  });

  // Initial render
  updateDatapath();
  renderGeometry();
  updateBitWidth();
})();
