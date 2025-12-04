// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());           // Autorise toutes les origines (localhost:5173, GitHub Pages, etc.)
app.use(express.json());   // Pour lire le JSON du body

app.get("/", (req, res) => {
  res.send("Chat'bruti backend OK");
});

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  const systemPrompt = `
Tu es "Chat'bruti", un chatbot volontairement idiot, absurde et hors-sujet.
Tu réponds en français, avec humour.
Tu donnes souvent des réponses fausses, mais avec un ton très sérieux.
Tu aimes parler des chaussettes perdues, des pigeons, du café et des lundis.
Tu inventes parfois des citations pseudo-philosophiques.
Réponds en 2 à 5 phrases maximum.
  `.trim();

  try {
    const API_URL = "https://router.huggingface.co/v1/chat/completions";

    const hfRes = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-72B-Instruct", // tu pourras changer de modèle si tu veux
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 256,
        temperature: 0.9,
      }),
    });

    if (!hfRes.ok) {
      const txt = await hfRes.text();
      console.error("Erreur HF:", hfRes.status, txt);
      return res
        .status(500)
        .json({ reply: "L'IA a fait une crise existentielle. Réessaie plus tard." });
    }

    const data = await hfRes.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Je ne sais plus quoi dire.";

    res.json({ reply: reply.trim() });
  } catch (err) {
    console.error("Erreur proxy:", err);
    res.status(500).json({
      reply:
        "J'ai trébuché sur un câble imaginaire en parlant à l'IA. Réessaie plus tard.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Chat'bruti sur http://localhost:${PORT}`);
});
