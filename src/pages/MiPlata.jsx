import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMovimientos, usePerfil, agregarMovimiento, eliminarMovimiento } from '../storage.js';
import { formatearSoles, formatearFecha, hoyISO } from '../utils/formatos.js';
import { obtenerPeriodo } from '../utils/finanzas.js';
import { filtrarHistorial, movimientosCSV, validarMovimiento } from '../utils/movimientos.js';
import Card from '../components/Card.jsx';
import GraficoDona from '../components/GraficoDona.jsx';
import './MiPlata.css';

// Diccionario de íconos SVG
const ICONOS = {
  comida: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2V10M8 2V8M16 2V8M8 12H16M12 10V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 10C4 6.68629 6.68629 4 10 4H14C17.3137 4 20 6.68629 20 10V16C20 19.3137 17.3137 22 14 22H10C6.68629 22 4 19.3137 4 16V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  pasaje: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 17H5C3.89543 17 3 16.1046 3 15V9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V15C21 16.1046 20.1046 17 19 17Z" stroke="currentColor" strokeWidth="2"/><path d="M7 17V19M17 17V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  salud: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="currentColor" strokeWidth="2"/></svg>,
  casa: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10L12 3L21 10V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  escuela: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7L12 3L21 7L12 11L3 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M6 10V15C6 15 8 18 12 18C16 18 18 15 18 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  gusto: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2"/><path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  venta: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  sueldo: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  regalo: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 12V22H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 7H2V12H22V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7H7.5C6.11929 7 5 5.88071 5 4.5C5 3.11929 6.11929 2 7.5 2C11 2 12 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7H16.5C17.8807 7 19 5.88071 19 4.5C19 3.11929 17.8807 2 16.5 2C13 2 12 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  otro: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></svg>,
};

// AHORA TENEMOS DOS LISTAS SEPARADAS
const CATEGORIAS_GASTO = [
  { id: 'comida', label: 'Comida' },
  { id: 'pasaje', label: 'Pasaje' },
  { id: 'salud', label: 'Salud' },
  { id: 'casa', label: 'Casa' },
  { id: 'escuela', label: 'Escuela' },
  { id: 'gusto', label: 'Gusto' },
  { id: 'otro', label: 'Otro' },
];

const CATEGORIAS_INGRESO = [
  { id: 'sueldo', label: 'Sueldo' },
  { id: 'venta', label: 'Ventas' },
  { id: 'regalo', label: 'Regalo' },
  { id: 'otro', label: 'Otro' },
];

const FILTROS = [
  { id: 'ciclo', label: 'Este ciclo' },
  { id: 'mes', label: 'Este mes' },
  { id: 'todo', label: 'Todo' },
];

function FlechaMovimiento({ entrada = false, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" style={{ verticalAlign: 'middle' }}>
      <path d={entrada ? 'M18 6 6 18M6 7v11h11' : 'M6 18 18 6M7 6h11v11'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiPlata() {
  const [params] = useSearchParams();
  const tipoInicial = params.get('tipo') === 'ingreso' ? 'ingreso' : 'gasto';
  const [movimientos, setMovimientos] = useMovimientos();
  const [perfil] = usePerfil();
  const [tipo, setTipo] = useState(tipoInicial);
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(tipoInicial === 'gasto' ? 'comida' : 'sueldo');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [filtro, setFiltro] = useState('mes');
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const montoRef = useRef(null);
  const formRef = useRef(null);
  const categoriasActuales = tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO;
  const todasCategorias = [...CATEGORIAS_GASTO, ...CATEGORIAS_INGRESO];
  const periodo = obtenerPeriodo(filtro === 'mes' ? 'mensual' : perfil.cicloIngreso);
  const listaFiltrada = filtrarHistorial(movimientos, {
    busqueda, tipo: filtroTipo,
    inicio: filtro === 'todo' ? null : periodo.inicio,
    fin: filtro === 'todo' ? null : periodo.fin,
    categorias: todasCategorias,
  });
  const total = (tipoMovimiento) => listaFiltrada
    .filter((m) => m.tipo === tipoMovimiento)
    .reduce((sum, m) => sum + Math.round(Number(m.monto) * 100), 0) / 100;

  const cambiarTipo = (nuevoTipo) => {
    setTipo(nuevoTipo);
    setCategoria(nuevoTipo === 'gasto' ? 'comida' : 'sueldo');
  };

  const limpiarFormulario = () => {
    setEditando(null);
    setMonto('');
    setDescripcion('');
    setFecha(hoyISO());
    setError('');
  };

  const guardar = (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    const movimiento = { tipo, monto: Number(monto), categoria, descripcion: descripcion.trim(), fecha };
    const problema = validarMovimiento(movimiento, hoyISO());
    if (problema) { setError(problema); return; }
    movimiento.monto = Math.round(movimiento.monto * 100) / 100;
    try {
      if (editando !== null) {
        setMovimientos((prev) => prev.map((m) => m.id === editando ? { ...m, ...movimiento } : m));
      } else {
        agregarMovimiento(setMovimientos, movimiento);
      }
      setMensaje(editando !== null ? 'Movimiento actualizado.' : 'Movimiento guardado.');
      limpiarFormulario();
    } catch (problemaGuardado) {
      setError(problemaGuardado.message);
    }
  };

  const editar = (movimiento) => {
    setEditando(movimiento.id);
    setTipo(movimiento.tipo);
    setMonto(String(movimiento.monto));
    setCategoria(movimiento.categoria);
    setDescripcion(movimiento.descripcion || '');
    setFecha(movimiento.fecha);
    setError('');
    setMensaje('');
    formRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    montoRef.current?.focus({ preventScroll: true });
  };

  const exportar = () => {
    const blob = new Blob([movimientosCSV(listaFiltrada, todasCategorias)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `mis-movimientos-${hoyISO()}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMensaje(`Archivo preparado con ${listaFiltrada.length} movimientos.`);
  };

  return (
    <div className="miplata-contenedor">
      <header className="miplata-cabecera">
        <div>
          <span className="miplata-eyebrow">CADA SOL CUENTA</span>
          <h1>Mi plata</h1>
          <p className="miplata-subtitulo">Un lugar para entender lo que entra y lo que sale.</p>
        </div>
        <span className="miplata-insignia">Tus finanzas, a tu ritmo</span>
      </header>
      <p className="miplata-feedback" role="status">{mensaje}</p>
      {error && <p role="alert" className="miplata-error">{error}</p>}
      <div className="miplata-layout">
        <aside className="miplata-registro">
          <Card className="miplata-form-card">
            <form onSubmit={guardar} ref={formRef}>
              <div className="miplata-form-titulo">
                <span className="miplata-form-signo" aria-hidden="true">{editando !== null ? <FlechaMovimiento size={19} /> : '+'}</span>
                <h2>{editando !== null ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
              </div>
              <div className="miplata-tipo-selector" role="group" aria-label="Tipo de movimiento">
                {['gasto', 'ingreso'].map((opcion) => (
                  <button key={opcion} type="button" aria-pressed={tipo === opcion}
                    className={`miplata-btn-tipo ${tipo === opcion ? `activo-${opcion}` : ''}`}
                    onClick={() => cambiarTipo(opcion)}>
                    <span aria-hidden="true"><FlechaMovimiento entrada={opcion === 'ingreso'} /></span> {opcion === 'gasto' ? 'Gasto' : 'Ingreso'}
                  </button>
                ))}
              </div>
              <label className="miplata-campo">
                <span className="miplata-label">Monto (S/)</span>
                <input ref={montoRef} type="number" inputMode="decimal" step="0.01" min="0.01" max="999999999.99" required
                  value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" className="miplata-input miplata-input-monto" />
              </label>
              <fieldset className="miplata-categorias-grupo">
                <legend className="miplata-label">Categoría</legend>
                <div className="miplata-categorias">
                  {categoriasActuales.map((cat) => (
                    <button key={cat.id} type="button" aria-pressed={categoria === cat.id}
                      className={`miplata-btn-cat ${categoria === cat.id ? 'activo' : ''}`} onClick={() => setCategoria(cat.id)}>
                      <span className="miplata-btn-cat-icono" aria-hidden="true">{ICONOS[cat.id]}</span>
                      <span className="miplata-btn-cat-label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="miplata-campo">
                <span className="miplata-label">Descripción <span className="miplata-opcional">(opcional)</span></span>
                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                  placeholder={tipo === 'gasto' ? 'Ej. compras para la semana' : 'Ej. pago de quincena'} className="miplata-input" maxLength={100} />
              </label>
              <label className="miplata-campo">
                <span className="miplata-label">Fecha</span>
                <input type="date" required min="1900-01-01" max={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} className="miplata-input" />
              </label>
              <button type="submit" className="miplata-btn-guardar">{editando !== null ? 'Guardar cambios' : 'Guardar movimiento'} <span aria-hidden="true">→</span></button>
              {editando !== null && <button type="button" className="miplata-btn-cancelar" onClick={limpiarFormulario}>Cancelar edición</button>}
            </form>
          </Card>
          <p className="miplata-nota">Tus registros se guardan en este navegador. Descarga una copia para conservarlos.</p>
        </aside>
        <section className="miplata-historial" aria-labelledby="historial-titulo">
          <div className="miplata-historial-header">
            <div><h2 id="historial-titulo">Tus movimientos</h2><p>Revisa, encuentra y organiza tus cuentas.</p></div>
            <button type="button" className="miplata-exportar" onClick={exportar} disabled={!listaFiltrada.length}>
              <span aria-hidden="true">↓</span> Descargar CSV
            </button>
          </div>
          <div className="miplata-filtros" role="group" aria-label="Período del historial">
            {FILTROS.map((f) => <button type="button" key={f.id} aria-pressed={filtro === f.id}
              className={`miplata-btn-filtro ${filtro === f.id ? 'activo' : ''}`} onClick={() => setFiltro(f.id)}>{f.label}</button>)}
          </div>
          <div className="miplata-buscador">
            <label className="miplata-busqueda"><span className="miplata-label">Buscar movimiento</span>
              <input type="search" placeholder="Descripción o categoría…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </label>
            <div><label className="miplata-label" htmlFor="miplata-filtro-tipo">Tipo</label>
              <select id="miplata-filtro-tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="todos">Todos</option><option value="ingreso">Ingresos</option><option value="gasto">Gastos</option>
              </select>
            </div>
          </div>
          <div className="miplata-totales" aria-label="Totales de los resultados">
            <div><span>Ingresos</span><strong className="miplata-positivo">{formatearSoles(total('ingreso'))}</strong></div>
            <div><span>Gastos</span><strong>{formatearSoles(total('gasto'))}</strong></div>
            <div><span>Balance</span><strong className={total('ingreso') - total('gasto') < 0 ? 'miplata-negativo' : 'miplata-positivo'}>{formatearSoles(total('ingreso') - total('gasto'))}</strong></div>
          </div>
          <p className="miplata-conteo" aria-live="polite">{listaFiltrada.length} {listaFiltrada.length === 1 ? 'movimiento encontrado' : 'movimientos encontrados'}</p>
          {listaFiltrada.length === 0 ? (
            <div className="miplata-vacio">
              <span className="miplata-vacio-icono" aria-hidden="true"><FlechaMovimiento entrada size={28} /><FlechaMovimiento size={28} /></span>
              <h3>{movimientos.length ? 'No encontramos coincidencias' : 'Tu historia empieza con un movimiento'}</h3>
              <p>{movimientos.length ? 'Prueba otro período, tipo o término de búsqueda.' : 'Registra tu primer ingreso o gasto. Aquí verás cómo se mueve tu dinero.'}</p>
              {movimientos.length > 0 && <button type="button" className="miplata-btn-cancelar" onClick={() => { setFiltro('todo'); setFiltroTipo('todos'); setBusqueda(''); }}>Limpiar filtros</button>}
            </div>
          ) : (
            <ul className="miplata-lista">
              {listaFiltrada.map((m) => {
                const catObj = todasCategorias.find((c) => c.id === m.categoria);
                const nombre = m.descripcion || catObj?.label || 'Movimiento';
                return (
                  <li key={m.id} className={`miplata-item ${editando === m.id ? 'miplata-item-editando' : ''}`}>
                    <span className={`miplata-item-icono ${m.tipo}`} aria-hidden="true">{ICONOS[m.categoria] || ICONOS.otro}</span>
                    <div className="miplata-item-info">
                      <span className="miplata-item-desc" title={nombre}>{nombre}</span>
                      <span className="miplata-item-fecha">{catObj?.label || 'Otro'} · {formatearFecha(m.fecha)}</span>
                    </div>
                    <span className={`miplata-item-monto ${m.tipo === 'ingreso' ? 'verde' : 'rojo'}`}>{m.tipo === 'ingreso' ? '+' : '−'} {formatearSoles(m.monto)}</span>
                    <div className="miplata-item-acciones">
                      <button type="button" className="miplata-item-editar" aria-label={`Editar ${nombre}`} onClick={() => editar(m)}>Editar</button>
                      <button type="button" className="miplata-item-eliminar" aria-label={`Eliminar ${nombre}`} onClick={() => {
                        if (window.confirm(`¿Eliminar «${nombre}»? Esta acción no se puede deshacer.`)) {
                          setMensaje('');
                          setError('');
                          try {
                            eliminarMovimiento(setMovimientos, m.id);
                            if (editando === m.id) limpiarFormulario();
                            setMensaje('Movimiento eliminado.');
                          } catch (problemaGuardado) {
                            setError(problemaGuardado.message);
                          }
                        }
                      }}>×</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {listaFiltrada.some((m) => m.tipo === 'gasto') && <div className="miplata-distribucion"><h2>¿En qué se va tu plata?</h2><GraficoDona movimientos={listaFiltrada} categorias={CATEGORIAS_GASTO} /></div>}
        </section>
      </div>
    </div>
  );
}

export default MiPlata;
