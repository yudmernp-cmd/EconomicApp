import { fechaLocal, obtenerPeriodo } from './finanzas.js';

export const CATEGORIAS_ANALISIS = [
  { id: 'comida', label: 'Alimentación', color: '#c37d45' },
  { id: 'casa', label: 'Vivienda', color: '#39795b' },
  { id: 'pasaje', label: 'Transporte', color: '#5484aa' },
  { id: 'salud', label: 'Salud', color: '#b6627c' },
  { id: 'escuela', label: 'Educación', color: '#8971a6' },
  { id: 'gusto', label: 'Gustos', color: '#ac9137' },
  { id: 'otro', label: 'Otros', color: '#6e8178' },
];

const DIA = 86400000;
const centimos = (monto) => Number.isFinite(Number(monto)) && Number(monto) > 0 ? Math.round(Number(monto) * 100) : 0;
const isoUTC = (milisegundos) => new Date(milisegundos).toISOString().slice(0, 10);

export function validarRango(inicio, fin, hoy = fechaLocal()) {
  const fechaValida = (fecha) => /^\d{4}-\d{2}-\d{2}$/.test(fecha || '') && Number.isFinite(Date.parse(fecha)) && isoUTC(Date.parse(fecha)) === fecha;
  if (!fechaValida(inicio) || !fechaValida(fin)) return 'Elige una fecha inicial y una fecha final válidas.';
  if (inicio > fin) return 'La fecha inicial debe ser anterior o igual a la final.';
  if (fin > hoy) return 'Elige un período que termine hoy o antes.';
  if (Date.parse(fin) - Date.parse(inicio) > 365 * DIA) return 'Selecciona un rango de hasta 366 días.';
  return '';
}

export function analizarPeriodo(movimientos, inicio, fin) {
  if (validarRango(inicio, fin, fin)) return { movimientos: [], ingresos: 0, gastos: 0, balance: 0, categorias: [], tramos: [] };
  const lista = movimientos.filter((m) => m.fecha >= inicio && m.fecha <= fin && ['ingreso', 'gasto'].includes(m.tipo) && centimos(m.monto) > 0);
  const dias = Math.round((Date.parse(fin) - Date.parse(inicio)) / DIA) + 1;
  const diasPorTramo = Math.max(1, Math.ceil(dias / 12));
  const tramos = [];
  let acumulado = 0;
  for (let dia = 0; dia < dias; dia += diasPorTramo) {
    const desde = isoUTC(Date.parse(inicio) + dia * DIA);
    const hasta = isoUTC(Date.parse(inicio) + Math.min(dias - 1, dia + diasPorTramo - 1) * DIA);
    const delTramo = lista.filter((m) => m.fecha >= desde && m.fecha <= hasta);
    const entradas = delTramo.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + centimos(m.monto), 0);
    const salidas = delTramo.filter((m) => m.tipo === 'gasto').reduce((s, m) => s + centimos(m.monto), 0);
    acumulado += entradas - salidas;
    tramos.push({ inicio: desde, fin: hasta, ingresos: entradas / 100, gastos: salidas / 100, saldo: acumulado / 100 });
  }
  const ingresos = lista.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + centimos(m.monto), 0) / 100;
  const gastos = lista.filter((m) => m.tipo === 'gasto').reduce((s, m) => s + centimos(m.monto), 0) / 100;
  const categorias = CATEGORIAS_ANALISIS.map((categoria) => {
    const registros = lista.filter((m) => m.tipo === 'gasto' && (m.categoria === categoria.id || (categoria.id === 'otro' && !CATEGORIAS_ANALISIS.some((c) => c.id === m.categoria))));
    const total = registros.reduce((s, m) => s + centimos(m.monto), 0) / 100;
    return { ...categoria, total, registros, porcentaje: gastos ? total / gastos * 100 : 0 };
  }).filter((categoria) => categoria.total > 0).sort((a, b) => b.total - a.total);
  return { movimientos: lista, ingresos, gastos, balance: Math.round((ingresos - gastos) * 100) / 100, categorias, tramos };
}

export function compararMeses(movimientos, hoy = new Date()) {
  const actual = obtenerPeriodo('mensual', hoy);
  const anteriorInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const ultimoDiaAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
  const anteriorFin = new Date(hoy.getFullYear(), hoy.getMonth() - 1, Math.min(hoy.getDate(), ultimoDiaAnterior));
  const periodoActual = { inicio: actual.inicio, fin: fechaLocal(hoy) };
  const periodoAnterior = { inicio: fechaLocal(anteriorInicio), fin: fechaLocal(anteriorFin) };
  const resumenActual = analizarPeriodo(movimientos, periodoActual.inicio, periodoActual.fin);
  const resumenAnterior = analizarPeriodo(movimientos, periodoAnterior.inicio, periodoAnterior.fin);
  return {
    actual: resumenActual,
    anterior: resumenAnterior,
    periodoActual,
    periodoAnterior,
    diferencia: Math.round((resumenActual.gastos - resumenAnterior.gastos) * 100) / 100,
    variacion: resumenAnterior.gastos > 0 ? (resumenActual.gastos - resumenAnterior.gastos) / resumenAnterior.gastos * 100 : null,
  };
}
