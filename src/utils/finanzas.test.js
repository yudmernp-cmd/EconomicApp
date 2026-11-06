import test from 'node:test';
import assert from 'node:assert/strict';
import { fechaLocal, obtenerPeriodo, resumirMovimientos } from './finanzas.js';
import { formatearFecha } from './formatos.js';

test('semana lunes-domingo cruza mes y año', () => {
  assert.deepEqual(obtenerPeriodo('semanal', new Date(2027, 0, 1)), { inicio: '2026-12-28', fin: '2027-01-03' });
  assert.deepEqual(obtenerPeriodo('semanal', new Date(2027, 0, 3)), { inicio: '2026-12-28', fin: '2027-01-03' });
});

test('quincenas respetan días 15/16 y febrero bisiesto', () => {
  assert.deepEqual(obtenerPeriodo('quincenal', new Date(2028, 1, 15)), { inicio: '2028-02-01', fin: '2028-02-15' });
  assert.deepEqual(obtenerPeriodo('quincenal', new Date(2028, 1, 16)), { inicio: '2028-02-16', fin: '2028-02-29' });
});

test('mes e ingresos irregulares usan mes calendario', () => {
  for (const ciclo of ['mensual', 'irregular']) {
    assert.deepEqual(obtenerPeriodo(ciclo, new Date(2026, 1, 28)), { inicio: '2026-02-01', fin: '2026-02-28' });
  }
});

test('resumen incluye extremos, excluye futuro y suma centavos exactos', () => {
  const movimientos = [
    { tipo: 'ingreso', monto: 100, fecha: '2026-11-01' },
    { tipo: 'gasto', monto: 0.1, fecha: '2026-11-01' },
    { tipo: 'gasto', monto: 0.2, fecha: '2026-11-06' },
    { tipo: 'gasto', monto: 800, fecha: '2026-10-31' },
    { tipo: 'gasto', monto: 900, fecha: '2026-11-07' },
  ];
  const resumen = resumirMovimientos(movimientos, 'mensual', new Date(2026, 10, 6));
  assert.equal(resumen.ingresos, 100);
  assert.equal(resumen.gastos, 0.3);
  assert.equal(resumen.disponible, 99.7);
  assert.equal(resumen.diasRestantes, 25);
  assert.equal(resumirMovimientos([], 'mensual', new Date(2026, 10, 30)).diasRestantes, 1);
});

test('fechas mantienen el día local', () => {
  assert.equal(fechaLocal(new Date(2026, 10, 6, 23, 59)), '2026-11-06');
  assert.equal(formatearFecha('2026-11-06'), '06/11/2026');
});
