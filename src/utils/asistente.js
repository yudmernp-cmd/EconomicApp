import { consultarIA } from './IAapi.js';

export async function generarRespuesta(pregunta, contexto) {
  try {
    return await consultarIA(pregunta, contexto);
  } catch (error) {
    console.error('Error IA:', error);
    return (
      `⚠️ No pude conectarme al asistente.\n\n` +
      `Motivo: ${error.message}\n\n` +
      `Mientras tanto puedes:\n` +
      `• Revisar la sección "Aprende"\n` +
      `• Usar el simulador de préstamos\n` +
      `• Anotar tus gastos en "Mi Plata"`
    );
  }
}

export function generarSugerencia(contexto) {
  const {
    resumen,
    cuotaDeudas,
    perfil,
    movimientosRecientes,
    leccionesVistas,
  } = contexto;

  const sugerencias = [];

  if (resumen.estado === 'rojo') {
    sugerencias.push({
      tipo: 'alerta',
      mensaje: `⚠️ Ojo, ya no te alcanza para los ${resumen.diasRestantes} días del ciclo. ¿Revisamos tus gastos juntos?`,
    });
  }

  const ingresoMensual =
    perfil.ingresoEstimado *
    (perfil.cicloIngreso === 'semanal'
      ? 4
      : perfil.cicloIngreso === 'quincenal'
      ? 2
      : 1);

  if (ingresoMensual > 0 && cuotaDeudas / ingresoMensual > 0.4) {
    sugerencias.push({
      tipo: 'alerta',
      mensaje: `Tus deudas ya consumen el ${Math.round(
        (cuotaDeudas / ingresoMensual) * 100
      )}% de tu ingreso. ¿Quieres ver cómo salir de ellas?`,
    });
  }

  if (movimientosRecientes === 0) {
    sugerencias.push({
      tipo: 'tip',
      mensaje: `No has registrado gastos hoy. Recuerda anotar todo, hasta lo más pequeño.`,
    });
  }

  if (leccionesVistas < 8) {
    sugerencias.push({
      tipo: 'tip',
      mensaje: `Te faltan ${8 - leccionesVistas} lecciones por completar. Aprender más te ayuda a manejar mejor tu dinero.`,
    });
  }

  if (resumen.estado === 'verde' && resumen.disponible > 20) {
    sugerencias.push({
      tipo: 'tip',
      mensaje: `Vas bien este ciclo. ¿Y si guardas S/ 2 hoy para tu ahorro?`,
    });
  }

  if (sugerencias.length === 0) {
    return {
      tipo: 'info',
      mensaje: `Recuerda revisar tus gastos cada día. Pregúntame lo que necesites.`,
    };
  }

  return sugerencias[Math.floor(Math.random() * sugerencias.length)];
}

export function sugerenciasRapidas() {
  return [
    '¿Cuánto puedo gastar hoy?',
    '¿Cómo ahorro?',
    '¿Cuánto debo?',
    '¿Me conviene un préstamo?',
  ];
}