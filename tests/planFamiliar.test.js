import test from 'node:test';
import assert from 'node:assert/strict';
import { importeValido, validarMeta, resumenMeta, resumenCategorias } from '../src/utils/planFamiliar.js';

test('objetivos y aportes aceptan centavos finitos y positivos', () => {
  for (const valido of [0.01, 0.29, 500, '120.50']) assert.equal(importeValido(valido), true);
  for (const invalido of ['', 0, -20, 0.001, Infinity, NaN, 1000000000]) assert.equal(importeValido(invalido), false);
});

test('metas validan nombre y fecha real futura u opcional', () => {
  const meta = { nombre: 'Colegio', objetivo: 120, fechaLimite: '' };
  assert.equal(validarMeta(meta, '2026-11-06'), '');
  assert.equal(validarMeta({ ...meta, fechaLimite: '2028-02-29' }, '2026-11-06'), '');
  for (const fechaLimite of ['2026-02-30', '2026-11-05', 'incorrecto']) assert.ok(validarMeta({ ...meta, fechaLimite }, '2026-11-06'));
  assert.ok(validarMeta({ ...meta, nombre: '   ' }));
});

test('ahorro suma centavos, indica plazo y admite superar objetivo', () => {
  const meta = { objetivo: 1, fechaLimite: '2026-11-07', aportes: [{ monto: 0.1 }, { monto: 0.2 }] };
  assert.deepEqual(resumenMeta(meta, '2026-11-06'), { ahorrado: 0.3, falta: 0.7, porcentaje: 30, completada: false, dias: 2, diario: 0.35 });
  assert.equal(resumenMeta({ ...meta, aportes: [{ monto: 2 }] }).completada, true);
  assert.equal(resumenMeta({ ...meta, aportes: [{ monto: 2 }] }).falta, 0);
  assert.equal(resumenMeta(meta, '2026-11-08').diario, null);
});

test('presupuestos solo cuentan gastos del mes hasta hoy y agrupan categorías desconocidas', () => {
  const movimientos = [
    { tipo: 'gasto', categoria: 'comida', monto: 0.1, fecha: '2026-11-01' },
    { tipo: 'gasto', categoria: 'comida', monto: 0.2, fecha: '2026-11-06' },
    { tipo: 'ingreso', categoria: 'comida', monto: 600, fecha: '2026-11-06' },
    { tipo: 'gasto', categoria: 'comida', monto: 30, fecha: '2026-10-31' },
    { tipo: 'gasto', categoria: 'comida', monto: 50, fecha: '2026-11-07' },
    { tipo: 'gasto', categoria: 'desconocida', monto: 4, fecha: '2026-11-06' },
  ];
  const categorias = resumenCategorias(movimientos, { comida: 0.25 }, new Date(2026, 10, 6));
  assert.equal(categorias.find((c) => c.id === 'comida').gastado, 0.3);
  assert.equal(categorias.find((c) => c.id === 'comida').restante, -0.05);
  assert.equal(categorias.find((c) => c.id === 'otro').gastado, 4);
});
