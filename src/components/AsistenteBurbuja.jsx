import { useState, useEffect, useRef } from 'react';
import { useMovimientos, usePerfil, useDeudas, calcularResumen, calcularTotalDeudas } from '../storage.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { generarRespuesta, generarSugerencia, sugerenciasRapidas } from '../utils/asistente.js';
import { hoyISO, formatearSoles } from '../utils/formatos.js';
import { obtenerPeriodo } from '../utils/finanzas.js';
import './AsistenteBurbuja.css';

const CATEGORIAS = { comida: 'Alimentación', casa: 'Vivienda', pasaje: 'Transporte', salud: 'Salud', escuela: 'Educación', gusto: 'Gustos', otro: 'Otros' };

function Destello({ size = 24 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M20 2v4M18 4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

export default function AsistenteBurbuja() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [fallo, setFallo] = useState(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const solicitudRef = useRef(null);
  const [movimientos] = useMovimientos();
  const [perfil] = usePerfil();
  const [deudas] = useDeudas();
  const [leccionesVistas] = useLocalStorage('finanzas_lecciones_vistas', []);
  const [presupuesto] = useLocalStorage('finanzas_presupuesto', { monto: 0 });
  const [presupuestosCategoria] = useLocalStorage('finanzas_presupuestos_categoria', {});
  const [metas] = useLocalStorage('finanzas_metas', []);
  const resumen = calcularResumen(movimientos, perfil);
  const { total: totalDeudas, cuotaMensual: cuotaDeudas } = calcularTotalDeudas(deudas);
  const hoy = hoyISO();
  const mes = obtenerPeriodo('mensual');
  const gastos = movimientos.filter((m) => m.tipo === 'gasto' && m.fecha >= mes.inicio && m.fecha <= hoy);
  const gastosMes = gastos.reduce((suma, m) => suma + Math.round(Number(m.monto) * 100), 0) / 100;
  const gastosPorCategoria = Object.entries(CATEGORIAS).map(([id, label]) => ({ id, label, total: gastos.filter((m) => m.categoria === id || (id === 'otro' && !CATEGORIAS[m.categoria])).reduce((suma, m) => suma + Math.round(Number(m.monto) * 100), 0) / 100 }));
  const contexto = { resumen, totalDeudas, cuotaDeudas, perfil, leccionesVistas: leccionesVistas.length, presupuesto, presupuestosCategoria, metas, gastosMes, gastosPorCategoria };
  const sugerencia = generarSugerencia(contexto);

  useEffect(() => {
    if (!abierto) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    dialog.showModal();
    inputRef.current?.focus();
    return () => { dialog.close(); trigger?.focus(); };
  }, [abierto]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [mensajes, escribiendo, fallo, abierto]);

  useEffect(() => () => solicitudRef.current?.abort(), []);

  async function enviar(texto, reintento = false) {
    const pregunta = texto.trim();
    if (!pregunta || solicitudRef.current) return;
    const controller = new AbortController();
    solicitudRef.current = controller;
    setFallo(null);
    if (!reintento) setMensajes((prev) => [...prev, { de: 'user', texto: pregunta }]);
    setInput('');
    setEscribiendo(true);
    try {
      const respuesta = await generarRespuesta(pregunta, contexto, { signal: controller.signal });
      setMensajes((prev) => [...prev, { de: 'bot', ...respuesta }]);
    } catch (error) {
      setFallo({ texto: error.message, pregunta });
    } finally {
      solicitudRef.current = null;
      setEscribiendo(false);
      if (dialogRef.current?.open) inputRef.current?.focus();
    }
  }

  return (
    <>
      <div className="asist-launcher"><button ref={triggerRef} type="button" className="asist-trigger" aria-label="Abrir asistente" aria-haspopup="dialog" aria-expanded={abierto} onClick={() => setAbierto(true)}><Destello /><span>Hablemos de tus lucas</span></button></div>
      <dialog ref={dialogRef} className="asist-dialog" aria-labelledby="asist-title" onKeyDown={(e) => {
        if (e.key !== 'Tab') return;
        const elementos = [...e.currentTarget.querySelectorAll('button:not(:disabled), textarea, a[href], [tabindex="0"]')].filter((el) => el.getClientRects().length);
        const primero = elementos[0];
        const ultimo = elementos.at(-1);
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo?.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero?.focus(); }
      }} onCancel={(e) => { e.preventDefault(); setAbierto(false); }} onClose={() => setAbierto(false)}>
        <div className="asist-shell">
          <header className="asist-header">
            <div className="asist-avatar"><Destello size={27} /></div>
            <div className="asist-heading"><span>TU COMPAÑERO FINANCIERO</span><h2 id="asist-title">Hablemos de tus lucas</h2><p>Un paso a la vez, en familia.</p></div>
            <button type="button" className="asist-close" aria-label="Cerrar asistente" onClick={() => setAbierto(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></button>
          </header>
          <div className="asist-chat" ref={chatRef} role="log" aria-label="Conversación con el asistente" aria-live="polite" aria-relevant="additions text">
            <div className="asist-welcome">
              <span className="asist-eyebrow">UN POCO DE CLARIDAD</span><h3>Tu dinero tiene una historia.<br />Vamos a entenderla.</h3><p>{sugerencia}</p>
              <div className="asist-summary"><span>Balance del período<strong>{formatearSoles(resumen.disponible)}</strong></span><span>Gastos de este mes<strong>{formatearSoles(gastosMes)}</strong></span></div>
              <span className="asist-local-note">Las preguntas rápidas se calculan con tus registros.</span>
            </div>
            {mensajes.map((mensaje, indice) => <div key={indice} className={`asist-message ${mensaje.de}`}><span className="asist-message-author">{mensaje.de === 'user' ? 'Tú' : mensaje.origen === 'local' ? 'Tus registros · cálculo local' : 'Asistente · IA'}</span><p>{mensaje.texto}</p></div>)}
            {escribiendo && <div className="asist-thinking" role="status"><span aria-hidden="true"><i /><i /><i /></span>Preparando tu respuesta…</div>}
            {fallo && <div className="asist-error" role="alert"><p>{fallo.texto}</p><button type="button" onClick={() => enviar(fallo.pregunta, true)}>Reintentar consulta</button></div>}
          </div>
          <div className="asist-bottom">
            <div className="asist-quick" aria-label="Preguntas rápidas">{sugerenciasRapidas().map((texto) => <button type="button" key={texto} disabled={escribiendo} onClick={() => enviar(texto)}>{texto}</button>)}</div>
            <form className="asist-compose" onSubmit={(e) => { e.preventDefault(); enviar(input); }}>
              <label className="asist-sr-only" htmlFor="asist-input">Tu pregunta</label><textarea id="asist-input" ref={inputRef} rows="2" maxLength={500} value={input} onChange={(e) => setInput(e.target.value)} placeholder="¿Qué te gustaría entender mejor?" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); enviar(input); } }} />
              {escribiendo ? <button type="button" className="asist-send" aria-label="Cancelar consulta" onClick={() => solicitudRef.current?.abort()}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg></button> : <button className="asist-send" type="submit" disabled={!input.trim()} aria-label="Enviar pregunta"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>}
            </form>
            <div className="asist-footer"><span>Para preguntas libres usamos IA. Revisa sus sugerencias.</span><span>{input.length}/500</span></div>
          </div>
        </div>
      </dialog>
    </>
  );
}
