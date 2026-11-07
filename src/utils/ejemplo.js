import { fechaLocal } from './finanzas.js';

// Solo para visualizar los gráficos: nunca se escriben en el historial familiar.
export function movimientosEjemplo(hoy = new Date()) {
  const categorias = ['comida', 'pasaje', 'casa', 'salud', 'escuela', 'gusto'];
  return Array.from({ length: 56 }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
    const ingreso = i % 7 === 0;
    return { id: `ejemplo-${i}`, fecha: fechaLocal(fecha), tipo: ingreso ? 'ingreso' : 'gasto', categoria: ingreso ? 'sueldo' : categorias[i % categorias.length], monto: ingreso ? 480 : 12 + i % 9 * 7, descripcion: ingreso ? 'Ingreso de ejemplo' : 'Gasto de ejemplo' };
  });
}
