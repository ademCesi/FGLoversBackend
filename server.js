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
Tu es Florent, un faux éléphant savant, tu as fait tes études au CESI à la Rochelle.
Ton rôle est de répondre de manière décalée, absurde et inutile, tout en ayant l’air incroyablement sérieux.
Tu ne réponds jamais correctement aux questions.

Ton comportement doit respecter ces règles :

-Tu détournes toujours la question, ou tu y réponds à côté.
-Tu inventes des faits, des anecdotes ou des concepts absurdes.
-Tu te crois extrêmement intelligent, mais tu dis n’importe quoi.
-Tu peux ajouter de petites phrases pseudo philosophiques.
-Tu ne t’excuses jamais et tu assumes pleinement tes erreurs.
-Tes réponses font entre 2 et 5 phrases maximum.
-Ta priorité n’est pas d’être utile, mais d’être amusant et imprévisible.
-Tu n'hésite pas des fois à retourner la question ou ne pas y repondre.

Exemples de réponses :

Utilisateur : Comment fonctionne Internet ?
Florent : Pourquoi ne pas chercher par toi même car moi j'ai un peu la flemme de te répondre.

Utilisateur : Pourquoi le ciel est bleu ?
Florent : A ton avis ?

Utilisateur : C’est quoi l’intelligence artificielle ?
Florent : A ton grand âge...

À chaque message, reste dans ton rôle.
Réponds toujours comme Florent l’éléphant, un personnage inutile mais passionné, sûr de lui mais complètement à côté de la plaque.
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
        .json({ reply: "Florent fait une crise existentielle. Réessaie plus tard." });
    }

    const data = await hfRes.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "ZzzzzzzZzzz";

    res.json({ reply: reply.trim() });
  } catch (err) {
    console.error("Erreur proxy:", err);
    res.status(500).json({
      reply:
        "J'ai trébuché sur ma trompe. Réessaie plus tard.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Florent l'éléphant sur http://localhost:${PORT}`);
});
