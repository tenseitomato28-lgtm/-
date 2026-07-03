/* theme.js — ダーク/ライト切り替え（全ページ共通） */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById("toggle");
  if (!btn) return;
  var stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);
  if (stored === "dark") btn.textContent = "☀";
  btn.addEventListener("click", function () {
    var current = root.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    btn.textContent = next === "dark" ? "☀" : "☽";
  });
})();
