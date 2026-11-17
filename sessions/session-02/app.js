/* Session 02 interactive lab: a layer as a matrix, and convolution.
   Plain JavaScript, no dependencies. All convolution arithmetic is integer-only,
   exactly as the hardware does it (>> rounds down, then clamp to 0..255). */
"use strict";

const $ = (s) => document.querySelector(s);
const fmt = (v) => {
  const r = Math.round(v * 100) / 100;
  return (r < 0 ? "−" : "") + String(Math.abs(r));
};
const paren = (v) => (v < 0 ? `(${fmt(v)})` : fmt(v));

/* ======================================================================
   Simulation 01 · A Layer as a Matrix
====================================================================== */
(function layerAsMatrix() {
  const PRESETS = {
    slides: { W: [[0.5, -1, 2], [1, 0, -0.5]], x: [2, 1, 3], b: [1, -2] },
  };
  let W, x, b, sel = 0, k = 0, acc = null, done = [false, false], z = [null, null];

  const elW = $("#m-W"), elX = $("#m-x"), elB = $("#m-b"), elZ = $("#m-z"), elA = $("#m-a");

  function numInput(value, onchange) {
    const i = document.createElement("input");
    i.type = "number"; i.step = "0.5"; i.className = "num-in"; i.value = value;
    i.addEventListener("input", () => { const v = parseFloat(i.value); onchange(isNaN(v) ? 0 : v); resetRun(); });
    return i;
  }
  function outBox(id) { const d = document.createElement("div"); d.className = "num-out"; d.id = id; d.textContent = "?"; return d; }

  function load(p) {
    W = p.W.map((r) => r.slice()); x = p.x.slice(); b = p.b.slice();
    elW.innerHTML = ""; elX.innerHTML = ""; elB.innerHTML = ""; elZ.innerHTML = ""; elA.innerHTML = "";
    W.forEach((row, r) => row.forEach((v, c) => {
      const i = numInput(v, (nv) => { W[r][c] = nv; }); i.id = `m-w${r}${c}`; elW.appendChild(i);
    }));
    x.forEach((v, i) => { const n = numInput(v, (nv) => { x[i] = nv; }); n.id = `m-x${i}`; elX.appendChild(n); });
    b.forEach((v, r) => {
      const n = numInput(v, (nv) => { b[r] = nv; }); n.id = `m-b${r}`; elB.appendChild(n);
      elZ.appendChild(outBox(`m-z${r}`)); elA.appendChild(outBox(`m-a${r}`));
    });
    const rows = $("#m-rows"); rows.innerHTML = "";
    W.forEach((_, r) => {
      const bt = document.createElement("button"); bt.type = "button"; bt.textContent = `Neuron ${r + 1} (row ${r + 1})`;
      bt.addEventListener("click", () => { sel = r; startRow(); });
      rows.appendChild(bt);
    });
    resetRun();
  }

  function resetRun() { done = [false, false]; z = [null, null]; sel = 0; startRow(); }

  function startRow() { k = 0; acc = b[sel]; render(); }

  function macsDone() { return done.filter(Boolean).length * 3 + (done[sel] ? 0 : k); }

  function step() {
    if (done[sel]) { const nxt = done.indexOf(false); if (nxt < 0) return; sel = nxt; startRow(); return; }
    acc += W[sel][k] * x[k]; k++;
    if (k === 3) { done[sel] = true; z[sel] = acc; }
    render();
  }

  function render() {
    document.querySelectorAll("#m-W .num-in, #m-x .num-in, #m-b .num-in").forEach((e) => e.classList.remove("hot", "row-sel"));
    for (let c = 0; c < 3; c++) $(`#m-w${sel}${c}`).classList.add("row-sel");
    if (!done[sel] && k < 3) { $(`#m-w${sel}${k}`).classList.add("hot"); $(`#m-x${k}`).classList.add("hot"); }
    if (!done[sel] && k === 0) $(`#m-b${sel}`).classList.add("hot");
    document.querySelectorAll("#m-rows button").forEach((bt, r) => bt.classList.toggle("active", r === sel));

    // the work line: z_r = w·x + w·x + w·x + b, built term by term
    const n = done[sel] ? 3 : k;
    const terms = [];
    for (let c = 0; c < n; c++) terms.push(`<span class="${c === n - 1 && !done[sel] ? "new" : "term"}">${paren(W[sel][c])}·${paren(x[c])}</span>`);
    let line = `z<sub>${sel + 1}</sub> = ${terms.join(" + ") || "…"}`;
    if (n > 0) line += ` + ${paren(b[sel])}`;
    if (done[sel]) line += ` = <span class="new">${fmt(z[sel])}</span>`;
    $("#m-work").innerHTML = line;

    for (let r = 0; r < 2; r++) {
      const zb = $(`#m-z${r}`), ab = $(`#m-a${r}`);
      zb.textContent = z[r] === null ? "?" : fmt(z[r]); zb.classList.toggle("done", z[r] !== null);
      ab.textContent = z[r] === null ? "?" : fmt(Math.max(0, z[r])); ab.classList.toggle("done", z[r] !== null);
    }
    $("#m-sel").textContent = `Neuron ${sel + 1}`;
    $("#m-sel-sub").textContent = `row ${sel + 1} of W`;
    $("#m-acc").textContent = fmt(done[sel] ? z[sel] : acc);
    $("#m-acc-sub").textContent = done[sel] ? "row finished" : k === 0 ? "starts at the bias" : `after ${k} of 3 products`;
    $("#m-macs").textContent = `${macsDone()} / 6`;
    $("#m-out").textContent = done[sel] ? fmt(Math.max(0, z[sel])) : "—";
    $("#m-out-sub").textContent = done[sel] ? (z[sel] < 0 ? "negative → 0" : "positive passes") : " ";
    $("#m-next").disabled = done.every(Boolean);
  }

  $("#m-next").addEventListener("click", step);
  $("#m-finish").addEventListener("click", () => { if (done[sel]) return; while (!done[sel]) step(); });
  $("#m-all").addEventListener("click", () => { for (let r = 0; r < 2; r++) { sel = r; if (!done[r]) { startRow(); while (!done[r]) step(); } } render(); });
  $("#m-reset").addEventListener("click", resetRun);
  document.querySelectorAll("#m-presets button").forEach((bt) => bt.addEventListener("click", () => {
    document.querySelectorAll("#m-presets button").forEach((o) => o.classList.toggle("active", o === bt));
    if (bt.dataset.preset === "slides") load(PRESETS.slides);
    else {
      const rnd = () => Math.round((Math.random() * 6 - 3) * 2) / 2;   // −3 … 3 in steps of 0.5
      load({ W: [[rnd(), rnd(), rnd()], [rnd(), rnd(), rnd()]], x: [rnd(), rnd(), rnd()], b: [rnd(), rnd()] });
    }
  }));

  // ---- counting the MACs of a whole network ----
  const n2 = (v) => v.toLocaleString("en-US");
  function countNet() {
    const sizes = $("#m-net").value.split(/[,\s→>-]+/).map((s) => parseInt(s, 10)).filter((v) => v > 0);
    const t = $("#m-net-table");
    if (sizes.length < 2) { t.innerHTML = "<tr><td>Enter at least two layer sizes, e.g. 784, 128, 10</td></tr>"; return; }
    let rows = "<tr><th>Layer</th><th>W shape</th><th>MACs</th></tr>", total = 0;
    for (let i = 1; i < sizes.length; i++) {
      const m = sizes[i - 1] * sizes[i]; total += m;
      rows += `<tr><td>${i}: ${sizes[i - 1]} → ${sizes[i]}</td><td class="mono">${sizes[i]} × ${sizes[i - 1]}</td><td class="mono">${n2(sizes[i - 1])} × ${n2(sizes[i])} = ${n2(m)}</td></tr>`;
    }
    rows += `<tr><td><b>Total</b></td><td></td><td class="mono"><b>${n2(total)}</b> per input</td></tr>`;
    t.innerHTML = rows;
  }
  $("#m-net").addEventListener("input", () => { document.querySelectorAll(".net-btn").forEach((o) => o.classList.remove("active")); countNet(); });
  document.querySelectorAll(".net-btn").forEach((bt) => bt.addEventListener("click", () => {
    document.querySelectorAll(".net-btn").forEach((o) => o.classList.toggle("active", o === bt));
    $("#m-net").value = bt.dataset.net.split(",").join(", "); countNet();
  }));

  load(PRESETS.slides);
  countNet();
})();

/* ======================================================================
   Simulation 02 · Convolution (ported from the reviewed convolution visualizer:
   window stepping, products, running sum, editable kernel; any kernel change
   clears the stored outputs so the map never mixes kernels)
====================================================================== */
(function convolution() {
  const KERNELS = {
    sobel: { k: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], abs: true, shift: 0 },
    blur: { k: [[1, 2, 1], [2, 4, 2], [1, 2, 1]], abs: false, shift: 4 },
    sharpen: { k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], abs: false, shift: 0 },
  };
  const IMAGES = {
    // a handwritten-style 7: 0 = empty, 255 = full ink
    seven: [
      [0, 255, 255, 255, 255, 255, 255, 40],
      [0, 0, 0, 0, 90, 255, 255, 0],
      [0, 0, 0, 0, 255, 255, 60, 0],
      [0, 0, 0, 120, 255, 200, 0, 0],
      [0, 0, 0, 255, 255, 0, 0, 0],
      [0, 0, 80, 255, 210, 0, 0, 0],
      [0, 0, 255, 255, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    // the slides' hand-computed patch sits in the centre: its window gives 195 with Sobel
    patch: [
      [28, 30, 38, 66, 72],
      [29, 30, 40, 70, 76],
      [33, 35, 45, 90, 92],
      [29, 30, 50, 75, 78],
      [27, 31, 47, 72, 75],
    ],
  };

  let img = "seven", kern = "sobel", K, absOn, shift, padOn = true;
  let src, outH, outW, raw, idx = 0, timer = null;

  const post = (s) => Math.min(255, Math.max(0, (absOn ? Math.abs(s) : s) >> shift));
  const shade = (v) => { const g = 255 - v; return { bg: `rgb(${g},${g},${g})`, fg: v > 120 ? "#fff" : "#111827" }; };

  function build() {
    const im = IMAGES[img], H = im.length, W = im[0].length;
    src = padOn
      ? Array.from({ length: H + 2 }, (_, r) => Array.from({ length: W + 2 }, (_, c) =>
          r === 0 || c === 0 || r === H + 1 || c === W + 1 ? null : im[r - 1][c - 1]))
      : im.map((row) => row.slice());
    outH = src.length - 2; outW = src[0].length - 2;
    raw = Array.from({ length: outH }, () => Array(outW).fill(null));
    idx = Math.min(idx, outH * outW - 1);
    $("#c-in-title").textContent = padOn ? `Input ${H} × ${W}, padded to ${H + 2} × ${W + 2}` : `Input ${H} × ${W}, no padding`;
    $("#c-out-title").textContent = `Output ${outH} × ${outW}`;
    $("#c-pad").textContent = `Zero padding: ${padOn ? "on" : "off"}`;
    $("#c-pad").classList.toggle("active", padOn);
    drawKernel();
    render();
  }

  function setKernel(name) {
    kern = name; K = KERNELS[name].k.map((r) => r.slice());
    absOn = KERNELS[name].abs; shift = KERNELS[name].shift;
    $("#c-abs").checked = absOn; $("#c-shift").value = shift; $("#c-shift-val").textContent = shift;
    document.querySelectorAll("#c-kernels button").forEach((b) => b.classList.toggle("active", b.dataset.k === name));
    clearOut(); drawKernel(); render();
  }

  function drawKernel() {
    const el = $("#c-k"); el.innerHTML = "";
    K.forEach((row, r) => row.forEach((v, c) => {
      const i = document.createElement("input");
      i.type = "number"; i.step = "1"; i.className = "num-in kin"; i.value = v;
      i.addEventListener("input", () => {
        K[r][c] = parseInt(i.value, 10) || 0;
        document.querySelectorAll("#c-kernels button").forEach((b) => b.classList.remove("active"));
        clearOut(); render();
      });
      el.appendChild(i);
    }));
  }

  function clearOut() { if (raw) raw.forEach((row) => row.fill(null)); }

  function windowSum(r, c) {
    let s = 0;
    const lines = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const a = src[r + i][c + j] ?? 0, w = K[i][j], p = a * w;
      s += p;
      lines.push({ a, w, p, s });
    }
    return { s, lines };
  }

  function computeCurrent() { const r = Math.floor(idx / outW), c = idx % outW; raw[r][c] = windowSum(r, c).s; }

  function render() {
    const r0 = Math.floor(idx / outW), c0 = idx % outW;
    // input grid
    const inEl = $("#c-in"); inEl.innerHTML = ""; inEl.style.gridTemplateColumns = `repeat(${src[0].length}, 36px)`;
    src.forEach((row, r) => row.forEach((v, c) => {
      const d = document.createElement("div");
      d.className = "px" + (v === null ? " pad" : "");
      if (v === null) d.textContent = "0";
      else { const sh = shade(v); d.style.background = sh.bg; d.style.color = sh.fg; d.textContent = v; }
      if (r >= r0 && r < r0 + 3 && c >= c0 && c < c0 + 3) d.classList.add("win");
      inEl.appendChild(d);
    }));
    // output grid
    const outEl = $("#c-out"); outEl.innerHTML = ""; outEl.style.gridTemplateColumns = `repeat(${outW}, 36px)`;
    let filled = 0;
    raw.forEach((row, r) => row.forEach((s, c) => {
      const d = document.createElement("div");
      d.className = "px out" + (r === r0 && c === c0 ? " cur" : "");
      if (s === null) { d.classList.add("empty"); d.textContent = "?"; }
      else { filled++; const v = post(s), sh = shade(v); d.style.background = sh.bg; d.style.color = sh.fg; d.textContent = v; }
      d.title = `window (${r + 1}, ${c + 1})`;
      d.addEventListener("click", () => { stopAuto(); idx = r * outW + c; computeCurrent(); render(); });
      outEl.appendChild(d);
    }));
    // current window: products and running sum
    const { s, lines } = windowSum(r0, c0);
    $("#c-prods").innerHTML = lines.map((l, i) =>
      `${String(l.a).padStart(4)} × ${fmt(l.w).padStart(3)} = ${fmt(l.p).padStart(6)}    sum ${fmt(l.s).padStart(7)}`)
      .join("\n") + `\n\n<span class="cur">raw sum = ${fmt(s)}</span>`;
    const a1 = absOn ? Math.abs(s) : s, a2 = a1 >> shift, a3 = Math.min(255, Math.max(0, a2));
    $("#c-pipe").innerHTML =
      `<div class="stage"><small>raw sum</small>${fmt(s)}</div><span class="arrow">→</span>` +
      `<div class="stage"><small>${absOn ? "abs" : "abs off"}</small>${fmt(a1)}</div><span class="arrow">→</span>` +
      `<div class="stage"><small>&gt;&gt; ${shift}</small>${fmt(a2)}</div><span class="arrow">→</span>` +
      `<div class="stage final"><small>clamp 0…255</small>${a3}</div>`;
    $("#c-pos").textContent = `(${r0 + 1}, ${c0 + 1})`;
    $("#c-raw").textContent = fmt(s);
    $("#c-pix").textContent = a3;
    $("#c-macs").textContent = (filled * 9).toLocaleString("en-US");
    $("#c-macs-sub").textContent = `9 × ${filled} of ${outH * outW} output pixels`;
  }

  function next() { computeCurrent(); idx = (idx + 1) % (outH * outW); computeCurrent(); render(); }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; $("#c-auto").textContent = "Auto-play"; } }

  $("#c-next").addEventListener("click", () => { stopAuto(); next(); });
  $("#c-prev").addEventListener("click", () => { stopAuto(); idx = (idx - 1 + outH * outW) % (outH * outW); computeCurrent(); render(); });
  $("#c-auto").addEventListener("click", () => {
    if (timer) { stopAuto(); return; }
    $("#c-auto").textContent = "Stop";
    timer = setInterval(next, 450);
  });
  $("#c-fill").addEventListener("click", () => {
    stopAuto();
    for (let r = 0; r < outH; r++) for (let c = 0; c < outW; c++) raw[r][c] = windowSum(r, c).s;
    render();
  });
  $("#c-clear").addEventListener("click", () => { stopAuto(); clearOut(); render(); });
  $("#c-abs").addEventListener("change", (e) => { absOn = e.target.checked; render(); });
  $("#c-shift").addEventListener("input", (e) => { shift = +e.target.value; $("#c-shift-val").textContent = shift; render(); });
  $("#c-pad").addEventListener("click", () => { stopAuto(); padOn = !padOn; idx = 0; build(); });
  document.querySelectorAll("#c-kernels button").forEach((b) => b.addEventListener("click", () => { stopAuto(); setKernel(b.dataset.k); }));
  document.querySelectorAll("#c-images button[data-img]").forEach((b) => b.addEventListener("click", () => {
    stopAuto(); img = b.dataset.img; idx = 0;
    document.querySelectorAll("#c-images button[data-img]").forEach((o) => o.classList.toggle("active", o === b));
    build();
  }));

  K = KERNELS.sobel.k.map((r) => r.slice()); absOn = true; shift = 0;
  build();
  setKernel("sobel");
})();
