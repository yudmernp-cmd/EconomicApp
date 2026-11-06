const normalizar = (texto) => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();

export function filtrarHistorial(movimientos, { busqueda = '', tipo = 'todos', inicio = null, fin = null, categorias = [] } = {}) {
  const consulta = normalizar(busqueda);
  return movimientos.filter((movimiento) => {
    if (tipo !== 'todos' && movimiento.tipo !== tipo) return false;
    if (inicio && movimiento.fecha < inicio) return false;
    if (fin && movimiento.fecha > fin) return false;
    const categoria = categorias.find((c) => c.id === movimiento.categoria)?.label || movimiento.categoria;
    return !consulta || normalizar(`${movimiento.descripcion || ''} ${categoria}`).includes(consulta);
  }).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function validarMovimiento(movimiento, hoy) {
  const monto = Number(movimiento.monto);
  if (!Number.isFinite(monto) || monto <= 0 || monto > 999999999.99) return 'Ingresa un monto entre S/ 0.01 y S/ 999999999.99.';
  if (Math.abs(monto * 100 - Math.round(monto * 100)) > 0.0001) return 'Usa un máximo de dos decimales para el monto.';
  const fecha = movimiento.fecha;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || fecha < '1900-01-01' || fecha > hoy) return 'Elige una fecha válida hasta hoy.';
  const comprobacion = new Date(`${fecha}T12:00:00Z`);
  if (!Number.isFinite(comprobacion.getTime()) || comprobacion.toISOString().slice(0, 10) !== fecha) return 'Elige una fecha válida.';
  return '';
}

function celdaCSV(valor) {
  let texto = String(valor ?? '');
  // Excel y otras hojas pueden interpretar texto importado como fórmulas.
  if (/^\s*[=+@-]/.test(texto) || /^[\t\r\n]/.test(texto)) texto = `'${texto}`;
  return `"${texto.replace(/"/g, '""')}"`;
}

export function movimientosCSV(movimientos, categorias = []) {
  const filas = [
    ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto (PEN)'],
    ...movimientos.map((m) => [
      m.fecha,
      m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
      categorias.find((c) => c.id === m.categoria)?.label || m.categoria,
      m.descripcion || '',
      Number(m.monto).toFixed(2),
    ]),
  ];
  return `\uFEFF${filas.map((fila) => fila.map(celdaCSV).join(',')).join('\r\n')}\r\n`;
}
