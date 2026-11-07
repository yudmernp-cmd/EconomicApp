import { consultarIA } from './IAapi.js';
import { formatearSoles } from './formatos.js';

const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[¿?¡!.,]/g, '').trim();
const monto = (valor) => Number.isFinite(Number(valor)) ? Number(valor) : 0;

export function sugerenciasRapidas() {
  return ['¿Cómo va mi balance?', '¿En qué gasto más?', '¿Cómo va mi presupuesto?', '¿Cómo van mis metas?'];
}

// Estas consultas usan cálculos locales y no envían datos a una IA.
export function responderLocal(pregunta, contexto) {
  const texto = normalizar(pregunta);
  const { resumen, gastosMes = 0, gastosPorCategoria = [], presupuesto = {}, metas = [] } = contexto;
  if (['como va mi balance', 'cuanto puedo gastar hoy'].includes(texto)) {
    if (!resumen.ingresos && !resumen.gastos) return 'Todavía no tienes movimientos en este período. Registra un ingreso y un gasto en Mi Plata para conocer tu balance.';
    return `En este período registraste ${formatearSoles(resumen.ingresos)} de ingresos y ${formatearSoles(resumen.gastos)} de gastos. Tu balance es ${formatearSoles(resumen.disponible)}.\n\n${resumen.disponible > 0 ? `Repartido entre los ${resumen.diasRestantes} días restantes, equivale a ${formatearSoles(resumen.disponiblePorDia)} al día. Antes de gastar, considera tus pagos pendientes.` : 'Tus gastos igualan o superan los ingresos registrados. Revisa primero los gastos que puedes ajustar.'}\n\nEste cálculo usa tus registros; los aportes a metas se llevan por separado.`;
  }
  if (texto === 'en que gasto mas') {
    const ordenados = [...gastosPorCategoria].filter((categoria) => categoria.total > 0).sort((a, b) => b.total - a.total);
    if (!ordenados.length) return 'Aún no registraste gastos este mes. Cuando los añadas, te mostraré qué categorías concentran tu dinero.';
    return `Tus principales gastos de este mes son:\n${ordenados.slice(0, 3).map((categoria) => `• ${categoria.label}: ${formatearSoles(categoria.total)}${gastosMes > 0 ? ` (${Math.round(categoria.total / gastosMes * 100)}%)` : ''}`).join('\n')}\n\nEmpieza por revisar el historial de la categoría más alta y distingue los gastos necesarios de los que puedes ajustar.`;
  }
  if (texto === 'como va mi presupuesto') {
    const limite = monto(presupuesto.monto);
    if (limite <= 0) return `Este mes llevas ${formatearSoles(gastosMes)} en gastos. Crea tu presupuesto familiar en Inicio para ver cuánto te queda y recibir avisos al acercarte al límite.`;
    const diferencia = Math.round((limite - gastosMes) * 100) / 100;
    const alertas = gastosPorCategoria.filter((cat) => monto(contexto.presupuestosCategoria?.[cat.id]) > 0 && cat.total >= monto(contexto.presupuestosCategoria[cat.id]));
    return `Has utilizado ${formatearSoles(gastosMes)} de un límite mensual de ${formatearSoles(limite)} (${Math.round(gastosMes / limite * 100)}%).\n\n${diferencia >= 0 ? `Te quedan ${formatearSoles(diferencia)} dentro del presupuesto.` : `Superaste el límite por ${formatearSoles(-diferencia)}. Revisa qué gastos puedes posponer.`}${alertas.length ? `\n\nCategorías en su límite o por encima: ${alertas.map((cat) => cat.label).join(', ')}.` : ''}`;
  }
  if (texto === 'como van mis metas' || texto === 'como ahorro') {
    if (!metas.length) return 'Elige algo concreto para lo que quieras ahorrar: una emergencia, estudios o una compra importante. En Inicio puedes crear una meta y registrar el dinero que apartas, aunque sea poco cada vez.';
    return `${metas.slice(0, 4).map((meta) => {
      const ahorrado = (meta.aportes || []).reduce((suma, aporte) => suma + Math.round(monto(aporte.monto) * 100), 0) / 100;
      const restante = Math.max(0, Math.round((monto(meta.objetivo) - ahorrado) * 100) / 100);
      return `• ${meta.nombre}: ${formatearSoles(ahorrado)} apartados. ${restante ? `Faltan ${formatearSoles(restante)}.` : '¡Objetivo alcanzado!'}`;
    }).join('\n')}\n\nLos aportes son registros del dinero que apartas; no se descuentan automáticamente de tu balance.`;
  }
  if (texto === 'cuanto debo') return `Tus deudas registradas suman ${formatearSoles(contexto.totalDeudas)} y sus cuotas mensuales suman ${formatearSoles(contexto.cuotaDeudas)}. Revisa la sección Préstamos para actualizar los importes y comparar opciones.`;
  return null;
}

export async function generarRespuesta(pregunta, contexto, opciones) {
  const local = responderLocal(pregunta, contexto);
  if (local !== null) return { texto: local, origen: 'local' };
  return { texto: await consultarIA(pregunta, contexto, opciones), origen: 'ia' };
}

export function generarSugerencia({ resumen, presupuesto = {}, gastosMes = 0, metas = [] }) {
  if (monto(presupuesto.monto) > 0 && gastosMes >= monto(presupuesto.monto)) return 'Tu presupuesto mensual llegó al límite. Podemos revisar juntos tus gastos.';
  if (resumen.disponible < 0) return 'Tus gastos superan tus ingresos del período. Empecemos por entender en qué se fue tu dinero.';
  if (metas.length) return 'Un aporte pequeño también cuenta. Revisa el progreso de tus metas.';
  return 'Tus números, un poco más claros. Elige una pregunta para empezar.';
}
