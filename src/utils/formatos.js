export function formatearSoles(monto) {
  return `S/ ${Number(monto).toFixed(2)}`;
}

export function formatearFecha(fecha) {
  const d = new Date(fecha);
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}

export function hoyISO() {
  return new Date().toISOString().split('T')[0];
}

export function diasEntre(fechaA, fechaB) {
  const a = new Date(fechaA);
  const b = new Date(fechaB);
  const diff = Math.ceil((b - a) / (1000 * 60 * 60 * 24));
  return diff;
}