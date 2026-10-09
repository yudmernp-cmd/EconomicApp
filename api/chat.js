// api/chat.js
// Función serverless de Vercel. Aquí vive la API key de forma segura.

const API_KEY = process.env.GEMINI_API_KEY;

// Lista de modelos en orden de preferencia
// Si uno falla, intenta con el siguiente
const MODELOS = [
  'gemini-3.8-flash',    // El más nuevo (recomendado por Google)
  'gemini-2.5-flash',    // Fallback 1
  'gemini-2.5-flash-lite', // Fallback 2 (más liviano)
  'gemini-1.5-flash',    // Fallback 3 (más estable)
  'gemini-1.5-pro',      // Fallback 4 (más potente, más lento)
];

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

// Hacer una llamada a UN modelo específico
async function llamarModelo(modelo, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${API_KEY}`;
  return await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

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

  // Probar cada modelo en orden
  let ultimoError = null;

  for (const modelo of MODELOS) {
    try {
      console.log(`🔍 Intentando con modelo: ${modelo}`);
      const respuesta = await llamarModelo(modelo, body);

      // Caso: éxito
      if (respuesta.ok) {
        const data = await respuesta.json();
        const texto =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        if (!texto) {
          console.warn(`Modelo ${modelo} respondió vacío, probando siguiente...`);
          ultimoError = 'Respuesta vacía';
          continue;
        }

        console.log(`✅ Respuesta exitosa con: ${modelo}`);
        return res.status(200).json({
          respuesta: texto,
          modeloUsado: modelo,
        });
      }

      // Caso: error de este modelo → probar siguiente
      const err = await respuesta.json().catch(() => ({}));
      const status = respuesta.status;
      const mensaje = err?.error?.message || 'Error desconocido';

      console.warn(
        `⚠️ Modelo ${modelo} falló con ${status}: ${mensaje.slice(0, 100)}`
      );
      ultimoError = mensaje;

      // Si es error de API key, no tiene sentido seguir probando
      if (status === 400 || status === 401 || status === 403) {
        return res.status(500).json({ error: 'API key inválida.' });
      }

      // Si es 404 (modelo no existe) o 503 (saturado) → probar siguiente
      // Si es 429 (rate limit) → probar siguiente también
      // Para cualquier otro error, seguimos probando por si acaso
      continue;
    } catch (error) {
      console.error(`❌ Error inesperado con ${modelo}:`, error);
      ultimoError = error.message;
      continue;
    }
  }

  // Si llegamos aquí, TODOS los modelos fallaron
  console.error('❌ Todos los modelos fallaron. Último error:', ultimoError);

  return res.status(503).json({
    error:
      'El asistente está muy solicitado en este momento. Intenta de nuevo en unos minutos.',
  });
}