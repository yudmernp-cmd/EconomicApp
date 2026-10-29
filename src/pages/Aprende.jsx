import { useState } from 'react';
import { LECCIONES } from '../utils/Lecciones.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import Card from '../components/Card.jsx';
import './Aprende.css';

// Función para mezclar arreglos (preguntas y opciones)
const mezclarArreglo = (arr) => [...arr].sort(() => Math.random() - 0.5);

const ICONOS_LECCIONES = {
  1: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2V10M8 2V8M16 2V8M8 12H16M12 10V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 10C4 6.68629 6.68629 4 10 4H14C17.3137 4 20 6.68629 20 10V16C20 19.3137 17.3137 22 14 22H10C6.68629 22 4 19.3137 4 16V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  2: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9V14M12 17H12.01M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  3: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 1V23M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  4: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 17H15M9 13H15M9 9H11M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  5: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  6: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/><path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  7: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/></svg>,
  8: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21V19C23 16.7909 21.2091 15 19 15H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="17" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>,
};

function Aprende() {
  const [leccionesVistas, setLeccionesVistas] = useLocalStorage('finanzas_lecciones_vistas', []);
  const [leccionActiva, setLeccionActiva] = useState(null);
  
  // Estados del Quiz
  const [preguntasQuiz, setPreguntasQuiz] = useState([]);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [respuestaElegida, setRespuestaElegida] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [quizTerminado, setQuizTerminado] = useState(false);

  // Iniciar lección y preparar quiz aleatorio
  const iniciarLeccion = (id) => {
    const leccion = LECCIONES.find((l) => l.id === id);
    
    // Mezclar las preguntas y las opciones de cada pregunta
    const preguntasMezcladas = mezclarArreglo(leccion.preguntas).map((p) => ({
      ...p,
      opciones: mezclarArreglo(p.opciones),
      // Volvemos a buscar el índice de la respuesta correcta tras mezclar
      indiceCorrecto: p.opciones.indexOf(p.opciones[p.correcta]) === -1 ? p.correcta : p.opciones.indexOf(p.opciones[p.correcta])
    }));

    // TRUCO: Al mezclar las opciones, el índice de la respuesta correcta cambia.
    // Creamos un arreglo temporal para encontrar el nuevo índice.
    const preguntasListas = mezclarArreglo(leccion.preguntas).map((p) => {
      const opcionesMezcladas = mezclarArreglo(p.opciones);
      const textoCorrecto = p.opciones[p.correcta];
      return {
        ...p,
        opciones: opcionesMezcladas,
        correcta: opcionesMezcladas.indexOf(textoCorrecto)
      };
    });

    setLeccionActiva(id);
    setPreguntasQuiz(preguntasListas);
    setIndicePregunta(0);
    setRespuestaElegida(null);
    setMostrarFeedback(false);
    setAciertos(0);
    setQuizTerminado(false);
  };

  const responder = (index) => {
    if (mostrarFeedback) return;
    setRespuestaElegida(index);
    setMostrarFeedback(true);
    
    if (index === preguntasQuiz[indicePregunta].correcta) {
      setAciertos(aciertos + 1);
    }
  };

  const siguientePregunta = () => {
    if (indicePregunta < preguntasQuiz.length - 1) {
      setIndicePregunta(indicePregunta + 1);
      setRespuestaElegida(null);
      setMostrarFeedback(false);
    } else {
      setQuizTerminado(true);
      // Si acertó al menos 2, marcamos la lección como vista
      if (aciertos >= 2 && !leccionesVistas.includes(leccionActiva)) {
        setLeccionesVistas([...leccionesVistas, leccionActiva]);
      }
    }
  };

  const cerrar = () => {
    setLeccionActiva(null);
  };

  // ================= VISTA DE LECCIÓN Y QUIZ =================
  if (leccionActiva) {
    const leccion = LECCIONES.find((l) => l.id === leccionActiva);

    if (quizTerminado) {
      const aprobado = aciertos >= 2;
      return (
        <div className="aprende-contenedor">
          <button className="aprende-btn-volver" onClick={cerrar}>← Volver</button>
          <Card className="aprende-contenido-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>
              {aprobado ? '¡Felicidades! 🎉' : 'Sigue intentando 💪'}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--gris-600)', marginBottom: '20px' }}>
              Has acertado <strong>{aciertos} de {preguntasQuiz.length}</strong> preguntas.
            </p>
            {aprobado ? (
              <p style={{ color: 'var(--verde-700)', fontWeight: '600' }}>Has completado la lección.</p>
            ) : (
              <p style={{ color: '#DC2626', fontWeight: '600' }}>Necesitas acertar al menos 2 para completarla.</p>
            )}
            <button className="aprende-btn-terminar" onClick={cerrar} style={{ marginTop: '30px' }}>
              Terminar
            </button>
          </Card>
        </div>
      );
    }

    const preguntaActual = preguntasQuiz[indicePregunta];
    const esCorrecta = respuestaElegida === preguntaActual.correcta;

    return (
      <div className="aprende-contenedor">
        <button className="aprende-btn-volver" onClick={cerrar}>← Volver</button>
        
        <div className="aprende-detalle-header">
          <span className="aprende-detalle-icono">{ICONOS_LECCIONES[leccion.id]}</span>
          <h1 className="aprende-detalle-titulo">{leccion.titulo}</h1>
        </div>

        <Card className="aprende-contenido-card">
          {leccion.contenido.map((p, i) => <p key={i} className="aprende-parrafo">{p}</p>)}
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 className="aprende-pregunta-titulo">Pregunta {indicePregunta + 1} de {preguntasQuiz.length}</h2>
          <span style={{ fontSize: '12px', color: 'var(--verde-700)', fontWeight: '700' }}>Aciertos: {aciertos}</span>
        </div>

        <Card>
          <p className="aprende-pregunta">{preguntaActual.texto}</p>
          <div className="aprende-opciones">
            {preguntaActual.opciones.map((op, i) => {
              let clase = 'aprende-btn-opcion';
              if (mostrarFeedback) {
                if (i === preguntaActual.correcta) clase += ' opcion-correcta';
                else if (i === respuestaElegida) clase += ' opcion-incorrecta';
              }
              return <button key={i} className={clase} onClick={() => responder(i)} disabled={mostrarFeedback}>{op}</button>;
            })}
          </div>
          
          {mostrarFeedback && (
            <div className={esCorrecta ? 'aprende-respuesta correcto' : 'aprende-respuesta incorrecto'}>
              {esCorrecta ? '¡Muy bien! Has acertado.' : 'No es la respuesta correcta.'}
            </div>
          )}
        </Card>

        {mostrarFeedback && (
          <button className="aprende-btn-terminar" onClick={siguientePregunta}>
            {indicePregunta === preguntasQuiz.length - 1 ? 'Ver resultados' : 'Siguiente pregunta'}
          </button>
        )}
      </div>
    );
  }

  // ================= VISTA DE LISTA DE LECCIONES =================
  return (
    <div className="aprende-contenedor">
      <h1>Aprende</h1>
      <p className="aprende-subtitulo">Lecciones cortas para manejar mejor tu dinero.</p>

      <div className="aprende-progreso">
        <div className="aprende-progreso-texto">
          <span>Progreso</span>
          <span>{leccionesVistas.length} de {LECCIONES.length}</span>
        </div>
        <div className="aprende-progreso-barra">
          <div className="aprende-progreso-fill" style={{ width: `${(leccionesVistas.length / LECCIONES.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="aprende-lista">
        {LECCIONES.map((lec) => {
          const vista = leccionesVistas.includes(lec.id);
          return (
            <button key={lec.id} className={`aprende-btn-leccion ${vista ? 'vista' : ''}`} onClick={() => iniciarLeccion(lec.id)}>
              <span className={`aprende-btn-icono ${vista ? 'completada' : ''}`}>{ICONOS_LECCIONES[lec.id]}</span>
              <span className="aprende-btn-titulo">{lec.titulo}</span>
              {vista && (
                <span className="aprende-btn-check">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Aprende;