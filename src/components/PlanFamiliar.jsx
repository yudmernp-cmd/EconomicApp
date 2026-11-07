import { useState } from 'react';
import { useMovimientos } from '../storage.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { formatearSoles, formatearFecha, hoyISO } from '../utils/formatos.js';
import { importeValido, validarMeta, resumenMeta, resumenCategorias } from '../utils/planFamiliar.js';
import './PlanFamiliar.css';

function IconoMeta() {
  return <svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5" /><circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 10-10m-4 0h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

function FormularioMeta({ meta, onGuardar, onCancelar }) {
  const [form, setForm] = useState({ nombre: meta?.nombre || '', objetivo: meta?.objetivo || '', fechaLimite: meta?.fechaLimite || '' });
  const [error, setError] = useState('');
  function guardar(evento) {
    evento.preventDefault();
    const problema = validarMeta(form);
    if (problema) { setError(problema); return; }
    try { onGuardar({ ...form, nombre: form.nombre.trim(), objetivo: Math.round(Number(form.objetivo) * 100) / 100 }); }
    catch (fallo) { setError(fallo.message); }
  }
  return <form className="plan-formulario" onSubmit={guardar}>
    <h3>{meta?.id ? 'Editar meta' : 'Una nueva meta'}</h3>
    <label>Nombre de la meta<input required maxLength={60} value={form.nombre} placeholder="Ej. fondo de emergencia" onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
    <div className="plan-form-fila"><label>Objetivo (S/)<input type="number" required min="0.01" max="999999999.99" step="0.01" inputMode="decimal" value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} /></label>
      <label>Fecha límite (opcional)<input type="date" min={hoyISO()} value={form.fechaLimite} onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })} /></label></div>
    {error && <p className="plan-error" role="alert">{error}</p>}
    <div className="plan-acciones"><button className="plan-boton plan-primario" type="submit">Guardar meta</button><button className="plan-boton plan-suave" type="button" onClick={onCancelar}>Cancelar</button></div>
  </form>;
}

function TarjetaMeta({ meta, onEditar, onEliminar, onAportar, onRetirar }) {
  const resumen = resumenMeta(meta);
  const [aportando, setAportando] = useState(false);
  const [monto, setMonto] = useState('');
  const [error, setError] = useState('');
  function aportar(evento) {
    evento.preventDefault();
    if (!importeValido(monto)) { setError('Escribe un aporte positivo con hasta dos decimales.'); return; }
    try { onAportar(meta.id, Math.round(Number(monto) * 100) / 100); setMonto(''); setError(''); setAportando(false); }
    catch (fallo) { setError(fallo.message); }
  }
  return <article className={`plan-meta ${resumen.completada ? 'plan-meta-completa' : ''}`}>
    <div className="plan-meta-cabecera"><span className="plan-meta-icono"><IconoMeta /></span><div><h3>{meta.nombre}</h3><span>{resumen.completada ? '¡Meta alcanzada!' : meta.fechaLimite ? `Para el ${formatearFecha(meta.fechaLimite)}` : 'A tu propio ritmo'}</span></div><button type="button" className="plan-editar" onClick={() => onEditar(meta)} aria-label={`Editar meta ${meta.nombre}`}>Editar</button></div>
    <div className="plan-meta-cifras"><strong>{formatearSoles(resumen.ahorrado)}</strong><span>de {formatearSoles(meta.objetivo)}</span></div>
    <progress max="100" value={Math.min(100, resumen.porcentaje)} aria-label={`Progreso de ${meta.nombre}`} />
    <div className="plan-meta-progreso"><span>{resumen.porcentaje}% completado</span><strong>{resumen.completada ? 'Objetivo cumplido' : `Faltan ${formatearSoles(resumen.falta)}`}</strong></div>
    {!resumen.completada && <p className="plan-meta-consejo">{resumen.dias === null ? 'Cada aporte te acerca. Empieza con el monto que puedas apartar.' : resumen.dias <= 0 ? 'La fecha límite pasó. Puedes cambiarla y seguir ahorrando.' : `Apartando ${formatearSoles(resumen.diario)} al día podrías llegar a tiempo.`}</p>}
    {aportando ? <form className="plan-aporte" onSubmit={aportar}><label htmlFor={`aporte-${meta.id}`}>Aporte a {meta.nombre} (S/)</label><div><input id={`aporte-${meta.id}`} type="number" inputMode="decimal" min="0.01" max="999999999.99" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} /><button type="submit" className="plan-boton plan-primario">Guardar aporte</button></div><button className="plan-editar" type="button" onClick={() => { setAportando(false); setError(''); }}>Cancelar aporte</button></form> : <button type="button" className="plan-boton plan-suave" onClick={() => setAportando(true)}>+ Añadir aporte</button>}
    {error && <p className="plan-error" role="alert">{error}</p>}
    {!!meta.aportes?.length && <details className="plan-aportes"><summary>Ver {meta.aportes.length} {meta.aportes.length === 1 ? 'aporte' : 'aportes'}</summary><ul>{[...meta.aportes].reverse().map((aporte) => <li key={aporte.id}><span>{formatearFecha(aporte.fecha)}</span><strong>{formatearSoles(aporte.monto)}</strong><button type="button" onClick={() => onRetirar(meta.id, aporte)} aria-label={`Retirar aporte de ${formatearSoles(aporte.monto)} de ${meta.nombre}`}>Retirar</button></li>)}</ul></details>}
    <button className="plan-eliminar" type="button" onClick={() => onEliminar(meta)} aria-label={`Eliminar meta ${meta.nombre}`}>Eliminar meta</button>
  </article>;
}

function EditorLimite({ categoria, onGuardar, onCancelar }) {
  const [monto, setMonto] = useState(categoria.limite || '');
  const [error, setError] = useState('');
  return <form className="plan-limite-form" onSubmit={(e) => {
    e.preventDefault();
    if (!importeValido(monto)) { setError('Ingresa un límite positivo con hasta dos decimales.'); return; }
    try { onGuardar(categoria.id, Math.round(Number(monto) * 100) / 100); }
    catch (fallo) { setError(fallo.message); }
  }}><label htmlFor={`limite-${categoria.id}`}>Límite mensual de {categoria.nombre} (S/)</label><div><input id={`limite-${categoria.id}`} type="number" required min="0.01" max="999999999.99" step="0.01" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} /><button type="submit" className="plan-boton plan-primario">Guardar</button><button type="button" className="plan-editar" onClick={onCancelar}>Cancelar</button></div>{error && <p className="plan-error" role="alert">{error}</p>}</form>;
}

export default function PlanFamiliar() {
  const [movimientos] = useMovimientos();
  const [metas, setMetas] = useLocalStorage('finanzas_metas', []);
  const [limites, setLimites] = useLocalStorage('finanzas_presupuestos_categoria', {});
  const [presupuesto] = useLocalStorage('finanzas_presupuesto', { monto: 0 });
  const [vista, setVista] = useState('metas');
  const [editandoMeta, setEditandoMeta] = useState(null);
  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const categorias = resumenCategorias(movimientos, limites);
  const totalLimites = categorias.reduce((suma, c) => suma + Math.round(c.limite * 100), 0) / 100;
  const totalAhorrado = metas.reduce((suma, meta) => suma + Math.round(resumenMeta(meta).ahorrado * 100), 0) / 100;
  function informar(texto) { setError(''); setMensaje(texto); }
  function eliminarMeta(meta) {
    if (!window.confirm(`¿Eliminar la meta «${meta.nombre}» y su historial de aportes? Tus movimientos se conservan.`)) return;
    try { setMetas((prev) => prev.filter((m) => m.id !== meta.id)); informar('Meta eliminada. Tus movimientos se conservan.'); }
    catch (fallo) { setMensaje(''); setError(fallo.message); }
  }
  function retirar(metaId, aporte) {
    if (!window.confirm(`¿Retirar este aporte de ${formatearSoles(aporte.monto)} de la meta?`)) return;
    try { setMetas((prev) => prev.map((m) => m.id === metaId ? { ...m, aportes: m.aportes.filter((a) => a.id !== aporte.id) } : m)); informar('Aporte retirado de la meta.'); }
    catch (fallo) { setMensaje(''); setError(fallo.message); }
  }
  return <section className="plan-familiar" id="plan-familiar" tabIndex="-1" aria-labelledby="plan-titulo">
    <header className="plan-cabecera"><div><span className="plan-eyebrow">DALE UN PROPÓSITO A TUS LUCAS</span><h2 id="plan-titulo">Tu próximo paso</h2><p>Un plan para hoy. Un ahorro para mañana.</p></div><span className="plan-sello"><IconoMeta /></span></header>
    <div className="plan-vistas" role="group" aria-label="Plan familiar"><button aria-pressed={vista === 'metas'} onClick={() => setVista('metas')}>Metas de ahorro <span>{metas.length}</span></button><button aria-pressed={vista === 'presupuestos'} onClick={() => setVista('presupuestos')}>Presupuestos por categoría</button></div>
    {error && <p className="plan-error" role="alert">{error}</p>}
    <p className="plan-status" role="status">{mensaje}</p>
    {vista === 'metas' ? <div className="plan-metas-panel">
      <div className="plan-resumen"><div><span>Dinero apartado en tus metas</span><strong>{formatearSoles(totalAhorrado)}</strong></div><button type="button" className="plan-boton plan-primario" onClick={() => { setEditandoMeta({}); informar(''); }}>+ Nueva meta</button></div>
      <p className="plan-nota">Registra aquí dinero que ya apartaste. Los aportes y retiros de metas no cambian tus ingresos, gastos ni balance.</p>
      {editandoMeta && <FormularioMeta key={editandoMeta.id || editandoMeta.nombre || 'nueva'} meta={editandoMeta} onCancelar={() => setEditandoMeta(null)} onGuardar={(form) => {
        setMetas((prev) => editandoMeta.id ? prev.map((meta) => meta.id === editandoMeta.id ? { ...meta, ...form } : meta) : [...prev, { id: crypto.randomUUID(), ...form, aportes: [] }]);
        setEditandoMeta(null); informar('Meta guardada.');
      }} />}
      {metas.length === 0 && !editandoMeta ? <div className="plan-vacio"><IconoMeta /><h3>¿Para qué te gustaría ahorrar?</h3><p>Elige una idea o crea tu propia meta. Tú decides cuánto y a qué ritmo.</p><div className="plan-ideas">{['Fondo de emergencia', 'Estudios', 'Mi próximo viaje'].map((nombre) => <button type="button" key={nombre} onClick={() => setEditandoMeta({ nombre })}>{nombre}</button>)}</div></div> : <div className="plan-metas-grid">{metas.map((meta) => <TarjetaMeta key={meta.id} meta={meta} onEditar={(m) => { setEditandoMeta(m); informar(''); }} onEliminar={eliminarMeta} onRetirar={retirar} onAportar={(id, monto) => {
        setMetas((prev) => prev.map((m) => m.id === id ? { ...m, aportes: [...(m.aportes || []), { id: crypto.randomUUID(), monto, fecha: hoyISO() }] } : m)); informar('Aporte guardado. ¡Un paso más cerca!');
      }} />)}</div>}
    </div> : <div className="plan-categorias-panel">
      <div className="plan-resumen"><div><span>Total de límites por categoría</span><strong>{formatearSoles(totalLimites)}</strong></div><span className="plan-mes">{new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</span></div>
      <p className="plan-nota">Límites para cada mes calendario. El gasto se calcula con tus movimientos del mes hasta hoy; quitar un límite conserva tus registros.</p>
      {Number(presupuesto.monto) > 0 && totalLimites > Number(presupuesto.monto) && <p className="plan-aviso" role="status">Los límites suman {formatearSoles(totalLimites - Number(presupuesto.monto))} más que tu presupuesto mensual de {formatearSoles(presupuesto.monto)}. Revisa cómo quieres distribuirlo.</p>}
      <div className="plan-categorias-grid">{categorias.map((c) => <article className={`plan-categoria ${c.limite > 0 && c.porcentaje >= 100 ? 'plan-exceso' : c.porcentaje >= 80 ? 'plan-cerca' : ''}`} key={c.id}>
        <div className="plan-categoria-titulo"><h3><span style={{ background: c.color }} />{c.nombre}</h3><button type="button" className="plan-editar" aria-label={`${c.limite ? 'Editar' : 'Crear'} límite de ${c.nombre}`} onClick={() => setEditandoCategoria(c.id)}>{c.limite ? 'Editar' : '+ Definir'}</button></div>
        <div className="plan-categoria-cifras"><strong>{formatearSoles(c.gastado)}</strong><span>{c.limite ? `de ${formatearSoles(c.limite)}` : 'gastado · sin límite'}</span></div>
        {c.limite > 0 && <><progress max="100" value={Math.min(100, c.porcentaje)} aria-label={`Presupuesto utilizado de ${c.nombre}`} /><p className="plan-categoria-estado">{c.restante < 0 ? `Excedido en ${formatearSoles(-c.restante)}` : c.restante === 0 ? 'Límite alcanzado' : `${c.porcentaje >= 80 ? 'Cerca del límite · ' : ''}Quedan ${formatearSoles(c.restante)}`}</p></>}
        {editandoCategoria === c.id && <EditorLimite key={c.id} categoria={c} onCancelar={() => setEditandoCategoria(null)} onGuardar={(id, monto) => { setLimites((prev) => ({ ...prev, [id]: monto })); setEditandoCategoria(null); informar(`Límite de ${c.nombre} guardado.`); }} />}
        {c.limite > 0 && <button type="button" className="plan-eliminar" aria-label={`Quitar límite de ${c.nombre}`} onClick={() => { try { setLimites((prev) => { const nuevos = { ...prev }; delete nuevos[c.id]; return nuevos; }); setEditandoCategoria(null); informar(`Límite de ${c.nombre} eliminado.`); } catch (fallo) { setMensaje(''); setError(fallo.message); } }}>Quitar límite</button>}
      </article>)}</div>
    </div>}
  </section>;
}
