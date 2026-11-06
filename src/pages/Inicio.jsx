import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMovimientos, usePerfil, calcularResumen } from '../storage.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { formatearSoles, formatearFecha, hoyISO } from '../utils/formatos.js';
import { obtenerPeriodo } from '../utils/finanzas.js';
import './Inicio.css';

function Flecha({ entrada = false }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={entrada ? { transform: 'rotate(180deg)' } : undefined}><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const CATEGORIAS = [
  { id: 'comida', label: 'Alimentación', icono: '◒', color: '#ca8042' },
  { id: 'casa', label: 'Vivienda', icono: '⌂', color: '#2b795c' },
  { id: 'pasaje', label: 'Transporte', icono: <Flecha />, color: '#5484aa' },
  { id: 'salud', label: 'Salud', icono: '+', color: '#be6878' },
  { id: 'escuela', label: 'Educación', icono: '▤', color: '#8a74ae' },
  { id: 'gusto', label: 'Gustos', icono: '☆', color: '#b39835' },
  { id: 'otro', label: 'Otros', icono: '···', color: '#77857b' },
];
const INGRESOS = { sueldo: 'Sueldo', venta: 'Ventas', regalo: 'Regalo', otro: 'Otro ingreso' };
const CICLOS = { semanal: 'Esta semana', quincenal: 'Esta quincena', mensual: 'Este mes', irregular: 'Este mes' };

function Presupuesto({ gastos, mes }) {
  const [presupuesto, setPresupuesto] = useLocalStorage('finanzas_presupuesto', { monto: 0 });
  const limite = Number(presupuesto?.monto) || 0;
  const [editando, setEditando] = useState(false);
  const [monto, setMonto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const porcentaje = limite > 0 ? Math.round(gastos / limite * 100) : 0;
  const restante = Math.round((limite - gastos) * 100) / 100;

  function guardar(evento) {
    evento.preventDefault();
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0 || valor > 999999999.99) {
      setError('Ingresa un monto mayor que cero y menor a S/ 1 000 000 000.');
      return;
    }
    try {
      setPresupuesto({ monto: Math.round(valor * 100) / 100 });
      setEditando(false);
      setMensaje('Presupuesto guardado.');
      setError('');
    } catch (fallo) {
      setMensaje('');
      setError(fallo.message);
    }
  }

  function quitarLimite() {
    try {
      setPresupuesto({ monto: 0 });
      setMensaje('Límite eliminado. Tus movimientos se conservan.');
      setError('');
    } catch (fallo) {
      setMensaje('');
      setError(fallo.message);
    }
  }

  return (
    <section className={`inicio-panel inicio-presupuesto ${limite && restante < 0 ? 'presupuesto-excedido' : ''}`} aria-labelledby="presupuesto-titulo">
      <div className="inicio-panel-heading">
        <div>
          <span className="inicio-eyebrow">TU PLAN DEL MES</span>
          <h2 id="presupuesto-titulo">Presupuesto familiar</h2>
        </div>
        <span className="inicio-panel-symbol" aria-hidden="true">◎</span>
      </div>
      <p className="inicio-ayuda">Un límite de gastos para cuidar tus lucas. Se aplica a cada mes calendario.</p>
      {limite > 0 ? (
        <>
          <div className="presupuesto-cifras"><strong>{formatearSoles(gastos)}</strong><span>de {formatearSoles(limite)}</span></div>
          <progress aria-label={`Presupuesto de ${mes} utilizado`} max="100" value={Math.min(100, porcentaje)} />
          <div className="presupuesto-estado"><span>{porcentaje}% utilizado · {mes}</span><strong>{restante < 0 ? 'Límite superado' : 'Dentro del límite'}</strong></div>
          <p className="presupuesto-restante">{restante < 0 ? <>Te excediste en <strong>{formatearSoles(-restante)}</strong>.</> : <>Te quedan <strong>{formatearSoles(restante)}</strong> para gastar este mes.</>}</p>
        </>
      ) : <div className="presupuesto-sin-limite"><strong>Un pequeño plan, más tranquilidad.</strong><p>Ya registraste {formatearSoles(gastos)} en gastos este mes. Define cuánto quieres gastar en total.</p></div>}
      {editando ? (
        <form className="presupuesto-form" onSubmit={guardar}>
          <label htmlFor="presupuesto-monto">Límite mensual (S/)</label>
          <input id="presupuesto-monto" type="number" inputMode="decimal" min="0.01" max="999999999.99" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'presupuesto-error' : undefined} autoFocus />
          <div className="presupuesto-form-acciones"><button type="submit" className="inicio-btn inicio-btn-verde">Guardar límite</button><button type="button" className="inicio-btn inicio-btn-suave" onClick={() => { setEditando(false); setError(''); }}>Cancelar</button></div>
        </form>
      ) : (
        <div className="presupuesto-form-acciones">
          <button className="inicio-btn inicio-btn-suave" onClick={() => { setMonto(limite ? String(limite) : ''); setEditando(true); setMensaje(''); setError(''); }}>{limite ? 'Editar presupuesto' : '+ Crear presupuesto'}</button>
          {limite > 0 && <button className="inicio-text-button" onClick={quitarLimite}>Quitar límite</button>}
        </div>
      )}
      {error && <p id="presupuesto-error" role="alert">{error}</p>}
      <p className="inicio-status" role="status">{mensaje}</p>
    </section>
  );
}

function Inicio() {
  const [movimientos] = useMovimientos();
  const [perfil] = usePerfil();
  const resumen = calcularResumen(movimientos, perfil);
  const hoy = hoyISO();
  const periodo = obtenerPeriodo(perfil.cicloIngreso);
  const mesActual = obtenerPeriodo('mensual');
  const delCiclo = movimientos.filter((m) => m.fecha >= periodo.inicio && m.fecha <= periodo.fin && m.fecha <= hoy);
  const gastosMes = movimientos.filter((m) => m.tipo === 'gasto' && m.fecha >= mesActual.inicio && m.fecha <= hoy).reduce((suma, m) => suma + Math.round(Number(m.monto) * 100), 0) / 100;
  const categorias = CATEGORIAS.map((categoria) => {
    const total = delCiclo.filter((m) => m.tipo === 'gasto' && (m.categoria === categoria.id || (categoria.id === 'otro' && !CATEGORIAS.some((c) => c.id === m.categoria)))).reduce((suma, m) => suma + Math.round(Number(m.monto) * 100), 0) / 100;
    return { ...categoria, total, porcentaje: resumen.gastos > 0 ? total / resumen.gastos * 100 : 0 };
  });
  const recientes = [...movimientos].filter((m) => m.fecha <= hoy).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 4);
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const mes = new Date().toLocaleDateString('es-PE', { month: 'long' });

  return (
    <div className="inicio-dashboard">
      <header className="inicio-cabecera">
        <div><span className="inicio-eyebrow">TU FAMILIA, EN ORDEN</span><h1>{saludo},<br /><span>{perfil.nombreFamilia || 'familia'}.</span></h1><p>Cada decisión pequeña cuenta.</p></div>
        <Link className="inicio-avatar" to="/perfil" aria-label="Ver perfil de la familia">{(perfil.nombreFamilia || 'F').charAt(0).toUpperCase()}</Link>
      </header>
      <div className="inicio-periodo"><span className="inicio-periodo-punto" />{CICLOS[perfil.cicloIngreso] || 'Este mes'}<span>{formatearFecha(periodo.inicio)} — {formatearFecha(periodo.fin)}</span></div>

      <section className="inicio-balance" aria-labelledby="balance-titulo">
        <div className="inicio-balance-top"><span id="balance-titulo">Balance de tu familia</span><span className="inicio-balance-insignia">EN SOLES · PEN</span></div>
        <div className="inicio-balance-monto">{formatearSoles(resumen.disponible)}</div>
        <p>{resumen.disponible < 0 ? 'Tus gastos superan los ingresos registrados en este período.' : 'La diferencia entre lo que entra y lo que sale en este período.'}</p>
        <div className="inicio-balance-bottom"><span>{resumen.diasRestantes} {resumen.diasRestantes === 1 ? 'día restante' : 'días restantes'} del período</span><Link to="/mi-plata" className="inicio-btn inicio-btn-amarillo"><span aria-hidden="true">+</span> Registrar movimiento</Link></div>
      </section>

      <div className="inicio-metricas">
        <section className="inicio-metrica"><span className="inicio-metrica-icono entrada" aria-hidden="true"><Flecha entrada /></span><div><span>Ingresos del período</span><strong>{formatearSoles(resumen.ingresos)}</strong></div></section>
        <section className="inicio-metrica"><span className="inicio-metrica-icono salida" aria-hidden="true"><Flecha /></span><div><span>Gastos del período</span><strong>{formatearSoles(resumen.gastos)}</strong></div></section>
      </div>

      <div className="inicio-grid">
        <section className="inicio-panel" aria-labelledby="categorias-titulo">
          <div className="inicio-panel-heading"><div><span className="inicio-eyebrow">CADA SOL TIENE SU LUGAR</span><h2 id="categorias-titulo">¿En qué se va tu plata?</h2></div></div>
          <p className="inicio-ayuda">Distribución de los gastos de este período.</p>
          <div className="inicio-categorias-lista">{categorias.map((cat) => <div key={cat.id} className="inicio-categoria-fila"><span className="inicio-categoria-icono" style={{ color: cat.color }} aria-hidden="true">{cat.icono}</span><div className="inicio-categoria-detalle"><div><span>{cat.label}</span><strong>{formatearSoles(cat.total)}</strong></div><div className="inicio-categoria-barra"><span style={{ width: `${Math.min(100, cat.porcentaje)}%`, background: cat.color }} /></div></div><span className="inicio-categoria-porcentaje">{Math.round(cat.porcentaje)}%</span></div>)}</div>
          {resumen.gastos === 0 && <p className="inicio-ayuda inicio-sin-gastos">Registra tu primer gasto para ver cómo se distribuye.</p>}
        </section>
        <Presupuesto gastos={gastosMes} mes={mes} />
      </div>

      <section className="inicio-panel inicio-recientes" aria-labelledby="recientes-titulo">
        <div className="inicio-panel-heading"><div><span className="inicio-eyebrow">PASO A PASO</span><h2 id="recientes-titulo">Últimos movimientos</h2></div><Link to="/mi-plata" className="inicio-text-link">Ver todos <span aria-hidden="true"><Flecha /></span></Link></div>
        {recientes.length === 0 ? <div className="inicio-vacio"><span className="inicio-vacio-icono" aria-hidden="true"><Flecha /></span><h3>Tu historia empieza con un movimiento</h3><p>Anota un ingreso o un gasto. Aquí verás cómo avanza la economía de tu familia.</p><Link to="/mi-plata" className="inicio-btn inicio-btn-verde">Registrar mi primer movimiento</Link></div> : <ul className="inicio-recientes-lista">{recientes.map((movimiento) => {
          const categoria = CATEGORIAS.find((c) => c.id === movimiento.categoria) || CATEGORIAS.at(-1);
          const ingreso = movimiento.tipo === 'ingreso';
          const etiqueta = ingreso ? (INGRESOS[movimiento.categoria] || 'Ingreso') : categoria.label;
          return <li key={movimiento.id}><span className={`inicio-reciente-icono ${ingreso ? 'entrada' : 'salida'}`} aria-hidden="true">{ingreso ? <Flecha entrada /> : categoria.icono}</span><div className="inicio-reciente-info"><strong>{movimiento.descripcion || etiqueta}</strong><span>{etiqueta} · {formatearFecha(movimiento.fecha)}</span></div><strong className={`inicio-reciente-monto ${ingreso ? 'entrada' : ''}`}>{ingreso ? '+' : '−'} {formatearSoles(movimiento.monto)}</strong></li>;
        })}</ul>}
      </section>
      <div className="inicio-explora"><Link to="/prestamos"><span aria-hidden="true"><Flecha /></span><div><strong>Antes de pedir un préstamo</strong><p>Compara cuánto pagarías realmente.</p></div><span aria-hidden="true">→</span></Link><Link to="/aprende"><span aria-hidden="true">✦</span><div><strong>Aprende a cuidar tus lucas</strong><p>Ideas sencillas para tu día a día.</p></div><span aria-hidden="true">→</span></Link></div>
    </div>
  );
}

export default Inicio;
