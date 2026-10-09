import { useState } from 'react';
import { LECCIONES } from '../utils/Lecciones.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import Card from '../components/Card.jsx';
import './Aprende.css';

function Aprende() {
  const [leccionesVistas, setLeccionesVistas] = useLocalStorage(
    'finanzas_lecciones_vistas',
    []
  );
  const [leccionActiva, setLeccionActiva] = useState(null);
  const [respuestaElegida, setRespuestaElegida] = useState(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // Vista de detalle de lección
  if (leccionActiva) {
    const leccion = LECCIONES.find((l) => l.id === leccionActiva);
    const esCorrecta =
      respuestaElegida === leccion.pregunta.correcta;

    const responder = (index) => {
      if (mostrarResultado) return;
      setRespuestaElegida(index);
      setMostrarResultado(true);
      if (index === leccion.pregunta.correcta) {
        if (!leccionesVistas.includes(leccion.id)) {
          setLeccionesVistas([...leccionesVistas, leccion.id]);
        }
      }
    };

    const cerrar = () => {
      setLeccionActiva(null);
      setRespuestaElegida(null);
      setMostrarResultado(false);
    };

    return (
      <div>
        <button className="boton-volver" onClick={cerrar}>
          ← Volver
        </button>

        <div className="leccion-encabezado">
          <span className="leccion-icono">{leccion.icono}</span>
          <h1 className="leccion-titulo">{leccion.titulo}</h1>
        </div>

        <Card>
          {leccion.contenido.map((parrafo, i) => (
            <p key={i} className="leccion-parrafo">
              {parrafo}
            </p>
          ))}
        </Card>

        <h2 className="pregunta-titulo">Pon a prueba lo aprendido</h2>

        <Card>
          <p className="pregunta-texto">{leccion.pregunta.texto}</p>

          <div className="opciones">
            {leccion.pregunta.opciones.map((op, i) => {
              let clase = 'opcion-btn';
              if (mostrarResultado) {
                if (i === leccion.pregunta.correcta) {
                  clase += ' opcion-correcta';
                } else if (i === respuestaElegida) {
                  clase += ' opcion-incorrecta';
                }
              }
              return (
                <button
                  key={i}
                  className={clase}
                  onClick={() => responder(i)}
                  disabled={mostrarResultado}
                >
                  {op}
                </button>
              );
            })}
          </div>

          {mostrarResultado && (
            <div
              className={
                esCorrecta
                  ? 'resultado-pregunta correcto'
                  : 'resultado-pregunta incorrecto'
              }
            >
              {esCorrecta
                ? '✅ ¡Muy bien!'
                : '❌ No es la respuesta correcta.'}
            </div>
          )}
        </Card>

        {mostrarResultado && (
          <button className="boton-guardar" onClick={cerrar}>
            Terminar lección
          </button>
        )}
      </div>
    );
  }

  // Vista de lista de lecciones
  return (
    <div>
      <h1>Aprende</h1>
      <p className="subtitulo">
        Lecciones cortas de educación financiera
      </p>

      <div className="progreso">
        <div className="progreso-texto">
          {leccionesVistas.length} de {LECCIONES.length} completadas
        </div>
        <div className="progreso-barra">
          <div
            className="progreso-relleno"
            style={{
              width: `${
                (leccionesVistas.length / LECCIONES.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      <div className="lista-lecciones">
        {LECCIONES.map((lec) => {
          const vista = leccionesVistas.includes(lec.id);
          return (
            <button
              key={lec.id}
              className={`leccion-item ${vista ? 'vista' : ''}`}
              onClick={() => setLeccionActiva(lec.id)}
            >
              <span className="leccion-item-icono">{lec.icono}</span>
              <span className="leccion-item-titulo">{lec.titulo}</span>
              {vista && <span className="leccion-item-check">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Aprende;