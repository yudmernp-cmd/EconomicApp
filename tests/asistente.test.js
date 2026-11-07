import test from 'node:test';
import assert from 'node:assert/strict';
import { responderLocal, generarRespuesta } from '../src/utils/asistente.js';
import { consultarIA } from '../src/utils/IAapi.js';

const contexto = {
  perfil: { nombreFamilia: 'Familia', cicloIngreso: 'mensual' },
  resumen: { ingresos: 1000, gastos: 450, disponible: 550, diasRestantes: 25, disponiblePorDia: 22 },
  gastosMes: 450, presupuesto: { monto: 400 }, presupuestosCategoria: { comida: 100 },
  gastosPorCategoria: [{ id: 'comida', label: 'Alimentación', total: 150 }, { id: 'casa', label: 'Vivienda', total: 300 }],
  metas: [{ nombre: 'Estudios', objetivo: 1, aportes: [{ monto: 0.1 }, { monto: 0.2 }] }],
};

test('preguntas rápidas usan datos locales sin hacer solicitudes', async (t) => {
  const solicitud = t.mock.method(globalThis, 'fetch', () => { throw new Error('No debe llamar la red'); });
  const balance = await generarRespuesta('¿Cómo va mi balance?', contexto);
  assert.equal(balance.origen, 'local');
  assert.match(balance.texto, /550.00/);
  assert.match(responderLocal('¿Cómo va mi presupuesto?', contexto), /Superaste el límite por S\/ 50.00/);
  assert.match(responderLocal('¿Cómo van mis metas?', contexto), /0.30 apartados.*0.70/);
  assert.match(responderLocal('¿En qué gasto más?', contexto), /Vivienda: S\/ 300.00/);
  assert.equal(solicitud.mock.callCount(), 0);
});

test('consulta abierta conserva contexto y separa ahorro del balance', async (t) => {
  let enviado;
  t.mock.method(globalThis, 'fetch', async (url, opciones) => {
    assert.equal(url, '/api/chat'); enviado = JSON.parse(opciones.body);
    return new Response(JSON.stringify({ respuesta: 'Revisa los pagos pendientes.' }));
  });
  assert.equal(await consultarIA('Ayúdame con mis pagos', contexto), 'Revisa los pagos pendientes.');
  assert.equal(enviado.contexto.finanzas.disponible, 550);
  assert.equal(enviado.contexto.metas[0].apartado, 0.3);
  assert.match(enviado.contexto.notaMetas, /no se deducen/);
});

test('los errores del servidor no exponen su contenido', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('INTERNAL_SECRET_DETAIL', { status: 500 }));
  await assert.rejects(consultarIA('Pregunta libre', contexto), (error) => {
    assert.match(error.message, /No pudimos obtener/);
    assert.ok(!error.message.includes('INTERNAL_SECRET_DETAIL'));
    return true;
  });
});

test('permite cancelar una consulta en curso', async (t) => {
  t.mock.method(globalThis, 'fetch', (url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }));
  const controlador = new AbortController();
  const resultado = assert.rejects(consultarIA('Pregunta libre', contexto, { signal: controlador.signal }), /Consulta cancelada/);
  controlador.abort();
  await resultado;
});

test('una consulta no espera indefinidamente', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(globalThis, 'fetch', (url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }));
  const resultado = assert.rejects(consultarIA('Pregunta libre', contexto), /tardó demasiado/);
  t.mock.timers.tick(30000);
  await resultado;
});
