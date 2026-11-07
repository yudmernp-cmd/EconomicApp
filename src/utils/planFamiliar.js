import { fechaLocal, obtenerPeriodo } from './finanzas.js';

export const CATEGORIAS_PLAN = [
  { id: 'comida', nombre: 'Alimentación', color: '#bc7640' },
  { id: 'casa', nombre: 'Vivienda', color: '#37795a' },
  { id: 'pasaje', nombre: 'Transporte', color: '#527d9d' },
  { id: 'salud', nombre: 'Salud', color: '#ae6778' },
  { id: 'escuela', nombre: 'Educación', color: '#8670a3' },
  { id: 'gusto', nombre: 'Gustos', color: '#aa8a31' },
  { id: 'otro', nombre: 'Otros', color: '#798276' },
];

export function importeValido(valor) {
  const numero = Number(valor);
  return String(valor).trim() !== '' && Number.isFinite(numero) && numero > 0 && numero <= 999999999.99
    && Math.abs(numero * 100 - Math.round(numero * 100)) < 0.0001;
}

export function fechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) return false;
  const valor = new Date(`${fecha}T12:00:00Z`);
  return Number.isFinite(valor.getTime()) && valor.toISOString().slice(0, 10) === fecha;
}

export function validarMeta(meta, hoy = fechaLocal()) {
  if (!meta.nombre?.trim() || meta.nombre.trim().length > 60) return 'Escribe un nombre de hasta 60 caracteres para tu meta.';
  if (!importeValido(meta.objetivo)) return 'El objetivo debe ser mayor que cero y tener hasta dos decimales.';
  if (meta.fechaLimite && (!fechaValida(meta.fechaLimite) || meta.fechaLimite < hoy)) return 'Elige una fecha límite desde hoy, o déjala vacía.';
  return '';
}

export function resumenMeta(meta, hoy = fechaLocal()) {
  const centimos = (meta.aportes || []).reduce((total, aporte) => total + Math.round(Number(aporte.monto) * 100), 0);
  const objetivo = Math.round(Number(meta.objetivo) * 100);
  const falta = Math.max(0, objetivo - centimos) / 100;
  const dias = meta.fechaLimite && fechaValida(meta.fechaLimite) ? Math.round((Date.parse(meta.fechaLimite) - Date.parse(hoy)) / 86400000) + 1 : null;
  return {
    ahorrado: centimos / 100, falta,
    porcentaje: objetivo > 0 ? Math.round(centimos / objetivo * 100) : 0,
    completada: centimos >= objetivo && objetivo > 0,
    dias, diario: dias > 0 ? Math.ceil(falta * 100 / dias) / 100 : null,
  };
}

export function resumenCategorias(movimientos, limites, hoy = new Date()) {
  const { inicio } = obtenerPeriodo('mensual', hoy);
  const hasta = fechaLocal(hoy);
  return CATEGORIAS_PLAN.map((categoria) => {
    const gastado = movimientos.filter((m) => m.tipo === 'gasto' && m.fecha >= inicio && m.fecha <= hasta
      && (m.categoria === categoria.id || (categoria.id === 'otro' && !CATEGORIAS_PLAN.some((c) => c.id === m.categoria))))
      .reduce((suma, m) => suma + Math.round(Number(m.monto) * 100), 0) / 100;
    const limite = Number(limites[categoria.id]) || 0;
    return { ...categoria, gastado, limite, porcentaje: limite > 0 ? gastado / limite * 100 : 0,
      restante: Math.round((limite - gastado) * 100) / 100 };
  });
}
