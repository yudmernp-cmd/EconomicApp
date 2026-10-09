// src/utils/iaApi.js
// Llama a nuestro backend serverless (/api/chat).
// La API key vive en el servidor, nunca en el navegador.

export async function consultarIA(pregunta, contexto) {
  const contextoReducido = {
    familia: {
      nombre: contexto.perfil.nombreFamilia,
      integrantes: contexto.perfil.integrantes,
      cicloIngreso: contexto.perfil.cicloIngreso,
      ingresoEstimado: contexto.perfil.ingresoEstimado,
    },
    finanzas: {
      ingresos: contexto.resumen.ingresos,
      gastos: contexto.resumen.gastos,
      disponible: contexto.resumen.disponible,
      diasRestantes: contexto.resumen.diasRestantes,
      disponiblePorDia: contexto.resumen.disponiblePorDia,
      estado: contexto.resumen.estado,
    },
    deudas: {
      total: contexto.totalDeudas,
      cuotaMensual: contexto.cuotaDeudas,
    },
    leccionesCompletadas: contexto.leccionesVistas,
  };

  const respuesta = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pregunta,
      contexto: contextoReducido,
    }),
  });

  if (!respuesta.ok) {
    const err = await respuesta.json().catch(() => ({}));
    if (respuesta.status === 429) {
      throw new Error('Demasiadas consultas. Espera un momento.');
    }
    throw new Error(err.error || 'No se pudo conectar con el asistente.');
  }

  const data = await respuesta.json();
  return data.respuesta;
}