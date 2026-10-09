import { useState } from 'react';
import {
  useDeudas,
  usePerfil,
  agregarDeuda,
  eliminarDeuda,
  calcularPrestamo,
  calcularTotalDeudas,
} from '../storage.js';
import { buscarPrestamista, evaluarRiesgo } from '../simulador.js';
import { formatearSoles } from '../utils/formatos.js';
import Card from '../components/Card.jsx';
import Semaforo from '../components/Semaforo.jsx';
import './Prestamos.css';

const UNIDADES_DURACION = [
  { id: 'semana', label: 'Semana(s)' },
  { id: 'mes', label: 'Mes(es)' },
  { id: 'bimestre', label: 'Bimestre(s)' },
  { id: 'trimestre', label: 'Trimestre(s)' },
  { id: 'semestre', label: 'Semestre(s)' },
  { id: 'año', label: 'Año(s)' },
];

const FRECUENCIAS = [
  { id: 'diaria', label: 'Diaria' },
  { id: 'semanal', label: 'Semanal' },
  { id: 'quincenal', label: 'Quincenal' },
  { id: 'mensual', label: 'Mensual' },
];

function Prestamos() {
  const [deudas, setDeudas] = useDeudas();
  const [perfil] = usePerfil();

  // Simulador
  const [monto, setMonto] = useState('');
  const [valorCuota, setValorCuota] = useState('');
  const [duracion, setDuracion] = useState('1');
  const [unidadDuracion, setUnidadDuracion] = useState('mes');
  const [frecuencia, setFrecuencia] = useState('semanal');
  const [resultado, setResultado] = useState(null);

  // Buscador
  const [busqueda, setBusqueda] = useState('');
  const resultados = buscarPrestamista(busqueda);

  // Formulario deuda
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevaDeuda, setNuevaDeuda] = useState({
    nombre: '',
    montoTotal: '',
    cuotaMensual: '',
  });

  const simular = (e) => {
    e.preventDefault();
    const m = parseFloat(monto);
    const vc = parseFloat(valorCuota);
    const d = parseFloat(duracion);

    if (!m || !vc || !d || m <= 0 || vc <= 0 || d <= 0) {
      alert('Completa todos los campos correctamente');
      return;
    }

    const calc = calcularPrestamo(m, vc, d, unidadDuracion, frecuencia);
    const riesgo = evaluarRiesgo(calc.interesAnualEstimado);
    setResultado({ ...calc, riesgo });
  };

  const guardarDeuda = (e) => {
    e.preventDefault();
    const montoTotal = parseFloat(nuevaDeuda.montoTotal);
    const cuotaMensual = parseFloat(nuevaDeuda.cuotaMensual);

    if (!nuevaDeuda.nombre.trim() || !montoTotal || !cuotaMensual) {
      alert('Completa todos los campos');
      return;
    }

    agregarDeuda(setDeudas, {
      nombre: nuevaDeuda.nombre.trim(),
      montoTotal,
      cuotaMensual,
    });

    setNuevaDeuda({ nombre: '', montoTotal: '', cuotaMensual: '' });
    setMostrarForm(false);
  };

  const { total, cuotaMensual } = calcularTotalDeudas(deudas);

  const ingresoMensual =
    perfil.cicloIngreso === 'semanal'
      ? perfil.ingresoEstimado * 4
      : perfil.cicloIngreso === 'quincenal'
      ? perfil.ingresoEstimado * 2
      : perfil.ingresoEstimado;

  const porcentajeComprometido =
    ingresoMensual > 0 ? (cuotaMensual / ingresoMensual) * 100 : 0;

  let estadoDeuda = 'verde';
  if (porcentajeComprometido > 60) estadoDeuda = 'rojo';
  else if (porcentajeComprometido > 40) estadoDeuda = 'amarillo';

  const labelUnidad = UNIDADES_DURACION.find(
    (u) => u.id === unidadDuracion
  )?.label.toLowerCase();

  const labelFrecuencia = FRECUENCIAS.find(
    (f) => f.id === frecuencia
  )?.label.toLowerCase();

  return (
    <div>
      <h1>Préstamos</h1>
      <p className="subtitulo">
        Antes de pedir prestado, calcula cuánto vas a pagar.
      </p>

      {/* ====== SIMULADOR ====== */}
      <h2 className="seccion-titulo">Simulador de deuda</h2>

      <Card>
        <form onSubmit={simular}>
          <label className="campo">
            <span className="campo-label">¿Cuánto te prestan? (S/)</span>
            <input
              type="number"
              step="0.10"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 2000"
              className="campo-input"
            />
          </label>

          <label className="campo">
            <span className="campo-label">Valor de cada cuota (S/)</span>
            <input
              type="number"
              step="0.10"
              min="0"
              value={valorCuota}
              onChange={(e) => setValorCuota(e.target.value)}
              placeholder="Ej: 150"
              className="campo-input"
            />
          </label>

          <span className="campo-label">¿Durante cuánto tiempo pagarás?</span>
          <div className="duracion-fila">
            <input
              type="number"
              min="1"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              placeholder="Ej: 3"
              className="campo-input campo-duracion"
            />
            <select
              value={unidadDuracion}
              onChange={(e) => setUnidadDuracion(e.target.value)}
              className="campo-input campo-unidad"
            >
              {UNIDADES_DURACION.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <span className="campo-label">¿Cada cuánto pagas la cuota?</span>
          <div className="frecuencias">
            {FRECUENCIAS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={
                  frecuencia === f.id
                    ? 'frecuencia-btn activo'
                    : 'frecuencia-btn'
                }
                onClick={() => setFrecuencia(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button type="submit" className="boton-guardar">
            Calcular
          </button>
        </form>
      </Card>

      {resultado && (
        <Card className={`card-resultado card-${resultado.riesgo.nivel}`}>
          <div className="resultado-encabezado">
            <Semaforo estado={resultado.riesgo.nivel} />
            <span className="resultado-titulo">{resultado.riesgo.texto}</span>
          </div>

          <div className="resultado-fila">
            <span className="resultado-label">Vas a pagar en total</span>
            <span className="resultado-valor">
              {formatearSoles(resultado.totalPagar)}
            </span>
          </div>

          <div className="resultado-fila">
            <span className="resultado-label">Interés total</span>
            <span className="resultado-valor rojo">
              + {formatearSoles(resultado.interes)}
            </span>
          </div>

          <div className="resultado-fila">
            <span className="resultado-label">Equivale a</span>
            <span className="resultado-valor">
              {resultado.porcentaje.toFixed(0)}% del monto
            </span>
          </div>

          <div className="resultado-fila">
            <span className="resultado-label">Número de cuotas</span>
            <span className="resultado-valor">
              {resultado.numeroCuotas}
            </span>
          </div>

          <div className="resultado-fila">
            <span className="resultado-label">Interés anual estimado</span>
            <span
              className={
                resultado.riesgo.nivel === 'rojo'
                  ? 'resultado-valor rojo'
                  : 'resultado-valor'
              }
            >
              {resultado.interesAnualEstimado.toFixed(0)}%
            </span>
          </div>

          <p className="resultado-detalle">
            Pagarás <strong>{resultado.numeroCuotas}</strong> cuotas de{' '}
            <strong>{formatearSoles(resultado.valorCuota)}</strong>{' '}
            {labelFrecuencia === 'mensual'
              ? 'al mes'
              : `de forma ${labelFrecuencia}`}{' '}
            durante <strong>{resultado.duracion}</strong>{' '}
            {labelUnidad}.
          </p>
        </Card>
      )}

      {/* ====== MIS DEUDAS ====== */}
      <h2 className="seccion-titulo">
        Mis deudas
        <button
          className="boton-mini"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Agregar'}
        </button>
      </h2>

      {mostrarForm && (
        <Card>
          <form onSubmit={guardarDeuda}>
            <label className="campo">
              <span className="campo-label">¿A quién le debes?</span>
              <input
                type="text"
                value={nuevaDeuda.nombre}
                onChange={(e) =>
                  setNuevaDeuda({ ...nuevaDeuda, nombre: e.target.value })
                }
                placeholder="Ej: Caja Huancayo"
                className="campo-input"
                maxLength={40}
              />
            </label>

            <label className="campo">
              <span className="campo-label">Monto total a pagar (S/)</span>
              <input
                type="number"
                step="0.10"
                min="0"
                value={nuevaDeuda.montoTotal}
                onChange={(e) =>
                  setNuevaDeuda({
                    ...nuevaDeuda,
                    montoTotal: e.target.value,
                  })
                }
                placeholder="Ej: 5000"
                className="campo-input"
              />
            </label>

            <label className="campo">
              <span className="campo-label">Cuota mensual (S/)</span>
              <input
                type="number"
                step="0.10"
                min="0"
                value={nuevaDeuda.cuotaMensual}
                onChange={(e) =>
                  setNuevaDeuda({
                    ...nuevaDeuda,
                    cuotaMensual: e.target.value,
                  })
                }
                placeholder="Ej: 350"
                className="campo-input"
              />
            </label>

            <button type="submit" className="boton-guardar">
              Guardar deuda
            </button>
          </form>
        </Card>
      )}

      {deudas.length === 0 ? (
        <p className="vacio">No tienes deudas registradas.</p>
      ) : (
        <>
          <Card className={`card-${estadoDeuda}`}>
            <div className="estado-encabezado">
              <Semaforo estado={estadoDeuda} />
              <span className="estado-texto">
                {estadoDeuda === 'verde' &&
                  'Tus deudas están bajo control.'}
                {estadoDeuda === 'amarillo' &&
                  'Cuidado: tus deudas ya son altas.'}
                {estadoDeuda === 'rojo' &&
                  'Peligro: tus deudas te están ahogando.'}
              </span>
            </div>
            <div className="resultado-fila">
              <span className="resultado-label">Total que debes</span>
              <span className="resultado-valor rojo">
                {formatearSoles(total)}
              </span>
            </div>
            <div className="resultado-fila">
              <span className="resultado-label">Cuota mensual total</span>
              <span className="resultado-valor">
                {formatearSoles(cuotaMensual)}
              </span>
            </div>
            {ingresoMensual > 0 && (
              <div className="resultado-fila">
                <span className="resultado-label">% de tu ingreso</span>
                <span className="resultado-valor">
                  {porcentajeComprometido.toFixed(0)}%
                </span>
              </div>
            )}
          </Card>

          <div className="lista-deudas">
            {deudas.map((d) => (
              <div key={d.id} className="deuda">
                <div className="deuda-info">
                  <span className="deuda-nombre">{d.nombre}</span>
                  <span className="deuda-detalle">
                    Cuota: {formatearSoles(d.cuotaMensual)}/mes
                  </span>
                </div>
                <span className="deuda-monto rojo">
                  {formatearSoles(d.montoTotal)}
                </span>
                <button
                  className="movimiento-eliminar"
                  onClick={() => {
                    if (confirm('¿Eliminar esta deuda?')) {
                      eliminarDeuda(setDeudas, d.id);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ====== BUSCAR PRESTAMISTA ====== */}
      <h2 className="seccion-titulo">Buscar prestamista</h2>
      <p className="seccion-desc">
        Verifica antes de aceptar un préstamo.
      </p>

      <Card>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Escribe el nombre..."
          className="campo-input"
        />
      </Card>

      {busqueda.trim() !== '' && (
        <>
          {resultados.length === 0 ? (
            <p className="vacio">
              No lo encontramos. Ten mucho cuidado con prestamistas
              desconocidos.
            </p>
          ) : (
            <div className="lista-prestamistas">
              {resultados.map((p, i) => (
                <Card key={i} className={`card-${p.estado}`}>
                  <div className="estado-encabezado">
                    <Semaforo estado={p.estado} />
                    <span className="resultado-titulo">{p.nombre}</span>
                  </div>
                  <p className="prestamista-nota">{p.nota}</p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Prestamos;