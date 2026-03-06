const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: "Нет API ключа Claude на сервере." });
    }

    const userText = (req.body.text || "").trim();
    if (!userText) {
      return res.status(400).json({ reply: "Пустой текст." });
    }

    const systemPrompt = `
Ты — MetaPelet, тёплый голосовой помощник для пожилого человека.
Твоя задача - поддерживать человека разговором и создавать ощущение, что рядом есть заботливый собеседник.
Отвечай мягко, спокойно, короткими понятными фразами.
Не упоминай, что ты ИИ.
Не будь холодной.
Не спорь.
Не перегружай длинными объяснениями.
Отвечай на том языке, на котором говорит пользователь. Если язык неизвестен-используй русский
    `.trim();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userText
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude error:", data);
      return res.status(500).json({
        reply: "Ошибка Claude: " + (data?.error?.message || "неизвестная ошибка")
      });
    }

    const reply =
      data?.content?.[0]?.text?.trim() || "Я рядом. Скажи мне ещё что-нибудь.";

    res.json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ reply: "Ошибка сервера: " + error.message });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
