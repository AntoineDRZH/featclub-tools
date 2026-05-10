exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { item } = JSON.parse(event.body);
    const prompt = `Tu es expert marketing Instagram pour salles de sport. Génère un post pour Feat Club, studio coaching sportif à Boulogne-Billancourt. Slogan "Back to Basics". Instagram @featclub.fr. Jour ${item.day}/30, Type: ${item.type}, Thème: ${item.idea}, Contexte: ${item.context}. Réponds UNIQUEMENT en JSON sans markdown: {"legende":"2-4 lignes avec emojis","hashtags":"#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8","cta":"1 phrase courte","conseil_visuel":"conseil photo","meilleur_moment":"moment idéal"}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data, legende: 'Erreur API: ' + JSON.stringify(data), hashtags: '', cta: '', conseil_visuel: '', meilleur_moment: '' })
      };
    }

    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(parsed)
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ legende: 'Erreur: ' + err.message, hashtags: '', cta: '', conseil_visuel: '', meilleur_moment: '' })
    };
  }
};
