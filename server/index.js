const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.NOTIFY_WEBHOOK_URL || "";

app.use(
  cors({
    origin: ["https://linanali0606.github.io"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.use(express.json());

app.get("/api/health", function (req, res) {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post("/api/booking", function (req, res) {
  var body = req.body || {};
  if (!body.name || !body.date) {
    return res.status(400).json({ error: "缺少 name 或 date" });
  }
  res.json({ received: true, name: body.name, date: body.date });
});

app.post("/api/message", async function (req, res) {
  var body = req.body || {};
  var name = String(body.name || "").trim();
  var content = String(body.content || "").trim();
  if (!name || !content) {
    return res.status(400).json({ error: "缺少 name 或 content" });
  }
  var payload = {
    type: "new_message",
    name: name,
    content: content,
    time: new Date().toISOString(),
  };
  // Basic notification: visible in server logs for ops monitoring.
  console.log("[notify]", JSON.stringify(payload));
  try {
    if (WEBHOOK_URL) {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    return res.json({ ok: true, notified: true });
  } catch (err) {
    console.error("[notify-error]", err && err.message ? err.message : err);
    return res.status(502).json({ error: "消息已接收，但通知下游失败" });
  }
});

app.listen(PORT, function () {
  console.log("API listening on http://127.0.0.1:" + PORT);
});
