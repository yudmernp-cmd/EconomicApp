import { Link } from 'react-router-dom';
import { useMovimientos, usePerfil, calcularResumen } from '../storage.js';
import { formatearSoles } from '../utils/formatos.js';
import Semaforo from '../components/Semaforo.jsx';
import Card from '../components/Card.jsx';
import './Inicio.css';

function Inicio() {
  const [movimientos] = useMovimientos();
  const [perfil] = usePerfil();
  const resumen = calcularResumen(movimientos, perfil);

  const mensajes = {
    verde: 'Vas bien, te alcanza hasta el próximo ingreso.',
    amarillo: 'Cuidado, te queda poco dinero. Gasta con cuidado.',
    rojo: 'Peligro, no te alcanza. Revisa tus gastos.',
  };

  return (
    <div>
      <h1>Hola, {perfil.nombreFamilia}</h1>
      <p className="subtitulo">Resumen de tu ciclo actual</p>

      <Card className="card-estado">
        <div className="estado-encabezado">
          <Semaforo estado={resumen.estado} />
          <span className="estado-texto">{mensajes[resumen.estado]}</span>
        </div>

        <div className="estado-monto">
          <span className="monto-grande">
            {formatearSoles(resumen.disponible)}
          </span>
          <span className="monto-label">
            disponibles para {resumen.diasRestantes}{' '}
            {resumen.diasRestantes === 1 ? 'día' : 'días'}
          </span>
        </div>

        {resumen.disponible > 0 && (
          <p className="estado-detalle">
            Puedes gastar hasta{' '}
            <strong>{formatearSoles(resumen.disponiblePorDia)}</strong> por día
          </p>
        )}
      </Card>

      <div className="resumen-fila">
        <Card className="resumen-mini">
          <span className="mini-label">Ingresos</span>
          <span className="mini-valor verde">
            + {formatearSoles(resumen.ingresos)}
          </span>
        </Card>
        <Card className="resumen-mini">
          <span className="mini-label">Gastos</span>
          <span className="mini-valor rojo">
            − {formatearSoles(resumen.gastos)}
          </span>
        </Card>
      </div>

      <h2 className="acciones-titulo">Acciones rápidas</h2>

      <div className="acciones">
        <Link to="/mi-plata" className="accion">
          <span className="accion-icon">💰</span>
          <span className="accion-label">Registrar</span>
        </Link>
        <Link to="/prestamos" className="accion">
          <span className="accion-icon">🚨</span>
          <span className="accion-label">Préstamos</span>
        </Link>
        <Link to="/aprende" className="accion">
          <span className="accion-icon">🎓</span>
          <span className="accion-label">Aprende</span>
        </Link>
      </div>
    </div>
  );
}

export default Inicio;