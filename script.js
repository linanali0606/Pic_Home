(function () {
  var API_BASE = "https://api.nanazitravelmap.com";

  function postMessage(name, content) {
    return fetch(API_BASE + "/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, content: content }),
    }).then(function (r) {
      return r.text().then(function (text) {
        var data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (err) {
          data = {};
        }
        return { ok: r.ok, status: r.status, data: data };
      });
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelectorAll(".nav a");

  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var pills = document.querySelectorAll(".cat-pill");
  var cards = document.querySelectorAll(".gallery-card");
  var galleryEmpty = document.getElementById("gallery-empty");

  function updateGallery(filter) {
    var visibleCount = 0;
    cards.forEach(function (card) {
      var cat = card.getAttribute("data-category") || "";
      if (filter === "all" || cat === filter) {
        card.classList.remove("is-hidden");
        visibleCount += 1;
      } else {
        card.classList.add("is-hidden");
      }
    });
    if (galleryEmpty) {
      if (visibleCount === 0) {
        galleryEmpty.classList.remove("is-hidden");
      } else {
        galleryEmpty.classList.add("is-hidden");
      }
    }
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) {
        p.classList.remove("is-active");
      });
      pill.classList.add("is-active");
      var filter = pill.getAttribute("data-filter") || "all";
      updateGallery(filter);
    });
  });
  updateGallery("all");

  var messageForm = document.getElementById("message-form");
  var messageStatus = document.getElementById("message-status");
  if (messageForm && messageStatus) {
    messageForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = document.getElementById("message-name");
      var contentInput = document.getElementById("message-content");
      var name = nameInput && nameInput.value.trim();
      var content = contentInput && contentInput.value.trim();
      messageStatus.textContent = "";
      if (!name || !content) {
        messageStatus.textContent = "请填写称呼和留言内容。";
        return;
      }
      messageStatus.textContent = "发送中…";
      postMessage(name, content)
        .then(function (res) {
          if (res.ok) {
            messageStatus.textContent = "留言发送成功，感谢你的分享。";
            messageForm.reset();
          } else {
            messageStatus.textContent =
              (res.data && res.data.error) || "提交失败（" + res.status + "）。";
          }
        })
        .catch(function () {
          messageStatus.textContent =
            "无法连接服务器，请确认后端已启动、HTTPS 与 CORS 已配置。";
        });
    });
  }
})();
