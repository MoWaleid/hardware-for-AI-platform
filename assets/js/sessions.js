// Single source of truth for the session list on the hub.
// Set `released: true` when a session goes live. Unreleased sessions show only
// their number (no title), so the public site never spoils upcoming content.
window.HFAI_SESSIONS = [
  {
    num: 1,
    released: true,
    title: "How a neural network computes and learns",
    desc: "Network graphs, the forward pass, activations, the XOR limit, and how backpropagation trains weights.",
    href: "sessions/session-01/"
  },
  { num: 2, released: false },
  { num: 3, released: false },
  { num: 4, released: false },
  { num: 5, released: false },
  { num: 6, released: false },
  { num: 7, released: false },
  { num: 8, released: false },
  { num: 9, released: false },
  { num: 10, released: false }
];

(function renderSessions() {
  var list = document.getElementById("session-list");
  if (!list) return;
  window.HFAI_SESSIONS.forEach(function (s) {
    var li = document.createElement("li");
    var n = String(s.num).padStart(2, "0");
    if (s.released) {
      li.className = "live";
      li.innerHTML =
        '<a class="row" href="' + s.href + '">' +
        '<span class="num">' + n + '</span>' +
        '<div><span class="title">' + s.title + '</span>' +
        '<div class="desc">' + s.desc + '</div></div>' +
        '<span class="state">Open &rarr;</span>' +
        '</a>';
    } else {
      li.className = "locked";
      li.innerHTML =
        '<div class="row">' +
        '<span class="num">' + n + '</span>' +
        '<div><span class="title">Unlocks after Session ' + s.num + '</span></div>' +
        '<span class="state">&mdash;</span>' +
        '</div>';
    }
    list.appendChild(li);
  });
})();

// Smooth in-page navigation for anchor links with gentle section highlight
(function initSmoothNav() {
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var targetId = link.getAttribute("href").slice(1);
    if (!targetId) return;
    var targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    e.preventDefault();
    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#" + targetId);
    targetEl.classList.remove("section-flash");
    void targetEl.offsetWidth;
    targetEl.classList.add("section-flash");
  });
})();
