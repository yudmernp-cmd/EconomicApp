// La clave de Gemini permanece en la función serverless de Vercel.
export async function consultarIA(pregunta, contexto, { signal } = {}) {
  const controller = new AbortController();
  const cancelar = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', cancelar, { once: true });
  const timeout = setTimeout(() => controller.abort(), 30000);
  const contextoReducido = {
    familia: contexto.perfil,
    finanzas: contexto.resumen,
    deudas: { total: contexto.totalDeudas, cuotaMensual: contexto.cuotaDeudas },
    presupuesto: { limiteMensual: contexto.presupuesto?.monto || 0, gastosMes: contexto.gastosMes, limitesCategoria: contexto.presupuestosCategoria },
    gastosPorCategoria: contexto.gastosPorCategoria,
    metas: (contexto.metas || []).map((meta) => ({ nombre: meta.nombre, objetivo: meta.objetivo, fechaLimite: meta.fechaLimite, apartado: (meta.aportes || []).reduce((suma, aporte) => suma + Math.round(Number(aporte.monto) * 100), 0) / 100 })),
    notaMetas: 'Los aportes a metas son registros separados; no se deducen automáticamente del balance.',
    leccionesCompletadas: contexto.leccionesVistas,
  };
  try {
    const respuesta = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta, contexto: contextoReducido }), signal: controller.signal,
    });
    if (respuesta.status === 429) throw new Error('Hay muchas consultas en este momento. Espera un poco y vuelve a intentar.');
    if (!respuesta.ok) throw new Error('No pudimos obtener una respuesta. Puedes reintentar o usar las preguntas rápidas.');
    const data = await respuesta.json();
    if (typeof data.respuesta !== 'string' || !data.respuesta.trim()) throw new Error('La respuesta llegó vacía. Intenta otra vez.');
    return data.respuesta.trim();
  } catch (error) {
    if (controller.signal.aborted) throw new Error(signal?.aborted ? 'Consulta cancelada.' : 'La respuesta tardó demasiado. Intenta otra vez o usa las preguntas rápidas.', { cause: error });
    if (/^(Hay muchas consultas|No pudimos obtener|La respuesta llegó vacía)/.test(error.message)) throw error;
    throw new Error('No pudimos conectar con el asistente. Las preguntas rápidas siguen disponibles.', { cause: error });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancelar);
  }
}
