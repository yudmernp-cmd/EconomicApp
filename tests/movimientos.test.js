import test from 'node:test';
import assert from 'node:assert/strict';
import { filtrarHistorial, movimientosCSV, validarMovimiento } from '../src/utils/movimientos.js';

const categorias = [{ id: 'comida', label: 'Alimentación' }];
const movimientos = [
  { id: '1', tipo: 'gasto', categoria: 'comida', fecha: '2026-11-01', monto: 12.35, descripcion: 'Pan, café' },
  { id: '2', tipo: 'ingreso', categoria: 'sueldo', fecha: '2026-11-06', monto: 500, descripcion: 'Quincena' },
  { id: '3', tipo: 'gasto', categoria: 'comida', fecha: '2026-10-31', monto: 10, descripcion: 'Mercado' },
];

test('combina período inclusivo, tipo y búsqueda sin tildes sin mutar originales', () => {
  const resultado = filtrarHistorial(movimientos, { inicio: '2026-11-01', fin: '2026-11-06', tipo: 'gasto', busqueda: 'alimentacion', categorias });
  assert.deepEqual(resultado.map((m) => m.id), ['1']);
  assert.deepEqual(filtrarHistorial(movimientos).map((m) => m.id), ['2', '1', '3']);
  assert.deepEqual(movimientos.map((m) => m.id), ['1', '2', '3']);
});

test('exporta CSV con centavos, comas y comillas escapadas', () => {
  const csv = movimientosCSV([{ ...movimientos[0], descripcion: 'Café, "grande"' }], categorias);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"Café, ""grande"""'));
  assert.ok(csv.includes('"12.35"'));
  assert.ok(csv.includes('"Alimentación"'));
});

test('neutraliza fórmulas y fórmulas tras espacios en CSV', () => {
  for (const descripcion of ['=SUM(1,2)', '+42', '-1+1', '@SUM(1)', '  =1+1', '\t=1+1']) {
    assert.ok(movimientosCSV([{ ...movimientos[0], descripcion }]).includes(`"'${descripcion}"`));
  }
});

test('valida centavos, monto finito, fecha real y límite hoy', () => {
  assert.equal(validarMovimiento(movimientos[0], '2026-11-06'), '');
  for (const monto of [0, -1, Infinity, NaN, 1.001, 1000000000]) {
    assert.ok(validarMovimiento({ ...movimientos[0], monto }, '2026-11-06'));
  }
  for (const fecha of ['', '2026-02-30', '2026-11-07', '1899-12-31', '2026-13-01']) {
    assert.ok(validarMovimiento({ ...movimientos[0], fecha }, '2026-11-06'));
  }
  assert.equal(validarMovimiento({ ...movimientos[0], monto: 0.29, fecha: '2024-02-29' }, '2026-11-06'), '');
});
