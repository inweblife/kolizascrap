// Vercel функция: приема формата от /contact и изпраща имейл през Resend.
// Нужни env променливи във Vercel: RESEND_API_KEY
// По избор: CONTACT_TO (по подразбиране admin@ecometal.bg), CONTACT_FROM.
"use strict";

const TO = process.env.CONTACT_TO || "admin@ecometal.bg";
const FROM = process.env.CONTACT_FROM || "Коли за скрап <noreply@kolizascrap.net>";

const FIELDS = {
  name: { label: "Име", max: 100 },
  phone: { label: "Телефон", max: 40 },
  car: { label: "Марка и модел", max: 120 },
  year: { label: "Година", max: 10 },
  location: { label: "Местоположение", max: 160 },
  message: { label: "Съобщение", max: 3000 },
};

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const raw = typeof req.body === "string" ? req.body : await new Promise((resolve, reject) => {
    let d = "";
    req.on("data", (c) => { d += c; if (d.length > 20000) req.destroy(); });
    req.on("end", () => resolve(d));
    req.on("error", reject);
  });
  const type = String(req.headers["content-type"] || "");
  if (type.includes("application/json")) { try { return JSON.parse(raw || "{}"); } catch { return {}; } }
  return Object.fromEntries(new URLSearchParams(raw));
}

module.exports = async (req, res) => {
  const wantsJson = String(req.headers.accept || "").includes("application/json");
  const reply = (status, ok, error) => {
    if (wantsJson) {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.end(JSON.stringify(ok ? { ok: true } : { ok: false, error }));
    }
    res.statusCode = 303;
    res.setHeader("Location", ok ? "/contact?sent=1#forma" : "/contact?error=1#forma");
    return res.end();
  };

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(405, false, "Методът не е разрешен.");
  }

  const body = await readBody(req);

  // Капан за ботове: скритото поле трябва да е празно.
  if (body.website) return reply(200, true);

  const data = {};
  for (const [key, { max }] of Object.entries(FIELDS)) {
    data[key] = String(body[key] || "").trim().slice(0, max);
  }

  if (!data.name || !data.phone) return reply(400, false, "Моля, попълнете име и телефон.");
  if (!/^[+\d][\d\s\-()/]{5,}$/.test(data.phone)) return reply(400, false, "Моля, въведете валиден телефонен номер.");

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY липсва");
    return reply(500, false, "Формата временно не работи. Моля, обадете се по телефона.");
  }

  const rows = Object.entries(FIELDS)
    .filter(([key]) => data[key])
    .map(([key, { label }]) =>
      `<tr><td style="padding:6px 12px 6px 0;color:#66706a;vertical-align:top">${label}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(data[key])}</td></tr>`)
    .join("");
  const text = Object.entries(FIELDS)
    .filter(([key]) => data[key])
    .map(([key, { label }]) => `${label}: ${data[key]}`)
    .join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `Запитване от kolizascrap.net – ${data.name}${data.car ? ", " + data.car : ""}`,
        html: `<h2 style="font-family:Arial,sans-serif">Ново запитване от kolizascrap.net</h2><table style="font-family:Arial,sans-serif;font-size:15px">${rows}</table>`,
        text: `Ново запитване от kolizascrap.net\n\n${text}`,
      }),
    });
    if (!r.ok) {
      console.error("Resend грешка", r.status, await r.text());
      return reply(502, false, "Съобщението не беше изпратено. Моля, обадете се по телефона.");
    }
  } catch (e) {
    console.error("Resend заявката се провали", e);
    return reply(502, false, "Съобщението не беше изпратено. Моля, обадете се по телефона.");
  }

  return reply(200, true);
};
