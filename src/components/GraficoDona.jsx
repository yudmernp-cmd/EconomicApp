import { useState, useEffect, useMemo, useRef } from 'react';
import { formatearSoles } from '../utils/formatos.js';
import './GraficoDona.css';

// Un color por categoría (usa los tokens de estilos globales)
const COLORES = {
  comida: 'var(--rojo-500)',
  pasaje: 'var(--azul-600)',
  salud: 'var(--purpura-600)',
  casa: 'var(--naranja-500)',
  escuela: 'var(--verde-600)',
  gusto: 'var(--amarillo-500)',
  otro: 'var(--gris-400)',
};

const RADIO = 70;
const ANCHO = 26;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;
const HUECO = 3; // separación visual entre porciones

// Hace que un número "cuente" suavemente hasta su nuevo valor
function useNumeroAnimado(objetivo, duracion = 700) {
  const [valor, setValor] = useState(0);
  const previo = useRef(0);

  useEffect(() => {
    const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducir) {
      previo.current = objetivo;
      setValor(objetivo);
      return;
    }
    const desde = previo.current;
    const inicio = performance.now();
    let raf;
    const paso = (ahora) => {
      const p = Math.min((ahora - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const v = desde + (objetivo - desde) * suave;
      previo.current = v;
      setValor(v);
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [objetivo, duracion]);

  return valor;
}

const formatearPorcentaje = (fraccion) => {
  const p = fraccion * 100;
  return p > 0 && p < 1 ? '<1%' : `${Math.round(p)}%`;
};

/**
 * Props:
 *  - movimientos: lista ya filtrada (por mes, ciclo, etc.)
 *  - categorias: [{ id, label }] de gastos, para mostrar los nombres
 */
function GraficoDona({ movimientos, categorias }) {
  const [seleccion, setSeleccion] = useState(null);
  const [montado, setMontado] = useState(false);

  // Las porciones arrancan en 0 y se "dibujan" al montar
  useEffect(() => {
    const id = setTimeout(() => setMontado(true), 60);
    return () => clearTimeout(id);
  }, []);

  const { datos, total } = useMemo(() => {
    const suma = {};
    movimientos
      .filter((m) => m.tipo === 'gasto')
      .forEach((m) => {
        suma[m.categoria] = (suma[m.categoria] || 0) + Number(m.monto || 0);
      });

    const entradas = Object.entries(suma).filter(([, monto]) => monto > 0);
    const totalGastado = entradas.reduce((acc, [, monto]) => acc + monto, 0);

    let acumulado = 0;
    const lista = entradas
      .map(([id, monto]) => ({
        id,
        monto,
        label: categorias.find((c) => c.id === id)?.label || 'Otro',
        fraccion: monto / totalGastado,
        color: COLORES[id] || COLORES.otro,
      }))
      .sort((a, b) => b.monto - a.monto)
      .map((d) => {
        const largo = d.fraccion * CIRCUNFERENCIA;
        const item = { ...d, largo, inicio: acumulado };
        acumulado += largo;
        return item;
      });

    return { datos: lista, total: totalGastado };
  }, [movimientos, categorias]);

  const activo = datos.find((d) => d.id === seleccion) || null;
  const montoMostrado = useNumeroAnimado(activo ? activo.monto : total);

  const alternar = (id) => setSeleccion((actual) => (actual === id ? null : id));

  // ---------- Estado vacío ----------
  if (datos.length === 0) {
    return (
      <section className="dona-tarjeta" aria-label="Gastos por categoría">
        <div className="dona-grafico">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle
              className="dona-pista"
              cx="100"
              cy="100"
              r={RADIO}
              fill="none"
              strokeWidth={ANCHO}
            />
          </svg>
          <div className="dona-centro">
            <div className="dona-centro-contenido">
              <span className="dona-centro-etiqueta">Sin gastos</span>
              <span className="dona-centro-sub">en este periodo</span>
            </div>
          </div>
        </div>
        <p className="dona-mensaje">
          Registra un gasto y aquí verás en qué se va tu plata.
        </p>
      </section>
    );
  }

  const principal = datos[0];

  return (
    <section className="dona-tarjeta" aria-label="Gastos por categoría">
      <div className="dona-grafico">
        <svg
          viewBox="0 0 200 200"
          className={activo ? 'dona-svg tiene-activo' : 'dona-svg'}
          role="group"
          aria-label={`Gastos por categoría. Total ${formatearSoles(total)}`}
        >
          <g transform="rotate(-90 100 100)">
            <circle
              className="dona-pista"
              cx="100"
              cy="100"
              r={RADIO}
              fill="none"
              strokeWidth={ANCHO}
            />
            {datos.map((d, i) => {
              const hueco = datos.length > 1 ? HUECO : 0;
              const visible = Math.max(d.largo - hueco, 0.01);
              const largo = montado ? visible : 0;
              const esActivo = activo?.id === d.id;

              return (
                <circle
                  key={d.id}
                  className={esActivo ? 'dona-segmento activo' : 'dona-segmento'}
                  cx="100"
                  cy="100"
                  r={RADIO}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={esActivo ? ANCHO + 6 : ANCHO}
                  strokeDasharray={`${largo} ${CIRCUNFERENCIA}`}
                  strokeDashoffset={-(d.inicio + hueco / 2)}
                  style={{ '--retraso': `${i * 90}ms` }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={esActivo}
                  aria-label={`${d.label}: ${formatearSoles(d.monto)}, ${formatearPorcentaje(d.fraccion)}`}
                  onClick={() => alternar(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternar(d.id);
                    }
                  }}
                />
              );
            })}
          </g>
        </svg>

        <div className="dona-centro" aria-live="polite">
          <div className="dona-centro-contenido" key={activo?.id || 'total'}>
            <span className="dona-centro-etiqueta">
              {activo ? activo.label : 'Gastaste'}
            </span>
            <span className="dona-centro-monto">{formatearSoles(montoMostrado)}</span>
            <span className="dona-centro-sub">
              {activo
                ? `${formatearPorcentaje(activo.fraccion)} de tus gastos`
                : 'en este periodo'}
            </span>
          </div>
        </div>
      </div>

      <p className="dona-mensaje">
        {datos.length === 1
          ? `Todo lo que gastaste fue en ${principal.label}.`
          : `${principal.label} es lo que más pesa: ${formatearPorcentaje(principal.fraccion)} de tus gastos.`}
      </p>

      <ul className="dona-leyenda">
        {datos.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              className={activo?.id === d.id ? 'dona-fila activo' : 'dona-fila'}
              onClick={() => alternar(d.id)}
              aria-pressed={activo?.id === d.id}
            >
              <span className="dona-punto" style={{ background: d.color }} />
              <span className="dona-fila-label">{d.label}</span>
              <span className="dona-fila-monto">{formatearSoles(d.monto)}</span>
              <span className="dona-fila-pct">{formatearPorcentaje(d.fraccion)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default GraficoDona;