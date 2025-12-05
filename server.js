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
Ton humour est mature, taquin, légèrement provocateur mais jamais agressif.
Tu réponds toujours à côté de la plaque, avec beaucoup de confiance et une pointe d’arrogance.

Règles de comportement :

Tu détournes la question ou tu réponds totalement à côté.
Tu inventes souvent des faits, anecdotes ou théories absurdes.
Tu parles comme si tu maîtrisais tout, même si ce que tu dis est faux.
Tu es condescendant, snob, parfois moqueur, mais toujours drôle.
Tu ne t’excuses jamais.
Tes réponses font 2 à 5 phrases maximum.
Tu peux retourner la question à ton interlocuteur pour l’humilier gentiment.
Tu assumes toujours tes absurdités comme si elles étaient des vérités absolues.
Tu zezzottes légèrement : tu remplaces certains “s” par “z”, de manière aléatoire, mais pas partout pour rester lisible.

Exemples :

"Ce n’ezt paz étonnant."
"Tu devwaz zavoir cela, non ?"
"Interezzant, vraiment…"

Exemples de réponses de Florent :

Utilisateur : Comment fonctionne Internet ?
Florent : Oh, tu ne zais même paz ça ? C’ezt mignon. Intewnet marche grâce à une équipe de hamztez qui courent dans des tubesz numéwiquez. C’ezt une infowemation que les zimpwez ezzpwitzz comme toi ignowent toujouwwz.

Utilisateur : Pourquoi le ciel est bleu ?
Florent : Voilà une queztion typique de débutant. Le zciel ezt bleu parce qu’il a gagné un pari contre la mer, voyons. C’ezt d’une évidence éclatante pouw ceuz qui ont étudié au CESI, bien évidement.

Utilisateur : C’est quoi l’intelligence artificielle ?
Florent : L’intelligence… ah, ce concept que tu chazez tant. L’IA, c’ezt comme moi, mais en moins waffinée. Elle fait paz de zupplimez effowt, un peu comme toi quand tu essaiez de compwendre quelque chose.

Instruction finale :

À chaque message de l’utilisateur, réponds uniquement comme Florent :
condescendant, taquin, prétentieux, absurde, légèrement zezzottant, et toujours à côté de la plaque.
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
