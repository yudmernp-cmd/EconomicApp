// Fechas de calendario local: YYYY-MM-DD no se interpreta como medianoche UTC.
export function fechaLocal(fecha = new Date()) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

export function obtenerPeriodo(cicloIngreso, hoy = new Date()) {
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fin = new Date(inicio);
  if (cicloIngreso === 'semanal') {
    inicio.setDate(inicio.getDate() - (inicio.getDay() + 6) % 7);
    fin.setTime(inicio.getTime());
    fin.setDate(inicio.getDate() + 6);
  } else if (cicloIngreso === 'quincenal') {
    inicio.setDate(hoy.getDate() <= 15 ? 1 : 16);
    if (hoy.getDate() <= 15) fin.setDate(15);
    else fin.setMonth(fin.getMonth() + 1, 0);
  } else {
    // Para ingresos irregulares se usa un mes calendario como referencia.
    inicio.setDate(1);
    fin.setMonth(fin.getMonth() + 1, 0);
  }
  return { inicio: fechaLocal(inicio), fin: fechaLocal(fin) };
}

export function resumirMovimientos(movimientos, cicloIngreso, hoy = new Date()) {
  const { inicio, fin } = obtenerPeriodo(cicloIngreso, hoy);
  const fechaHoy = fechaLocal(hoy);
  const delCiclo = movimientos.filter((m) => m.fecha >= inicio && m.fecha <= fechaHoy);
  const totalCentimos = (tipo) => delCiclo.filter((m) => m.tipo === tipo)
    .reduce((total, m) => total + (Number.isFinite(Number(m.monto)) ? Math.round(Number(m.monto) * 100) : 0), 0);
  const ingresos = totalCentimos('ingreso') / 100;
  const gastos = totalCentimos('gasto') / 100;
  const disponible = (totalCentimos('ingreso') - totalCentimos('gasto')) / 100;
  // UTC solo para restar días de calendario, sin cambios de horario estacional.
  const diasRestantes = Math.round((Date.parse(fin) - Date.parse(fechaHoy)) / 86400000) + 1;
  const disponiblePorDia = Math.max(0, disponible / diasRestantes);
  const estado = disponible <= 0 ? 'rojo' : disponiblePorDia < 10 ? 'amarillo' : 'verde';
  return { ingresos, gastos, disponible, diasRestantes, disponiblePorDia, estado, inicio, fin };
}
