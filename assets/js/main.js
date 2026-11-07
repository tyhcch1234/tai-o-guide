/* 大澳 Tai O — 互動腳本 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. 導覽列：滾動變色 + 閱讀進度 */
  var nav = document.getElementById("nav");
  var bar = document.getElementById("progress");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("is-stuck", y > 80);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 2. 進場動畫 */
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduce) {
    items.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // 同一組元素依次出現
        var sibs = Array.prototype.slice.call(el.parentNode.children);
        var idx = sibs.filter(function (n) { return n.classList.contains("reveal"); }).indexOf(el);
        el.style.transitionDelay = Math.min(idx, 5) * 80 + "ms";
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* 3. 圖片載入失敗時優雅降級 */
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.background = "linear-gradient(135deg,#e2d4bd,#8fbfb8)";
      img.style.minHeight = "180px";
      img.removeAttribute("src");
    });
  });

  /* 4. 平順滾動（避開固定導覽列） */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      var off = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: id === "#top" ? 0 : off, behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* 5. 年份 */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* 6. 圖片來源清單 */
  var list = document.getElementById("credit-list");
  if (!list) return;

  fetch("assets/img/credits.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      list.innerHTML = "";
      Object.keys(data).forEach(function (k) {
        var m = data[k];
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = m.page;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = m.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, "");
        li.appendChild(a);
        li.appendChild(
          document.createTextNode(" — " + (m.artist || "未署名") + "，" + (m.license || "見來源頁"))
        );
        list.appendChild(li);
      });
      var note = document.createElement("li");
      note.textContent = "全部照片來自 Wikimedia Commons，依上述授權使用；如需轉載請保留署名與授權條款。";
      list.appendChild(note);
    })
    .catch(function () { /* 保持預設文字 */ });
})();
