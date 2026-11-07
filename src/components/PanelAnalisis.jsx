import { useId, useState } from 'react';
import { fechaLocal, obtenerPeriodo } from '../utils/finanzas.js';
import { formatearFecha, formatearSoles } from '../utils/formatos.js';
import { analizarPeriodo, compararMeses, validarRango } from '../utils/analisis.js';
import './PanelAnalisis.css';

const PERIODOS = [{ id: 'semanal', label: 'Semana' }, { id: 'quincenal', label: 'Quincena' }, { id: 'mensual', label: 'Mes' }, { id: 'personalizado', label: 'Personalizado' }];
const fechaCorta = (fecha) => formatearFecha(fecha).slice(0, 5);
const etiquetaTramo = (tramo) => tramo.inicio === tramo.fin ? fechaCorta(tramo.inicio) : `${fechaCorta(tramo.inicio)} – ${fechaCorta(tramo.fin)}`;

function Dona({ categorias, gastos, seleccion, seleccionar }) {
  const radio = 66;
  const longitud = 2 * Math.PI * radio;
  return (
    <div className="analisis-dona">
      <svg viewBox="0 0 180 180" className="analisis-dona-svg" aria-label="Distribución de gastos por categoría">
        <circle cx="90" cy="90" r={radio} fill="none" stroke="#edf1e8" strokeWidth="22" />
        {categorias.map((categoria, indice) => {
          const offset = categorias.slice(0, indice).reduce((s, c) => s + c.porcentaje, 0) / 100 * longitud;
          return <circle key={categoria.id} cx="90" cy="90" r={radio} fill="none" stroke={categoria.color} strokeWidth={seleccion === categoria.id ? 28 : 22} strokeDasharray={`${categoria.porcentaje / 100 * longitud} ${longitud}`} strokeDashoffset={-offset} transform="rotate(-90 90 90)" role="button" tabIndex="0" aria-label={`${categoria.label}: ${formatearSoles(categoria.total)}, ver movimientos`} aria-pressed={seleccion === categoria.id} onClick={() => seleccionar(categoria.id)} onKeyDown={(evento) => { if (evento.key === 'Enter' || evento.key === ' ') { evento.preventDefault(); seleccionar(categoria.id); } }}><title>{categoria.label}: {formatearSoles(categoria.total)}</title></circle>;
        })}
        <text x="90" y="84" textAnchor="middle" className="analisis-dona-label">Gastos</text>
        <text x="90" y="104" textAnchor="middle" className="analisis-dona-total">{formatearSoles(gastos)}</text>
      </svg>
      {categorias.length ? <div className="analisis-leyenda">{categorias.map((categoria) => <button type="button" key={categoria.id} aria-pressed={seleccion === categoria.id} onClick={() => seleccionar(categoria.id)}><span className="analisis-color" style={{ background: categoria.color }} /><span>{categoria.label}</span><strong>{Math.round(categoria.porcentaje)}%</strong></button>)}</div> : <p className="analisis-vacio">Aquí aparecerá la distribución al registrar un gasto en este período.</p>}
    </div>
  );
}

function Evolucion({ tramos, indice, seleccionar }) {
  const ancho = 540;
  const alto = 164;
  const valores = [0, ...tramos.map((t) => t.saldo)];
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const amplitud = maximo - minimo || 1;
  const x = (i) => 18 + i / Math.max(1, tramos.length - 1) * (ancho - 36);
  const y = (saldo) => 14 + (maximo - saldo) / amplitud * (alto - 28);
  const puntos = tramos.map((tramo, i) => `${x(i)},${y(tramo.saldo)}`).join(' ');
  return <div className="analisis-evolucion">
    <div className="analisis-escala"><span>{formatearSoles(maximo)}</span><span>{formatearSoles(minimo)}</span></div>
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="analisis-linea-svg" aria-label="Balance acumulado de los movimientos del período">
      {[14, alto / 2, alto - 14].map((posicion) => <line key={posicion} x1="18" x2={ancho - 18} y1={posicion} y2={posicion} stroke="#e6ebe1" strokeDasharray="4 5" />)}
      <line x1="18" x2={ancho - 18} y1={y(0)} y2={y(0)} stroke="#b2c2ad" />
      <polyline points={puntos} fill="none" stroke="#316f50" strokeWidth="3" strokeLinejoin="round" />
      {tramos.map((tramo, i) => <g key={tramo.inicio} role="button" tabIndex="0" aria-label={`${etiquetaTramo(tramo)}: balance ${formatearSoles(tramo.saldo)}`} aria-pressed={i === indice} onClick={() => seleccionar(i)} onKeyDown={(evento) => { if (evento.key === 'Enter' || evento.key === ' ') { evento.preventDefault(); seleccionar(i); } }}><circle cx={x(i)} cy={y(tramo.saldo)} r="14" fill="transparent" /><circle cx={x(i)} cy={y(tramo.saldo)} r={i === indice ? 6 : 4} fill={i === indice ? '#dbbd58' : '#316f50'} stroke="white" strokeWidth="2" pointerEvents="none" /><title>{etiquetaTramo(tramo)}: {formatearSoles(tramo.saldo)}</title></g>)}
    </svg>
    <div className="analisis-fechas-eje"><span>{tramos[0] && fechaCorta(tramos[0].inicio)}</span><span>{tramos.at(-1) && fechaCorta(tramos.at(-1).fin)}</span></div>
  </div>;
}

function PanelAnalisis({ movimientos, demo = false }) {
  const id = useId();
  const hoy = fechaLocal();
  const mes = obtenerPeriodo('mensual');
  const [periodo, setPeriodo] = useState('mensual');
  const [rango, setRango] = useState({ inicio: mes.inicio, fin: hoy });
  const [borrador, setBorrador] = useState(rango);
  const [error, setError] = useState('');
  const [grafico, setGrafico] = useState('barras');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [tramoSeleccionado, setTramoSeleccionado] = useState(null);
  const limites = periodo === 'personalizado' ? rango : obtenerPeriodo(periodo);
  const fin = limites.fin > hoy ? hoy : limites.fin;
  const datos = analizarPeriodo(movimientos, limites.inicio, fin);
  const comparacion = compararMeses(movimientos);
  const categoria = datos.categorias.find((c) => c.id === categoriaSeleccionada);
  const indice = tramoSeleccionado === null ? datos.tramos.length - 1 : Math.min(tramoSeleccionado, datos.tramos.length - 1);
  const tramo = datos.tramos[indice];
  const maximo = Math.max(1, ...datos.tramos.flatMap((t) => [t.ingresos, t.gastos]));
  const seleccionarCategoria = (seleccion) => setCategoriaSeleccionada(categoriaSeleccionada === seleccion ? null : seleccion);

  function cambiarPeriodo(nuevoPeriodo) {
    setPeriodo(nuevoPeriodo);
    setCategoriaSeleccionada(null);
    setTramoSeleccionado(null);
    setError('');
  }

  function aplicarRango(evento) {
    evento.preventDefault();
    const problema = validarRango(borrador.inicio, borrador.fin, hoy);
    setError(problema);
    if (problema) return;
    setRango(borrador);
    setCategoriaSeleccionada(null);
    setTramoSeleccionado(null);
  }

  return <section className="analisis-panel" aria-labelledby={`${id}-titulo`}>
    <div className="analisis-encabezado"><div><span className="inicio-eyebrow">ENTIENDE TUS NÚMEROS</span><h2 id={`${id}-titulo`}>Tu dinero, en perspectiva</h2><p>Toca un gráfico para explorar lo que hay detrás.</p></div>{demo && <span className="analisis-demo">Datos de ejemplo</span>}</div>
    <div className="analisis-filtros" role="group" aria-label="Período del análisis">{PERIODOS.map((opcion) => <button type="button" key={opcion.id} aria-pressed={periodo === opcion.id} onClick={() => cambiarPeriodo(opcion.id)}>{opcion.label}</button>)}</div>
    {periodo === 'personalizado' && <form className="analisis-rango" onSubmit={aplicarRango}><label htmlFor={`${id}-desde`}>Desde<input id={`${id}-desde`} type="date" required max={hoy} value={borrador.inicio} onChange={(e) => setBorrador({ ...borrador, inicio: e.target.value })} /></label><label htmlFor={`${id}-hasta`}>Hasta<input id={`${id}-hasta`} type="date" required max={hoy} value={borrador.fin} onChange={(e) => setBorrador({ ...borrador, fin: e.target.value })} /></label><button type="submit">Aplicar rango</button>{error && <p role="alert">{error}</p>}</form>}
    <p className="analisis-periodo">{formatearFecha(limites.inicio)} — {formatearFecha(fin)} · {datos.movimientos.length} movimientos</p>
    <div className="analisis-grid">
      <section className="analisis-tarjeta analisis-flujo" aria-labelledby={`${id}-flujo`}>
        <div className="analisis-tarjeta-titulo"><h3 id={`${id}-flujo`}>Lo que entra y sale</h3><span>{formatearSoles(datos.balance)}<small>balance del período</small></span></div>
        <div className="analisis-selector" role="group" aria-label="Tipo de gráfico"><button type="button" aria-pressed={grafico === 'barras'} onClick={() => setGrafico('barras')}>Ingresos y gastos</button><button type="button" aria-pressed={grafico === 'linea'} onClick={() => setGrafico('linea')}>Evolución del balance</button></div>
        {grafico === 'barras' ? <><div className="analisis-claves"><span><i />Ingresos</span><span><i />Gastos</span></div><div className="analisis-barras">{datos.tramos.map((actual, i) => <button type="button" key={actual.inicio} aria-pressed={i === indice} onClick={() => setTramoSeleccionado(i)} aria-label={`${etiquetaTramo(actual)}: ingresos ${formatearSoles(actual.ingresos)}, gastos ${formatearSoles(actual.gastos)}`}><svg viewBox="0 0 36 140" aria-hidden="true"><rect x="3" y={134 - actual.ingresos / maximo * 120} width="13" height={Math.max(2, actual.ingresos / maximo * 120)} rx="3" fill={actual.ingresos ? '#42785b' : '#e7ece3'} /><rect x="20" y={134 - actual.gastos / maximo * 120} width="13" height={Math.max(2, actual.gastos / maximo * 120)} rx="3" fill={actual.gastos ? '#d6ac65' : '#e7ece3'} /></svg><span>{actual.inicio.slice(8)}</span></button>)}</div></> : <Evolucion tramos={datos.tramos} indice={indice} seleccionar={setTramoSeleccionado} />}
        {tramo && <div className="analisis-detalle-tramo" aria-live="polite"><strong>{etiquetaTramo(tramo)}</strong><span>Entró <b>{formatearSoles(tramo.ingresos)}</b></span><span>Salió <b>{formatearSoles(tramo.gastos)}</b></span><span>Acumulado <b>{formatearSoles(tramo.saldo)}</b></span></div>}
        <p className="analisis-nota">{grafico === 'linea' ? 'Acumula ingresos menos gastos desde cero al inicio del período; no representa el saldo de una cuenta bancaria.' : 'Cada barra agrupa las fechas indicadas al tocarla.'}{!datos.movimientos.length && ' Aún no hay movimientos en este rango.'}</p>
      </section>
      <section className="analisis-tarjeta" aria-labelledby={`${id}-categorias`}><h3 id={`${id}-categorias`}>¿Dónde se va tu dinero?</h3><p className="analisis-nota">Toca una categoría para ver sus gastos.</p><Dona categorias={datos.categorias} gastos={datos.gastos} seleccion={categoriaSeleccionada} seleccionar={seleccionarCategoria} />
        {categoria && <div className="analisis-categoria-detalle" aria-live="polite"><div><h4>{categoria.label}</h4><button type="button" aria-label="Cerrar detalle de categoría" onClick={() => setCategoriaSeleccionada(null)}>×</button></div><ul>{[...categoria.registros].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((m, i) => <li key={m.id ?? i}><div><strong>{m.descripcion || categoria.label}</strong><span>{formatearFecha(m.fecha)}</span></div><b>{formatearSoles(m.monto)}</b></li>)}</ul></div>}
      </section>
    </div>
    <section className="analisis-insights" aria-labelledby={`${id}-comparacion`}><div><span className="inicio-eyebrow">UNA MIRADA AL MES</span><h3 id={`${id}-comparacion`}>{comparacion.variacion === null ? 'Tu punto de partida' : comparacion.variacion === 0 ? 'Tus gastos se mantienen' : `${Math.abs(comparacion.variacion).toFixed(0)}% ${comparacion.variacion > 0 ? 'más' : 'menos'} en gastos`}</h3><p>{comparacion.variacion === null ? 'Aún no hay gastos registrados en el tramo comparable del mes anterior. Sigue registrando para descubrir tendencias.' : `Registraste ${formatearSoles(Math.abs(comparacion.diferencia))} ${comparacion.diferencia >= 0 ? 'más' : 'menos'} que en el tramo comparable del mes anterior.`}</p></div><div className="analisis-comparacion"><span>Este mes <strong>{formatearSoles(comparacion.actual.gastos)}</strong><small>{fechaCorta(comparacion.periodoActual.inicio)} – {fechaCorta(comparacion.periodoActual.fin)}</small></span><span>Mes anterior <strong>{formatearSoles(comparacion.anterior.gastos)}</strong><small>{fechaCorta(comparacion.periodoAnterior.inicio)} – {fechaCorta(comparacion.periodoAnterior.fin)}</small></span></div><p className="analisis-comparacion-nota">Esta comparación siempre usa el mes actual hasta hoy y las mismas fechas del mes anterior, hasta su último día. Se basa en tus registros.</p></section>
  </section>;
}

export default PanelAnalisis;
