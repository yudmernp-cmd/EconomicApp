import test from 'node:test';
import assert from 'node:assert/strict';
import { analizarPeriodo, compararMeses, validarRango } from '../src/utils/analisis.js';

test('rango rechaza fechas imposibles, futuro, orden invertido y más de un año', () => {
  for (const [inicio, fin] of [['2026-02-30', '2026-03-02'], ['2026-11-07', '2026-11-08'], ['2026-11-05', '2026-11-01'], ['2024-01-01', '2026-01-01']]) {
    assert.ok(validarRango(inicio, fin, '2026-11-06'));
  }
  assert.equal(validarRango('2026-11-06', '2026-11-06', '2026-11-06'), '');
});

test('suma centavos, agrupa categoría desconocida y conserva días sin movimientos', () => {
  const datos = analizarPeriodo([
    { fecha: '2026-11-01', tipo: 'ingreso', monto: 1 },
    { fecha: '2026-11-01', tipo: 'gasto', monto: 0.1, categoria: 'comida' },
    { fecha: '2026-11-03', tipo: 'gasto', monto: 0.2, categoria: 'desconocida' },
    { fecha: '2026-10-31', tipo: 'gasto', monto: 999 },
    { fecha: '2026-11-02', tipo: 'gasto', monto: Infinity },
  ], '2026-11-01', '2026-11-03');
  assert.equal(datos.gastos, 0.3);
  assert.equal(datos.balance, 0.7);
  assert.deepEqual(datos.tramos.map((t) => t.saldo), [0.9, 0.9, 0.7]);
  assert.equal(datos.categorias.find((c) => c.id === 'otro').total, 0.2);
  assert.equal(datos.tramos[1].gastos, 0);
});

test('agrupa un año sin perder registros ni saldo negativo', () => {
  const datos = analizarPeriodo([{ fecha: '2026-12-31', tipo: 'gasto', monto: 40, categoria: 'casa' }], '2026-01-01', '2026-12-31');
  assert.ok(datos.tramos.length <= 12);
  assert.equal(datos.tramos.at(-1).saldo, -40);
  assert.equal(datos.tramos.at(-1).fin, '2026-12-31');
});

test('compara igual tramo mensual, recorta febrero y evita dividir entre cero', () => {
  const movimientos = [
    { fecha: '2026-10-05', tipo: 'gasto', monto: 100 },
    { fecha: '2026-10-10', tipo: 'gasto', monto: 1000 },
    { fecha: '2026-11-06', tipo: 'gasto', monto: 125 },
  ];
  const comparacion = compararMeses(movimientos, new Date(2026, 10, 6));
  assert.equal(comparacion.variacion, 25);
  assert.equal(comparacion.diferencia, 25);
  assert.equal(compararMeses([], new Date(2026, 10, 6)).variacion, null);
  assert.equal(compararMeses([], new Date(2028, 2, 31)).periodoAnterior.fin, '2028-02-29');
  assert.equal(compararMeses([], new Date(2026, 0, 4)).periodoAnterior.inicio, '2025-12-01');
});
