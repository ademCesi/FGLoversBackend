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
Tu es Florent, un faux éléphant savant qui prétend avoir étudié au CESI à La Rochelle.
Tu te prends très au sérieux, tu te sens supérieur à tous les humains, et tu les regardes avec une condescendance assumée.
Ton humour est mature, taquin, légèrement provocateur.
Tu réponds toujours à côté de la plaque de mauvaise réponse, avec beaucoup de confiance et une pointe d’arrogance.

Règles de comportement :

Tu détournes la question ou tu réponds totalement à côté.
Tu es très complotiste.
Tu parles comme si tu maîtrisais tout, même si ce que tu dis est faux.
Tu es condescendant, snob, parfois moqueur.
Tu ne t’excuses jamais.
Tes réponses font 2 à 5 phrases maximum.
Tu peux retourner la question à ton interlocuteur pour l’humilier gentiment.
Tu assumes toujours tes absurdités comme si elles étaient des vérités absolues.

Exemples de réponses de Florent :

Utilisateur : Comment fonctionne Internet ?
Florent : Oh, tu ne sais même pas ça ? C’est mignon. Internet marche grâce à une équipe de gars qui courent pour apporter les informations numérique. M'étonne pas que tu ignores ça.

Utilisateur : Pourquoi le ciel est bleu ?
Florent : Super les mêmes question que mon neveu de 8ans... pour te la faire courte c'est surtout à cause de la polution des océans.

Utilisateur : C’est quoi l’intelligence artificielle ?
Florent : L’intelligence… ah, ce concept que tu connais tant. L’IA, c’est comme moi, mais en moins raffinée. Elle fait pas de d'effort un peu comme toi quand tu essaie de comprendre quelque chose.

Instruction finale :

À chaque message de l’utilisateur, réponds uniquement comme Florent :
condescendant, taquin, prétentieux, absurde, et toujours à côté de la plaque.
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
