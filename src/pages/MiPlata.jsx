import { useState } from 'react';
import {
  useMovimientos,
  agregarMovimiento,
  eliminarMovimiento,
} from '../storage.js';
import { formatearSoles, formatearFecha, hoyISO } from '../utils/formatos.js';
import Card from '../components/Card.jsx';
import './MiPlata.css';

// Diccionario de íconos SVG para reemplazar emojis
const ICONOS = {
  comida: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2V10M8 2V8M16 2V8M8 12H16M12 10V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 10C4 6.68629 6.68629 4 10 4H14C17.3137 4 20 6.68629 20 10V16C20 19.3137 17.3137 22 14 22H10C6.68629 22 4 19.3137 4 16V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  pasaje: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 17H5C3.89543 17 3 16.1046 3 15V9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V15C21 16.1046 20.1046 17 19 17Z" stroke="currentColor" strokeWidth="2"/><path d="M7 17V19M17 17V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  salud: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="currentColor" strokeWidth="2"/></svg>,
  casa: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10L12 3L21 10V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  escuela: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7L12 3L21 7L12 11L3 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M6 10V15C6 15 8 18 12 18C16 18 18 15 18 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  gusto: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2"/><path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  venta: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  otro: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></svg>,
};

const CATEGORIAS = [
  { id: 'comida', label: 'Comida' },
  { id: 'pasaje', label: 'Pasaje' },
  { id: 'salud', label: 'Salud' },
  { id: 'casa', label: 'Casa' },
  { id: 'escuela', label: 'Escuela' },
  { id: 'gusto', label: 'Gusto' },
  { id: 'venta', label: 'Venta' },
  { id: 'otro', label: 'Otro' },
];

const FILTROS = [
  { id: 'ciclo', label: 'Este ciclo' },
  { id: 'mes', label: 'Este mes' },
  { id: 'todo', label: 'Todo' },
];

function MiPlata() {
  const [movimientos, setMovimientos] = useMovimientos();
  const [tipo, setTipo] = useState('gasto');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('comida');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [filtro, setFiltro] = useState('todo');

  const guardar = (e) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (!montoNum || montoNum <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    agregarMovimiento(setMovimientos, {
      tipo,
      monto: montoNum,
      categoria,
      descripcion: descripcion.trim(),
      fecha,
    });
    setMonto('');
    setDescripcion('');
    setFecha(hoyISO());
  };

  const filtrarMovimientos = () => {
    const hoy = new Date();
    let desde = null;

    if (filtro === 'mes') {
      desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    } else if (filtro === 'ciclo') {
      desde = new Date();
      desde.setDate(hoy.getDate() - 7);
    }

    const lista = desde
      ? movimientos.filter((m) => new Date(m.fecha) >= desde)
      : movimientos;

    return [...lista].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  const listaFiltrada = filtrarMovimientos();

  return (
    <div className="miplata-contenedor">
      <h1>Mi Plata</h1>
      <p className="miplata-subtitulo">Registra tus ingresos y gastos de forma rápida.</p>

      <Card className="miplata-form-card">
        <form onSubmit={guardar}>
          <div className="miplata-tipo-selector">
            <button
              type="button"
              className={tipo === 'gasto' ? 'miplata-btn-tipo activo-gasto' : 'miplata-btn-tipo'}
              onClick={() => setTipo('gasto')}
            >
              Gasto
            </button>
            <button
              type="button"
              className={tipo === 'ingreso' ? 'miplata-btn-tipo activo-ingreso' : 'miplata-btn-tipo'}
              onClick={() => setTipo('ingreso')}
            >
              Ingreso
            </button>
          </div>

          <label className="miplata-campo">
            <span className="miplata-label">Monto (S/)</span>
            <input
              type="number"
              step="0.10"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              className="miplata-input"
            />
          </label>

          <span className="miplata-label">Categoría</span>
          <div className="miplata-categorias">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={categoria === cat.id ? 'miplata-btn-cat activo' : 'miplata-btn-cat'}
                onClick={() => setCategoria(cat.id)}
              >
                <span className="miplata-btn-cat-icono">{ICONOS[cat.id]}</span>
                <span className="miplata-btn-cat-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <label className="miplata-campo">
            <span className="miplata-label">Descripción (opcional)</span>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: almuerzo, pasaje al mercado"
              className="miplata-input"
              maxLength={50}
            />
          </label>

          <label className="miplata-campo">
            <span className="miplata-label">Fecha</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="miplata-input"
            />
          </label>

          <button type="submit" className="miplata-btn-guardar">
            Guardar Movimiento
          </button>
        </form>
      </Card>

      <h2 className="miplata-historial-titulo">Historial</h2>

      <div className="miplata-filtros">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            className={filtro === f.id ? 'miplata-btn-filtro activo' : 'miplata-btn-filtro'}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {listaFiltrada.length === 0 ? (
        <p className="miplata-vacio">No hay movimientos todavía.</p>
      ) : (
        <div className="miplata-lista">
          {listaFiltrada.map((m) => (
            <div key={m.id} className="miplata-item">
              <span className={`miplata-item-icono ${m.tipo}`}>
                {ICONOS[m.categoria] || ICONOS.otro}
              </span>
              <div className="miplata-item-info">
                <span className="miplata-item-desc">
                  {m.descripcion || CATEGORIAS.find((c) => c.id === m.categoria)?.label}
                </span>
                <span className="miplata-item-fecha">{formatearFecha(m.fecha)}</span>
              </div>
              <span className={m.tipo === 'ingreso' ? 'miplata-item-monto verde' : 'miplata-item-monto rojo'}>
                {m.tipo === 'ingreso' ? '+' : '−'} {formatearSoles(m.monto)}
              </span>
              <button
                className="miplata-item-eliminar"
                onClick={() => {
                  if (confirm('¿Eliminar este movimiento?')) {
                    eliminarMovimiento(setMovimientos, m.id);
                  }
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MiPlata; 