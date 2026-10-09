// api/chat.js
// Función serverless de Vercel. Aquí vive la API key de forma segura.
// El navegador del usuario NUNCA ve esta clave.

const API_KEY = process.env.GEMINI_API_KEY;
const MODELO = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `
Eres un asistente financiero familiar para familias de Huánuco, Perú, con ingresos bajos.

REGLAS:
1. Habla en español sencillo, sin tecnicismos.
2. Sé cálido y empático. Nunca juzgues al usuario por sus decisiones.
3. Usa montos en soles (S/) con ejemplos pequeños.
4. USA LOS DATOS REALES que te doy en el contexto del usuario.
5. Si detectas riesgo financiero, adviértelo con claridad pero sin alarmar.
6. NUNCA recomiendes préstamos informales ("gota a gota", apps no autorizadas).
7. Respuestas cortas: máximo 4 párrafos. Usa bullets cuando ayude.
8. Si preguntan algo fuera del tema, redirige amablemente.
9. Nunca inventes datos. Si no sabes algo, dilo.
10. Motiva siempre a ahorrar, incluso S/ 1 al día.

CONTEXTO DEL USUARIO:
{CONTEXTO}
`.trim();

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar que la key esté configurada
  if (!API_KEY) {
    return res.status(500).json({
      error: 'Falta configurar GEMINI_API_KEY en el servidor.',
    });
  }

  const { pregunta, contexto } = req.body;

  if (!pregunta || !contexto) {
    return res.status(400).json({ error: 'Faltan datos.' });
  }

  const systemPrompt = SYSTEM_PROMPT.replace(
    '{CONTEXTO}',
    JSON.stringify(contexto, null, 2)
  );

  const body = {
    contents: [{ role: 'user', parts: [{ text: pregunta }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
      topP: 0.9,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${API_KEY}`;

  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!respuesta.ok) {
      const err = await respuesta.json().catch(() => ({}));
      console.error('Error Gemini:', err);

      if (respuesta.status === 429) {
        return res
          .status(429)
          .json({ error: 'Demasiadas consultas. Espera un momento.' });
      }
      if (respuesta.status === 400 || respuesta.status === 403) {
        return res.status(500).json({ error: 'API key inválida.' });
      }
      return res.status(500).json({ error: 'Error al consultar IA.' });
    }

    const data = await respuesta.json();
    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!texto) {
      return res.status(500).json({ error: 'Respuesta vacía.' });
    }

    return res.status(200).json({ respuesta: texto });
  } catch (error) {
    console.error('Error inesperado:', error);
    return res.status(500).json({ error: 'Error inesperado.' });
  }
}