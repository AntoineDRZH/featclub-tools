export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { item } = req.body;

  const prompt = `Tu es un expert en marketing Instagram pour les salles de sport.

Génère un post Instagram complet pour Feat Club, studio de coaching sportif premium à Boulogne-Billancourt.

Feat Club :
- Personal Training & Small Group Training (Cross, Boxe, Pilates)
- Slogan : "Back to Basics"
- Cible : tous types de public, 20-45 ans
- Instagram : @featclub.fr

Post à créer :
- Jour : ${item.day}/30
- Type : ${item.type}
- Format : ${item.format || ''}
- Thème : ${item.idea}
- Contexte : ${item.context}

Réponds UNIQUEMENT en JSON valide, sans markdown :
{
  "legende": "2-4 lignes, ton authentique, emojis pertinents",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6 #hashtag7 #hashtag8",
  "cta": "1 phrase courte et directe",
  "conseil_visuel": "Conseil pour la photo ou vidéo",
  "meilleur_moment": "Meilleur jour et heure pour publier"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ legende: "Erreur. Réessaie.", hashtags: "", cta: "", conseil_visuel: "", meilleur_moment: "" });
  }
}
