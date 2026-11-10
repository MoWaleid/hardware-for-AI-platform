// Session 01 Interactive Simulations — IEEE GUC Hardware for AI
// Large, eye-friendly graphs on top + large sliders below + minimalistic text
(function () {
  "use strict";

  function fmtSigned(v, digits) {
    const s = v.toFixed(digits);
    return v >= 0 ? "+" + s : s;
  }

  function applyAct(z, act) {
    if (act === "relu") return Math.max(0, z);
    if (act === "sigmoid") return 1 / (1 + Math.exp(-z));
    if (act === "step") return z >= 0 ? 1 : 0;
    return z; // linear
  }

  // ==================== SIMULATION 1: MULTI-LAYER NETWORK GRAPH & FORWARD PASS ====================
  const netState = {
    x1: 1.0,
    x2: 2.0,
    act: "relu",
    selectedNode: "h1",
    nodes: {
      h1:  { w1: 1.0,  w2: 0.5,  b: -0.5 },
      h2:  { w1: -0.5, w2: 1.0,  b: 0.2 },
      out: { w1: 1.2,  w2: 0.8,  b: -0.5 }
    }
  };

  const netPresets = {
    balanced: {
      x1: 1.0, x2: 2.0, act: "relu",
      h1:  { w1: 1.0,  w2: 0.5,  b: -0.5 },
      h2:  { w1: -0.5, w2: 1.0,  b: 0.2 },
      out: { w1: 1.2,  w2: 0.8,  b: -0.5 }
    },
    inhibit: {
      x1: 2.5, x2: 1.5, act: "relu",
      h1:  { w1: 1.2,  w2: -1.5, b: 0.0 },
      h2:  { w1: -1.0, w2: 1.8,  b: -0.2 },
      out: { w1: 1.5,  w2: -1.2, b: 0.3 }
    },
    xornet: {
      x1: 1.0, x2: 0.0, act: "relu",
      h1:  { w1: 1.0,  w2: 1.0,  b: 0.0 },
      h2:  { w1: 1.0,  w2: 1.0,  b: -1.0 },
      out: { w1: 2.0,  w2: -4.0, b: -0.5 }
    }
  };

  function syncSelectedNodeSliders() {
    const nd = netState.nodes[netState.selectedNode];
    document.getElementById("net-w1").value = nd.w1;
    document.getElementById("net-w2").value = nd.w2;
    document.getElementById("net-b").value  = nd.b;

    if (netState.selectedNode === "h1") {
      document.getElementById("lbl-net-w1").innerHTML = "w<sub>11</sub> (x<sub>1</sub>&rarr;h<sub>1</sub>)";
      document.getElementById("lbl-net-w2").innerHTML = "w<sub>12</sub> (x<sub>2</sub>&rarr;h<sub>1</sub>)";
      document.getElementById("lbl-net-b").innerHTML  = "Bias b<sub>1</sub>";
    } else if (netState.selectedNode === "h2") {
      document.getElementById("lbl-net-w1").innerHTML = "w<sub>21</sub> (x<sub>1</sub>&rarr;h<sub>2</sub>)";
      document.getElementById("lbl-net-w2").innerHTML = "w<sub>22</sub> (x<sub>2</sub>&rarr;h<sub>2</sub>)";
      document.getElementById("lbl-net-b").innerHTML  = "Bias b<sub>2</sub>";
    } else {
      document.getElementById("lbl-net-w1").innerHTML = "v<sub>1</sub> (h<sub>1</sub>&rarr;y&#770;)";
      document.getElementById("lbl-net-w2").innerHTML = "v<sub>2</sub> (h<sub>2</sub>&rarr;y&#770;)";
      document.getElementById("lbl-net-b").innerHTML  = "Bias b<sub>out</sub>";
    }
  }

  function styleEdge(id, w, highlight) {
    const el = document.getElementById(id);
    el.setAttribute("stroke", w >= 0 ? "#003C93" : "#B4232A");
    const baseWidth = Math.max(2.0, Math.min(5.2, 1.8 + Math.abs(w) * 1.1));
    el.setAttribute("stroke-width", highlight ? (baseWidth + 1.4).toFixed(1) : baseWidth.toFixed(1));
    el.setAttribute("stroke-opacity", highlight ? "1.0" : "0.55");
  }

  function updateNetworkSim() {
    netState.x1 = parseFloat(document.getElementById("net-x1").value);
    netState.x2 = parseFloat(document.getElementById("net-x2").value);
    document.getElementById("net-x1-val").textContent = netState.x1.toFixed(1);
    document.getElementById("net-x2-val").textContent = netState.x2.toFixed(1);

    const sel = netState.nodes[netState.selectedNode];
    sel.w1 = parseFloat(document.getElementById("net-w1").value);
    sel.w2 = parseFloat(document.getElementById("net-w2").value);
    sel.b  = parseFloat(document.getElementById("net-b").value);
    document.getElementById("net-w1-val").textContent = sel.w1.toFixed(1);
    document.getElementById("net-w2-val").textContent = sel.w2.toFixed(1);
    document.getElementById("net-b-val").textContent  = sel.b.toFixed(1);

    const n1 = netState.nodes.h1;
    const n2 = netState.nodes.h2;
    const no = netState.nodes.out;

    const z1 = n1.w1 * netState.x1 + n1.w2 * netState.x2 + n1.b;
    const h1 = applyAct(z1, netState.act);

    const z2 = n2.w1 * netState.x1 + n2.w2 * netState.x2 + n2.b;
    const h2 = applyAct(z2, netState.act);

    const zout = no.w1 * h1 + no.w2 * h2 + no.b;
    const yhat = 1 / (1 + Math.exp(-zout));

    document.getElementById("svg-net-x1").textContent = netState.x1.toFixed(2);
    document.getElementById("svg-net-x2").textContent = netState.x2.toFixed(2);
    document.getElementById("svg-net-h1").textContent = h1.toFixed(2);
    document.getElementById("svg-net-z1").textContent = "z1=" + fmtSigned(z1, 1);
    document.getElementById("svg-net-h2").textContent = h2.toFixed(2);
    document.getElementById("svg-net-z2").textContent = "z2=" + fmtSigned(z2, 1);
    document.getElementById("svg-net-out").textContent = yhat.toFixed(3);
    document.getElementById("svg-net-zout").textContent = "z=" + fmtSigned(zout, 2);

    document.getElementById("lbl-edge-w11").textContent = "w=" + n1.w1.toFixed(1);
    document.getElementById("lbl-edge-w12").textContent = "w=" + n1.w2.toFixed(1);
    document.getElementById("lbl-edge-w21").textContent = "w=" + n2.w1.toFixed(1);
    document.getElementById("lbl-edge-w22").textContent = "w=" + n2.w2.toFixed(1);
    document.getElementById("lbl-edge-v1").textContent  = "w=" + no.w1.toFixed(1);
    document.getElementById("lbl-edge-v2").textContent  = "w=" + no.w2.toFixed(1);

    styleEdge("edge-x1-h1", n1.w1, netState.selectedNode === "h1");
    styleEdge("edge-x2-h1", n1.w2, netState.selectedNode === "h1");
    styleEdge("edge-x1-h2", n2.w1, netState.selectedNode === "h2");
    styleEdge("edge-x2-h2", n2.w2, netState.selectedNode === "h2");
    styleEdge("edge-h1-out", no.w1, netState.selectedNode === "out");
    styleEdge("edge-h2-out", no.w2, netState.selectedNode === "out");

    document.getElementById("circle-h1").setAttribute("fill", netState.selectedNode === "h1" ? "#E8EEF8" : "#FFFFFF");
    document.getElementById("circle-h1").setAttribute("stroke-width", netState.selectedNode === "h1" ? "4.0" : "2.4");
    document.getElementById("circle-h2").setAttribute("fill", netState.selectedNode === "h2" ? "#E8EEF8" : "#FFFFFF");
    document.getElementById("circle-h2").setAttribute("stroke-width", netState.selectedNode === "h2" ? "4.0" : "2.4");
    document.getElementById("circle-out").setAttribute("stroke-width", netState.selectedNode === "out" ? "4.4" : "2.6");

    const actName = netState.act === "relu" ? "ReLU" : (netState.act === "sigmoid" ? "Sigmoid" : "Step");
    if (netState.selectedNode === "h1") {
      const p1 = n1.w1 * netState.x1;
      const p2 = n1.w2 * netState.x2;
      document.getElementById("insp-title").innerHTML = "Selected: Hidden h<sub>1</sub>";
      document.getElementById("insp-formula").innerHTML = "z<sub>1</sub> = w<sub>11</sub>x<sub>1</sub> + w<sub>12</sub>x<sub>2</sub> + b<sub>1</sub>";
      document.getElementById("insp-prods").textContent = fmtSigned(p1, 2) + ", " + fmtSigned(p2, 2);
      document.getElementById("insp-z").textContent = fmtSigned(z1, 2);
      document.getElementById("insp-bias-note").textContent = "Bias b1 = " + fmtSigned(n1.b, 1);
      document.getElementById("insp-a").textContent = h1.toFixed(3);
      document.getElementById("insp-act-note").textContent = actName + " gate";
    } else if (netState.selectedNode === "h2") {
      const p1 = n2.w1 * netState.x1;
      const p2 = n2.w2 * netState.x2;
      document.getElementById("insp-title").innerHTML = "Selected: Hidden h<sub>2</sub>";
      document.getElementById("insp-formula").innerHTML = "z<sub>2</sub> = w<sub>21</sub>x<sub>1</sub> + w<sub>22</sub>x<sub>2</sub> + b<sub>2</sub>";
      document.getElementById("insp-prods").textContent = fmtSigned(p1, 2) + ", " + fmtSigned(p2, 2);
      document.getElementById("insp-z").textContent = fmtSigned(z2, 2);
      document.getElementById("insp-bias-note").textContent = "Bias b2 = " + fmtSigned(n2.b, 1);
      document.getElementById("insp-a").textContent = h2.toFixed(3);
      document.getElementById("insp-act-note").textContent = actName + " gate";
    } else {
      const p1 = no.w1 * h1;
      const p2 = no.w2 * h2;
      document.getElementById("insp-title").innerHTML = "Selected: Output y&#770;";
      document.getElementById("insp-formula").innerHTML = "z<sub>out</sub> = v<sub>1</sub>h<sub>1</sub> + v<sub>2</sub>h<sub>2</sub> + b<sub>out</sub>";
      document.getElementById("insp-prods").textContent = fmtSigned(p1, 2) + ", " + fmtSigned(p2, 2);
      document.getElementById("insp-z").textContent = fmtSigned(zout, 2);
      document.getElementById("insp-bias-note").textContent = "Bias b_out = " + fmtSigned(no.b, 1);
      document.getElementById("insp-a").textContent = yhat.toFixed(3);
      document.getElementById("insp-act-note").textContent = "Sigmoid output";
    }
  }

  function selectNode(nodeKey) {
    netState.selectedNode = nodeKey;
    document.querySelectorAll(".node-select-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.node === nodeKey);
    });
    syncSelectedNodeSliders();
    updateNetworkSim();
  }

  document.querySelectorAll(".node-select-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectNode(btn.dataset.node));
  });
  document.getElementById("node-h1").addEventListener("click", () => selectNode("h1"));
  document.getElementById("node-h2").addEventListener("click", () => selectNode("h2"));
  document.getElementById("node-out").addEventListener("click", () => selectNode("out"));

  ["net-x1", "net-x2", "net-w1", "net-w2", "net-b"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => {
      document.querySelectorAll("#net-presets button").forEach((b) => b.classList.remove("active"));
      updateNetworkSim();
    });
  });

  document.querySelectorAll(".net-act-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".net-act-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      netState.act = btn.dataset.act;
      updateNetworkSim();
    });
  });

  document.querySelectorAll("#net-presets button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#net-presets button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const p = netPresets[btn.dataset.preset];
      document.getElementById("net-x1").value = p.x1;
      document.getElementById("net-x2").value = p.x2;
      netState.act = p.act;
      document.querySelectorAll(".net-act-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.act === p.act);
      });
      netState.nodes.h1  = Object.assign({}, p.h1);
      netState.nodes.h2  = Object.assign({}, p.h2);
      netState.nodes.out = Object.assign({}, p.out);
      syncSelectedNodeSliders();
      updateNetworkSim();
    });
  });

  // ==================== SIMULATION 2: ACTIVATION FUNCTIONS & LINEAR COLLAPSE ====================
  let currentColAct = "linear";
  const colCanvas = document.getElementById("collapse-canvas");
  const colCtx = colCanvas.getContext("2d");

  function renderCollapseSim() {
    const w1 = parseFloat(document.getElementById("col-w1").value);
    const b1 = parseFloat(document.getElementById("col-b1").value);
    const w2 = parseFloat(document.getElementById("col-w2").value);
    const b2 = parseFloat(document.getElementById("col-b2").value);

    document.getElementById("col-w1-val").textContent = w1.toFixed(1);
    document.getElementById("col-b1-val").textContent = b1.toFixed(1);
    document.getElementById("col-w2-val").textContent = w2.toFixed(1);
    document.getElementById("col-b2-val").textContent = b2.toFixed(1);

    const wEff = w2 * w1;
    const bEff = w2 * b1 + b2;

    if (currentColAct === "linear") {
      document.getElementById("col-stat-gate").textContent = "Linear f(z) = z";
      document.getElementById("col-stat-deriv").textContent = "Slope = 1";
      document.getElementById("col-stat-layers").textContent = "Collapses to 1!";
      document.getElementById("col-stat-weff").textContent = "w_eff=" + fmtSigned(wEff, 2) + ", b_eff=" + fmtSigned(bEff, 2);
      document.getElementById("col-stat-shape").textContent = "Straight Line";
      document.getElementById("col-proof-text").textContent = "y = (w2·w1)x + (w2·b1 + b2)";
      document.getElementById("col-stat-deep").textContent = "100 Layers = 1";
    } else if (currentColAct === "relu") {
      document.getElementById("col-stat-gate").textContent = "ReLU max(0, z)";
      document.getElementById("col-stat-deriv").textContent = "Slope = 1 or 0";
      document.getElementById("col-stat-layers").textContent = "True 2-Layer Net";
      document.getElementById("col-stat-weff").textContent = "Hinge at x = " + (Math.abs(w1) > 1e-3 ? (-b1 / w1).toFixed(2) : "N/A");
      document.getElementById("col-stat-shape").textContent = "Bent Hinge Curve";
      document.getElementById("col-proof-text").textContent = "Clips z1 < 0 -> bends line";
      document.getElementById("col-stat-deep").textContent = "Universal Approx.";
    } else if (currentColAct === "sigmoid") {
      document.getElementById("col-stat-gate").textContent = "Sigmoid (0 to 1)";
      document.getElementById("col-stat-deriv").textContent = "Max slope = 0.25";
      document.getElementById("col-stat-layers").textContent = "True 2-Layer Net";
      document.getElementById("col-stat-weff").textContent = "Smooth S-curve";
      document.getElementById("col-stat-shape").textContent = "Smooth S-Wave";
      document.getElementById("col-proof-text").textContent = "Squashes z1 into (0, 1)";
      document.getElementById("col-stat-deep").textContent = "Output Probabilities";
    } else {
      document.getElementById("col-stat-gate").textContent = "Step (0 or 1)";
      document.getElementById("col-stat-deriv").textContent = "Slope = 0 (No train)";
      document.getElementById("col-stat-layers").textContent = "Hard Threshold";
      document.getElementById("col-stat-weff").textContent = "Flat plateaus";
      document.getElementById("col-stat-shape").textContent = "Staircase Jump";
      document.getElementById("col-proof-text").textContent = "Jumps at z1 = 0";
      document.getElementById("col-stat-deep").textContent = "Zero Gradient";
    }

    colCtx.clearRect(0, 0, colCanvas.width, colCanvas.height);
    const padL = 68, padR = 32, padT = 48, padB = 50;
    const plotW = colCanvas.width - padL - padR;
    const plotH = colCanvas.height - padT - padB;

    const toX = (x) => padL + ((x + 4) / 8) * plotW;
    const toY = (y) => padT + ((6 - y) / 12) * plotH;

    // Grid
    colCtx.strokeStyle = "#E2E8F0";
    colCtx.lineWidth = 1.2;
    for (let x = -4; x <= 4; x += 1) {
      const px = toX(x);
      colCtx.beginPath(); colCtx.moveTo(px, padT); colCtx.lineTo(px, padT + plotH); colCtx.stroke();
      colCtx.fillStyle = "#475569";
      colCtx.font = "600 13px ui-monospace, monospace";
      colCtx.textAlign = "center";
      colCtx.fillText(x.toString(), px, padT + plotH + 22);
    }
    for (let y = -6; y <= 6; y += 2) {
      const py = toY(y);
      colCtx.beginPath(); colCtx.moveTo(padL, py); colCtx.lineTo(padL + plotW, py); colCtx.stroke();
      colCtx.fillStyle = "#475569";
      colCtx.font = "600 13px ui-monospace, monospace";
      colCtx.textAlign = "right";
      colCtx.fillText(y.toString(), padL - 10, py + 5);
    }

    // Zero axes
    colCtx.strokeStyle = "#94A3B8";
    colCtx.lineWidth = 1.8;
    colCtx.beginPath(); colCtx.moveTo(toX(0), padT); colCtx.lineTo(toX(0), padT + plotH); colCtx.stroke();
    colCtx.beginPath(); colCtx.moveTo(padL, toY(0)); colCtx.lineTo(padL + plotW, toY(0)); colCtx.stroke();

    colCtx.save();
    colCtx.beginPath();
    colCtx.rect(padL, padT, plotW, plotH);
    colCtx.clip();

    // Dashed collapsed reference line
    colCtx.strokeStyle = "#94A3B8";
    colCtx.lineWidth = 2.6;
    colCtx.setLineDash([8, 6]);
    colCtx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = -4 + (8 * i) / 200;
      const yLin = wEff * x + bEff;
      const px = toX(x), py = toY(yLin);
      if (i === 0) colCtx.moveTo(px, py); else colCtx.lineTo(px, py);
    }
    colCtx.stroke();
    colCtx.setLineDash([]);

    // Solid primary curve
    colCtx.strokeStyle = currentColAct === "linear" ? "#B4232A" : "#003C93";
    colCtx.lineWidth = 4.2;
    colCtx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const x = -4 + (8 * i) / 300;
      const z1 = w1 * x + b1;
      const a1 = applyAct(z1, currentColAct);
      const y = w2 * a1 + b2;
      const px = toX(x), py = toY(y);
      if (i === 0) colCtx.moveTo(px, py); else colCtx.lineTo(px, py);
    }
    colCtx.stroke();
    colCtx.restore();

    colCtx.strokeStyle = "#111827";
    colCtx.lineWidth = 1.8;
    colCtx.strokeRect(padL, padT, plotW, plotH);

    colCtx.fillStyle = "#111827";
    colCtx.font = "700 15px Inter, sans-serif";
    colCtx.textAlign = "left";
    colCtx.fillText(
      currentColAct === "linear"
        ? "Red Line: 2-Layer Linear Net Collapses to 1 Line (y = " + fmtSigned(wEff, 2) + "x " + fmtSigned(bEff, 2) + ")"
        : "Blue Curve: 2-Layer Net with " + currentColAct.toUpperCase() + "   |   Dashed Gray: Collapsed Linear Line",
      padL,
      28
    );

    colCtx.font = "600 13px Inter, sans-serif";
    colCtx.textAlign = "center";
    colCtx.fillText("Input x", padL + plotW / 2, colCanvas.height - 8);
  }

  document.querySelectorAll(".col-act-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".col-act-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentColAct = btn.dataset.colact;
      renderCollapseSim();
    });
  });

  ["col-w1", "col-b1", "col-w2", "col-b2"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderCollapseSim);
  });

  // ==================== SIMULATION 3: 2D DECISION BOUNDARY & XOR ====================
  const linearData = [
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

  let activeDataset = linearData;
  let activeDatasetName = "linear";
  let archMode = "single";
  const canvas = document.getElementById("geo-canvas");
  const ctx = canvas.getContext("2d");

  const gPadL = 70, gPadR = 36, gPadT = 36, gPadB = 54;
  const gPlotW = canvas.width - gPadL - gPadR;
  const gPlotH = canvas.height - gPadT - gPadB;

  function toCanvasX(x1) {
    return gPadL + (x1 / 10) * gPlotW;
  }
  function toCanvasY(x2) {
    return gPadT + gPlotH - (x2 / 10) * gPlotH;
  }

  function evalMlpXor(x1, x2) {
    const z1 = x1 + x2 - 5.5;
    const z2 = x1 + x2 - 14.5;
    return { pred: z1 >= 0 && z2 <= 0 ? 1 : 0 };
  }

  function drawLineAcrossBox(c, toXFn, toYFn, w1, w2, b, color, dashed) {
    const pts = [];
    if (Math.abs(w2) > 1e-4) {
      const x2_0 = (-b - w1 * 0) / w2;
      const x2_10 = (-b - w1 * 10) / w2;
      if (x2_0 >= 0 && x2_0 <= 10) pts.push({ x1: 0, x2: x2_0 });
      if (x2_10 >= 0 && x2_10 <= 10) pts.push({ x1: 10, x2: x2_10 });
    }
    if (Math.abs(w1) > 1e-4) {
      const x1_0 = (-b - w2 * 0) / w1;
      const x1_10 = (-b - w2 * 10) / w1;
      if (x1_0 > 0 && x1_0 < 10) pts.push({ x1: x1_0, x2: 0 });
      if (x1_10 > 0 && x1_10 < 10) pts.push({ x1: x1_10, x2: 10 });
    }
    if (pts.length >= 2) {
      c.save();
      c.strokeStyle = color;
      c.lineWidth = 3.4;
      if (dashed) c.setLineDash([7, 5]);
      c.beginPath();
      c.moveTo(toXFn(pts[0].x1), toYFn(pts[0].x2));
      c.lineTo(toXFn(pts[1].x1), toYFn(pts[1].x2));
      c.stroke();
      c.restore();
    }
    return pts;
  }

  function renderGeometry() {
    const w1 = parseFloat(document.getElementById("gw1").value);
    const w2 = parseFloat(document.getElementById("gw2").value);
    const b  = parseFloat(document.getElementById("gb").value);

    document.getElementById("gw1-val").textContent = w1.toFixed(2);
    document.getElementById("gw2-val").textContent = w2.toFixed(2);
    document.getElementById("gb-val").textContent  = b.toFixed(2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Shade regions
    const step = 10;
    for (let px = gPadL; px < gPadL + gPlotW; px += step) {
      for (let py = gPadT; py < gPadT + gPlotH; py += step) {
        const x1 = ((px - gPadL) / gPlotW) * 10;
        const x2 = ((gPadT + gPlotH - py) / gPlotH) * 10;
        const isPos = archMode === "mlp"
          ? evalMlpXor(x1, x2).pred === 1
          : (w1 * x1 + w2 * x2 + b) >= 0;
        ctx.fillStyle = isPos ? "rgba(180, 35, 42, 0.09)" : "rgba(0, 60, 147, 0.06)";
        ctx.fillRect(px, py, step, step);
      }
    }

    // Grid lines
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1.2;
    for (let i = 0; i <= 10; i += 2) {
      const gx = toCanvasX(i);
      const gy = toCanvasY(i);
      ctx.beginPath(); ctx.moveTo(gx, gPadT); ctx.lineTo(gx, gPadT + gPlotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gPadL, gy); ctx.lineTo(gPadL + gPlotW, gy); ctx.stroke();

      ctx.fillStyle = "#475569";
      ctx.font = "600 13px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(i.toString(), gx, gPadT + gPlotH + 22);
      ctx.textAlign = "right";
      ctx.fillText(i.toString(), gPadL - 10, gy + 5);
    }

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(gPadL, gPadT, gPlotW, gPlotH);

    ctx.fillStyle = "#111827";
    ctx.font = "700 14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Input x1", gPadL + gPlotW / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(22, gPadT + gPlotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Input x2", 0, 0);
    ctx.restore();

    if (archMode === "mlp") {
      drawLineAcrossBox(ctx, toCanvasX, toCanvasY, 1, 1, -5.5, "#003C93", false);
      drawLineAcrossBox(ctx, toCanvasX, toCanvasY, 1, 1, -14.5, "#B4232A", false);
      ctx.fillStyle = "#003C93";
      ctx.font = "700 13px ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText("Hidden h1 line (x1 + x2 = 5.5)", toCanvasX(0.4), toCanvasY(4.7));
      ctx.fillStyle = "#B4232A";
      ctx.fillText("Hidden h2 line (x1 + x2 = 14.5)", toCanvasX(4.8), toCanvasY(9.3));
    } else {
      const pts = drawLineAcrossBox(ctx, toCanvasX, toCanvasY, w1, w2, b, "#111827", false);
      if (pts.length >= 2) {
        const midX1 = 0.5 * (pts[0].x1 + pts[1].x1);
        const midX2 = 0.5 * (pts[0].x2 + pts[1].x2);
        const norm = Math.hypot(w1, w2);
        if (norm > 1e-3) {
          const startX = toCanvasX(midX1);
          const startY = toCanvasY(midX2);
          const endX = toCanvasX(midX1 + (w1 / norm) * 1.3);
          const endY = toCanvasY(midX2 + (w2 / norm) * 1.3);

          ctx.strokeStyle = "#003C93";
          ctx.fillStyle = "#003C93";
          ctx.lineWidth = 3.0;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          const angle = Math.atan2(endY - startY, endX - startX);
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX - 11 * Math.cos(angle - 0.35), endY - 11 * Math.sin(angle - 0.35));
          ctx.lineTo(endX - 11 * Math.cos(angle + 0.35), endY - 11 * Math.sin(angle + 0.35));
          ctx.closePath();
          ctx.fill();

          ctx.font = "700 14px ui-monospace, monospace";
          ctx.fillText("w", endX + 14 * Math.cos(angle), endY + 14 * Math.sin(angle));
        }
      }
    }

    let correct = 0;
    activeDataset.forEach((pt) => {
      const px = toCanvasX(pt.x1);
      const py = toCanvasY(pt.x2);
      const pred = archMode === "mlp"
        ? evalMlpXor(pt.x1, pt.x2).pred
        : ((w1 * pt.x1 + w2 * pt.x2 + b) >= 0 ? 1 : 0);
      const isRight = pred === pt.y;
      if (isRight) correct++;

      if (!isRight) {
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(px, py, 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (pt.y === 1) {
        ctx.fillStyle = "#B4232A";
        ctx.beginPath();
        ctx.moveTo(px, py - 10);
        ctx.lineTo(px - 9.5, py + 8);
        ctx.lineTo(px + 9.5, py + 8);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#003C93";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(px, py, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (pt.label) {
        ctx.fillStyle = "#111827";
        ctx.font = "700 14px ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(pt.label, px + 18, py + 5);
      }
    });

    const norm = Math.hypot(w1, w2);
    if (archMode === "mlp") {
      document.getElementById("geo-slope").textContent = "2 Parallel Lines";
      document.getElementById("geo-dist").textContent  = "Band between h1 & h2";
      document.getElementById("geo-note").textContent  = "2 Hidden Neurons Solve XOR!";
    } else {
      const slopeStr = Math.abs(w2) > 1e-4 ? "1 Line (slope " + (-w1 / w2).toFixed(2) + ")" : "1 Vertical Line";
      const distStr = norm > 1e-4 ? (Math.abs(b) / norm).toFixed(2) + " units" : "inf";
      document.getElementById("geo-slope").textContent = slopeStr;
      document.getElementById("geo-dist").textContent  = distStr;
      document.getElementById("geo-note").textContent  =
        activeDatasetName === "xor"
          ? "Max 75% (3/4) on XOR"
          : "Separates Class 0 & 1";
    }
    document.getElementById("geo-acc").textContent =
      correct + " / " + activeDataset.length + " (" + Math.round((100 * correct) / activeDataset.length) + "%)";
  }

  ["gw1", "gw2", "gb"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => {
      if (archMode !== "single") {
        archMode = "single";
        document.getElementById("arch-single").classList.add("active");
        document.getElementById("arch-mlp").classList.remove("active");
      }
      renderGeometry();
    });
  });

  document.getElementById("arch-single").addEventListener("click", () => {
    archMode = "single";
    document.getElementById("arch-single").classList.add("active");
    document.getElementById("arch-mlp").classList.remove("active");
    document.getElementById("single-line-controls").style.opacity = "1";
    renderGeometry();
  });

  document.getElementById("arch-mlp").addEventListener("click", () => {
    archMode = "mlp";
    document.getElementById("arch-mlp").classList.add("active");
    document.getElementById("arch-single").classList.remove("active");
    document.getElementById("single-line-controls").style.opacity = "0.5";
    renderGeometry();
  });

  document.getElementById("ds-linear").addEventListener("click", () => {
    activeDataset = linearData;
    activeDatasetName = "linear";
    archMode = "single";
    document.getElementById("ds-linear").classList.add("active");
    document.getElementById("ds-xor").classList.remove("active");
    document.getElementById("arch-single").classList.add("active");
    document.getElementById("arch-mlp").classList.remove("active");
    document.getElementById("single-line-controls").style.opacity = "1";
    document.getElementById("gw1").value = 1.0;
    document.getElementById("gw2").value = 0.8;
    document.getElementById("gb").value = -6.5;
    renderGeometry();
  });

  document.getElementById("ds-xor").addEventListener("click", () => {
    activeDataset = xorData;
    activeDatasetName = "xor";
    archMode = "single";
    document.getElementById("ds-xor").classList.add("active");
    document.getElementById("ds-linear").classList.remove("active");
    document.getElementById("arch-single").classList.add("active");
    document.getElementById("arch-mlp").classList.remove("active");
    document.getElementById("single-line-controls").style.opacity = "1";
    document.getElementById("gw1").value = 0.8;
    document.getElementById("gw2").value = 0.8;
    document.getElementById("gb").value = -5.0;
    renderGeometry();
  });

  // ==================== SIMULATION 4: HOW AI LEARNS (LIVE BOUNDARY + COST CURVE) ====================
  const trainState = {
    w1: 0.50,
    w2: 0.10,
    b:  0.00,
    epoch: 0,
    lossType: "bce",
    history: []
  };

  const learnCanvas = document.getElementById("learn-canvas");
  const learnCtx = learnCanvas.getContext("2d");

  function computeDatasetCost(w1, w2, b, lossType) {
    const eps = 1e-7;
    let totalCost = 0;
    let right = 0;
    linearData.forEach((pt) => {
      const z = w1 * pt.x1 + w2 * pt.x2 + b;
      const yh = 1 / (1 + Math.exp(-z));
      const pc = Math.min(1 - eps, Math.max(eps, yh));
      if ((z >= 0 ? 1 : 0) === pt.y) right++;
      if (lossType === "bce") {
        totalCost += -(pt.y * Math.log(pc) + (1 - pt.y) * Math.log(1 - pc));
      } else {
        totalCost += 0.5 * Math.pow(yh - pt.y, 2);
      }
    });
    return { cost: totalCost / linearData.length, right: right };
  }

  function renderLearningCanvas() {
    learnCtx.clearRect(0, 0, learnCanvas.width, learnCanvas.height);

    // Left Plot: Live Training Boundary (x: 60..450, y: 46..370)
    const bL = 60, bT = 46, bW = 390, bH = 324;
    const toBX = (x1) => bL + (x1 / 10) * bW;
    const toBY = (x2) => bT + bH - (x2 / 10) * bH;

    // Shade half-planes
    const step = 10;
    for (let px = bL; px < bL + bW; px += step) {
      for (let py = bT; py < bT + bH; py += step) {
        const x1 = ((px - bL) / bW) * 10;
        const x2 = ((bT + bH - py) / bH) * 10;
        const isPos = (trainState.w1 * x1 + trainState.w2 * x2 + trainState.b) >= 0;
        learnCtx.fillStyle = isPos ? "rgba(180, 35, 42, 0.08)" : "rgba(0, 60, 147, 0.06)";
        learnCtx.fillRect(px, py, step, step);
      }
    }

    // Left grid
    learnCtx.strokeStyle = "#E2E8F0";
    learnCtx.lineWidth = 1;
    for (let i = 0; i <= 10; i += 2) {
      const gx = toBX(i), gy = toBY(i);
      learnCtx.beginPath(); learnCtx.moveTo(gx, bT); learnCtx.lineTo(gx, bT + bH); learnCtx.stroke();
      learnCtx.beginPath(); learnCtx.moveTo(bL, gy); learnCtx.lineTo(bL + bW, gy); learnCtx.stroke();
      learnCtx.fillStyle = "#475569";
      learnCtx.font = "600 12px ui-monospace, monospace";
      learnCtx.textAlign = "center";
      learnCtx.fillText(i.toString(), gx, bT + bH + 20);
      learnCtx.textAlign = "right";
      learnCtx.fillText(i.toString(), bL - 8, gy + 4);
    }

    learnCtx.save();
    learnCtx.beginPath();
    learnCtx.rect(bL, bT, bW, bH);
    learnCtx.clip();
    drawLineAcrossBox(learnCtx, toBX, toBY, trainState.w1, trainState.w2, trainState.b, "#111827", false);
    learnCtx.restore();

    linearData.forEach((pt) => {
      const px = toBX(pt.x1), py = toBY(pt.x2);
      const pred = (trainState.w1 * pt.x1 + trainState.w2 * pt.x2 + trainState.b) >= 0 ? 1 : 0;
      if (pred !== pt.y) {
        learnCtx.strokeStyle = "#F59E0B";
        learnCtx.lineWidth = 2.8;
        learnCtx.beginPath(); learnCtx.arc(px, py, 13, 0, Math.PI * 2); learnCtx.stroke();
      }
      if (pt.y === 1) {
        learnCtx.fillStyle = "#B4232A";
        learnCtx.beginPath();
        learnCtx.moveTo(px, py - 8); learnCtx.lineTo(px - 8, py + 7); learnCtx.lineTo(px + 8, py + 7);
        learnCtx.closePath(); learnCtx.fill();
      } else {
        learnCtx.fillStyle = "#FFFFFF";
        learnCtx.strokeStyle = "#003C93";
        learnCtx.lineWidth = 2.8;
        learnCtx.beginPath(); learnCtx.arc(px, py, 7.5, 0, Math.PI * 2); learnCtx.fill(); learnCtx.stroke();
      }
    });

    learnCtx.strokeStyle = "#111827";
    learnCtx.lineWidth = 1.6;
    learnCtx.strokeRect(bL, bT, bW, bH);

    learnCtx.fillStyle = "#111827";
    learnCtx.font = "700 14px Inter, sans-serif";
    learnCtx.textAlign = "left";
    learnCtx.fillText("Live Decision Boundary (Epoch " + trainState.epoch + ")", bL, 28);

    // Right Plot: Cost J History (x: 530..930, y: 46..370)
    const cL = 530, cT = 46, cW = 400, cH = 324;
    const maxC = trainState.lossType === "bce" ? 2.0 : 0.5;

    learnCtx.strokeStyle = "#E2E8F0";
    learnCtx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const val = (maxC * (4 - i)) / 4;
      const py = cT + (i / 4) * cH;
      learnCtx.beginPath(); learnCtx.moveTo(cL, py); learnCtx.lineTo(cL + cW, py); learnCtx.stroke();
      learnCtx.fillStyle = "#475569";
      learnCtx.font = "600 12px ui-monospace, monospace";
      learnCtx.textAlign = "right";
      learnCtx.fillText(val.toFixed(2), cL - 8, py + 4);
    }

    learnCtx.strokeStyle = "#111827";
    learnCtx.lineWidth = 1.6;
    learnCtx.strokeRect(cL, cT, cW, cH);

    learnCtx.fillStyle = "#111827";
    learnCtx.font = "700 14px Inter, sans-serif";
    learnCtx.textAlign = "left";
    learnCtx.fillText("Cost Curve J (" + trainState.lossType.toUpperCase() + ")", cL, 28);
    learnCtx.font = "600 12.5px Inter, sans-serif";
    learnCtx.textAlign = "center";
    learnCtx.fillText("Training Steps (Epochs)", cL + cW / 2, bT + bH + 22);

    if (trainState.history.length > 0) {
      const maxSteps = Math.max(25, trainState.history.length - 1);
      learnCtx.save();
      learnCtx.beginPath();
      learnCtx.rect(cL, cT, cW, cH);
      learnCtx.clip();

      learnCtx.strokeStyle = "#003C93";
      learnCtx.lineWidth = 3.5;
      learnCtx.beginPath();
      trainState.history.forEach((cVal, idx) => {
        const px = cL + (idx / maxSteps) * cW;
        const py = cT + (1 - Math.min(maxC, cVal) / maxC) * cH;
        if (idx === 0) learnCtx.moveTo(px, py); else learnCtx.lineTo(px, py);
      });
      learnCtx.stroke();

      // End dot
      const lastIdx = trainState.history.length - 1;
      const lastVal = trainState.history[lastIdx];
      const lx = cL + (lastIdx / maxSteps) * cW;
      const ly = cT + (1 - Math.min(maxC, lastVal) / maxC) * cH;
      learnCtx.fillStyle = "#B4232A";
      learnCtx.beginPath();
      learnCtx.arc(lx, ly, 6, 0, Math.PI * 2);
      learnCtx.fill();
      learnCtx.restore();
    }
  }

  function updateLearningReadout() {
    const lr = parseFloat(document.getElementById("learn-lr").value);
    document.getElementById("learn-lr-val").textContent = lr.toFixed(2);

    // Sample point trace: x = [4.0, 2.0], y = 0
    const sx1 = 4.0, sx2 = 2.0, sy = 0;
    const sz = trainState.w1 * sx1 + trainState.w2 * sx2 + trainState.b;
    const syhat = 1 / (1 + Math.exp(-sz));
    const eps = 1e-7;
    const pClip = Math.min(1 - eps, Math.max(eps, syhat));

    let sLoss = 0;
    let sDelta = 0;
    if (trainState.lossType === "bce") {
      sLoss = -(sy * Math.log(pClip) + (1 - sy) * Math.log(1 - pClip));
      sDelta = syhat - sy;
    } else {
      sLoss = 0.5 * Math.pow(syhat - sy, 2);
      sDelta = (syhat - sy) * syhat * (1 - syhat);
    }

    const dw1 = sDelta * sx1;
    const dw2 = sDelta * sx2;

    const metrics = computeDatasetCost(trainState.w1, trainState.w2, trainState.b, trainState.lossType);
    if (trainState.history.length === 0) {
      trainState.history.push(metrics.cost);
    }

    document.getElementById("tr-epoch").textContent = "Epoch " + trainState.epoch;
    document.getElementById("tr-weights").textContent =
      "w=[" + fmtSigned(trainState.w1, 2) + ", " + fmtSigned(trainState.w2, 2) + "], b=" + fmtSigned(trainState.b, 2);
    document.getElementById("tr-cost").textContent = metrics.cost.toFixed(3);
    document.getElementById("tr-loss").textContent = "Sample L = " + sLoss.toFixed(3);
    document.getElementById("tr-acc").textContent = Math.round((100 * metrics.right) / linearData.length) + "%";
    document.getElementById("tr-acc-sub").textContent = metrics.right + " / " + linearData.length + " points right";
    document.getElementById("tr-delta").textContent = fmtSigned(sDelta, 3);
    document.getElementById("tr-grads").textContent =
      "dw1=" + fmtSigned(dw1, 2) + ", dw2=" + fmtSigned(dw2, 2);

    renderLearningCanvas();
  }

  function runBackpropEpochs(steps) {
    const lr = parseFloat(document.getElementById("learn-lr").value);
    const N = linearData.length;

    for (let s = 0; s < steps; s++) {
      let gw1 = 0, gw2 = 0, gb = 0;
      linearData.forEach((pt) => {
        const z = trainState.w1 * pt.x1 + trainState.w2 * pt.x2 + trainState.b;
        const yh = 1 / (1 + Math.exp(-z));
        const delta = trainState.lossType === "bce"
          ? (yh - pt.y)
          : (yh - pt.y) * yh * (1 - yh);
        gw1 += delta * pt.x1;
        gw2 += delta * pt.x2;
        gb  += delta;
      });
      trainState.w1 -= lr * (gw1 / N);
      trainState.w2 -= lr * (gw2 / N);
      trainState.b  -= lr * (gb / N);
      trainState.epoch += 1;
      trainState.history.push(computeDatasetCost(trainState.w1, trainState.w2, trainState.b, trainState.lossType).cost);
    }

    if (activeDatasetName === "linear" && archMode === "single") {
      document.getElementById("gw1").value = Math.max(-4, Math.min(4, trainState.w1));
      document.getElementById("gw2").value = Math.max(-4, Math.min(4, trainState.w2));
      document.getElementById("gb").value  = Math.max(-12, Math.min(12, trainState.b));
      renderGeometry();
    }

    updateLearningReadout();
  }

  function resetTrainingState() {
    trainState.w1 = 0.50;
    trainState.w2 = 0.10;
    trainState.b  = 0.00;
    trainState.epoch = 0;
    trainState.history = [];
    updateLearningReadout();
  }

  document.getElementById("btn-step1").addEventListener("click", () => runBackpropEpochs(1));
  document.getElementById("btn-step25").addEventListener("click", () => runBackpropEpochs(25));
  document.getElementById("btn-reset-bad").addEventListener("click", resetTrainingState);

  document.getElementById("learn-lr").addEventListener("input", updateLearningReadout);

  document.querySelectorAll(".loss-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".loss-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      trainState.lossType = btn.dataset.loss;
      resetTrainingState();
    });
  });

  // Initial render
  syncSelectedNodeSliders();
  updateNetworkSim();
  renderCollapseSim();
  renderGeometry();
  resetTrainingState();
})();
