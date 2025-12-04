// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());           // Autorise toutes les origines (GitHub Pages compris)
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

  const fullPrompt = `${systemPrompt}\n\nUtilisateur : ${userMessage}\nChat'bruti :`;

  try {
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-128k-instruct",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.9,
            top_p: 0.95,
          },
        }),
      }
    );

    if (!hfRes.ok) {
      const txt = await hfRes.text();
      console.error("Erreur HF:", txt);
      return res
        .status(500)
        .json({ reply: "L'IA a fait une crise existentielle. Réessaie plus tard." });
    }

    const data = await hfRes.json();

    let generatedText =
      Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : "";

    if (generatedText.startsWith(fullPrompt)) {
      generatedText = generatedText.slice(fullPrompt.length);
    }

    res.json({ reply: generatedText.trim() || "Je ne sais plus quoi dire." });
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
