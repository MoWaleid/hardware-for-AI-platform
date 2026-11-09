// Single source of truth for the session list on the hub.
// Set `released: true` when a session goes live. Unreleased sessions show only
// their number (no title), so the public site never spoils upcoming content.
window.HFAI_SESSIONS = [
  {
    num: 1,
    released: true,
    title: "Inside one artificial neuron",
    desc: "Weights, bias, activations, and the decision line, explored on a drone obstacle detector.",
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
        '<span class="num">' + n + '</span>' +
        '<div><a class="title" href="' + s.href + '">' + s.title + '</a>' +
        '<div class="desc">' + s.desc + '</div></div>' +
        '<span class="state">Open &rarr;</span>';
    } else {
      li.className = "locked";
      li.innerHTML =
        '<span class="num">' + n + '</span>' +
        '<div><span class="title">Unlocks after Session ' + (s.num - 1) + '</span></div>' +
        '<span class="state">&mdash;</span>';
    }
    list.appendChild(li);
  });
})();
