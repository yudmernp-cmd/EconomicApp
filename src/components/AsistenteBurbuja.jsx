import { useState, useEffect, useRef } from 'react';
import {
  useMovimientos,
  usePerfil,
  useDeudas,
  calcularResumen,
  calcularTotalDeudas,
} from '../storage.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import {
  generarRespuesta,
  generarSugerencia,
  sugerenciasRapidas,
} from '../utils/asistente.js';
import './AsistenteBurbuja.css';

function AsistenteBurbuja() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      de: 'bot',
      texto:
        '¡Hola! Soy tu asistente financiero. Puedo darte consejos y responder tus dudas sobre dinero. ¿En qué te ayudo?',
    },
  ]);
  const [input, setInput] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [sugerencia, setSugerencia] = useState(null);
  const [tieneNueva, setTieneNueva] = useState(false);
  const chatRef = useRef(null);

  const [movimientos] = useMovimientos();
  const [perfil] = usePerfil();
  const [deudas] = useDeudas();
  const [leccionesVistas] = useLocalStorage('finanzas_lecciones_vistas', []);

  const resumen = calcularResumen(movimientos, perfil);
  const { total: totalDeudas, cuotaMensual: cuotaDeudas } =
    calcularTotalDeudas(deudas);

  const hoy = new Date().toISOString().split('T')[0];
  const movimientosRecientes = movimientos.filter(
    (m) => m.fecha === hoy
  ).length;

  const contexto = {
    resumen,
    totalDeudas,
    cuotaDeudas,
    perfil,
    movimientosRecientes,
    leccionesVistas: leccionesVistas.length,
  };

  useEffect(() => {
    const s = generarSugerencia(contexto);
    setSugerencia(s);
    setTieneNueva(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes, escribiendo]);

  const abrir = () => {
    setAbierto(true);
    setTieneNueva(false);
  };

  const enviar = async (texto) => {
    const t = (texto || input).trim();
    if (!t) return;

    setMensajes((prev) => [...prev, { de: 'user', texto: t }]);
    setInput('');
    setEscribiendo(true);

    try {
      const respuesta = await generarRespuesta(t, contexto);
      setMensajes((prev) => [...prev, { de: 'bot', texto: respuesta }]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          de: 'bot',
          texto: 'Lo siento, tuve un problema. Intenta de nuevo.',
        },
      ]);
    } finally {
      setEscribiendo(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="asistente-wrapper">
      {!abierto && (
        <button
          className="asistente-burbuja"
          onClick={abrir}
          aria-label="Abrir asistente"
        >
          <span className="asistente-burbuja-icono">🤖</span>
          {tieneNueva && <span className="asistente-burbuja-punto"></span>}
        </button>
      )}

      {abierto && (
        <div className="asistente-panel">
          <div className="asistente-encabezado">
            <div className="asistente-titulo">
              <span className="asistente-avatar">🤖</span>
              <div>
                <div className="asistente-nombre">Asistente financiero</div>
                <div className="asistente-estado">En línea</div>
              </div>
            </div>
            <button
              className="asistente-cerrar"
              onClick={() => setAbierto(false)}
            >
              ×
            </button>
          </div>

          {sugerencia && (
            <div className={`asistente-sugerencia tipo-${sugerencia.tipo}`}>
              {sugerencia.mensaje}
            </div>
          )}

          <div className="asistente-chat" ref={chatRef}>
            {mensajes.map((m, i) => (
              <div
                key={i}
                className={
                  m.de === 'bot'
                    ? 'asistente-mensaje bot'
                    : 'asistente-mensaje user'
                }
              >
                <div className="asistente-burbuja-texto">{m.texto}</div>
              </div>
            ))}
            {escribiendo && (
              <div className="asistente-mensaje bot">
                <div className="asistente-burbuja-texto escribiendo">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className="asistente-rapidas">
            {sugerenciasRapidas().map((s, i) => (
              <button
                key={i}
                className="asistente-rapida"
                onClick={() => enviar(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="asistente-input-fila">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe tu pregunta..."
              className="asistente-input"
              maxLength={200}
            />
            <button
              className="asistente-enviar"
              onClick={() => enviar()}
              disabled={!input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AsistenteBurbuja;