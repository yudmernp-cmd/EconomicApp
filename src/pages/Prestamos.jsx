import { useState } from 'react';
import {
  useDeudas, usePerfil, agregarDeuda, eliminarDeuda, calcularPrestamo, calcularTotalDeudas,
} from '../storage.js';
import { evaluarRiesgo } from '../simulador.js';
import { buscarPrestamista, TIPOS } from '../utils/prestamistas.js';
import { formatearSoles } from '../utils/formatos.js';
import Card from '../components/Card.jsx';
import Semaforo from '../components/Semaforo.jsx';
import './Prestamos.css';

const UNIDADES_DURACION = [
  { id: 'semana', label: 'Semana(s)' }, { id: 'mes', label: 'Mes(es)' },
  { id: 'bimestre', label: 'Bimestre(s)' }, { id: 'trimestre', label: 'Trimestre(s)' },
  { id: 'semestre', label: 'Semestre(s)' }, { id: 'año', label: 'Año(s)' },
];
const FRECUENCIAS = [
  { id: 'diaria', label: 'Diaria' }, { id: 'semanal', label: 'Semanal' },
  { id: 'quincenal', label: 'Quincenal' }, { id: 'mensual', label: 'Mensual' },
];

function Prestamos() {
  const [deudas, setDeudas] = useDeudas();
  const [perfil] = usePerfil();

  const [monto, setMonto] = useState('');
  const [valorCuota, setValorCuota] = useState('');
  const [duracion, setDuracion] = useState('1');
  const [unidadDuracion, setUnidadDuracion] = useState('mes');
  const [frecuencia, setFrecuencia] = useState('semanal');
  const [resultado, setResultado] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const resultados = buscarPrestamista(busqueda);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevaDeuda, setNuevaDeuda] = useState({ nombre: '', montoTotal: '', cuotaMensual: '' });

  const simular = (e) => {
    e.preventDefault();
    const m = parseFloat(monto); const vc = parseFloat(valorCuota); const d = parseFloat(duracion);
    if (!m || !vc || !d || m <= 0 || vc <= 0 || d <= 0) { alert('Completa los campos'); return; }
    const calc = calcularPrestamo(m, vc, d, unidadDuracion, frecuencia);
    const riesgo = evaluarRiesgo(calc.interesAnualEstimado);
    setResultado({ ...calc, riesgo });
  };

  const guardarDeuda = (e) => {
    e.preventDefault();
    const montoTotal = parseFloat(nuevaDeuda.montoTotal); const cuotaMensual = parseFloat(nuevaDeuda.cuotaMensual);
    if (!nuevaDeuda.nombre.trim() || !montoTotal || !cuotaMensual) { alert('Completa los campos'); return; }
    agregarDeuda(setDeudas, { nombre: nuevaDeuda.nombre.trim(), montoTotal, cuotaMensual });
    setNuevaDeuda({ nombre: '', montoTotal: '', cuotaMensual: '' });
    setMostrarForm(false);
  };

  const { total, cuotaMensual } = calcularTotalDeudas(deudas);
  const ingresoMensual = perfil.cicloIngreso === 'semanal' ? perfil.ingresoEstimado * 4 : perfil.cicloIngreso === 'quincenal' ? perfil.ingresoEstimado * 2 : perfil.ingresoEstimado;
  const porcentajeComprometido = ingresoMensual > 0 ? (cuotaMensual / ingresoMensual) * 100 : 0;

  let estadoDeuda = 'verde';
  if (porcentajeComprometido > 60) estadoDeuda = 'rojo';
  else if (porcentajeComprometido > 40) estadoDeuda = 'amarillo';

  const labelUnidad = UNIDADES_DURACION.find((u) => u.id === unidadDuracion)?.label.toLowerCase();
  const labelFrecuencia = FRECUENCIAS.find((f) => f.id === frecuencia)?.label.toLowerCase();

  return (
    <div className="prestamos-contenedor">
      <h1>Préstamos</h1>
      <p className="prestamos-subtitulo">Antes de pedir prestado, calcula cuánto vas a pagar.</p>

      <Card>
        <h3 className="prestamos-seccion-titulo">Simulador de deuda</h3>
        <form onSubmit={simular} className="prestamos-form">
          <div className="prestamos-grid-2">
            <label className="prestamos-campo">
              <span className="prestamos-label">Monto prestado (S/)</span>
              <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="2000" className="prestamos-input" />
            </label>
            <label className="prestamos-campo">
              <span className="prestamos-label">Cuota a pagar (S/)</span>
              <input type="number" value={valorCuota} onChange={(e) => setValorCuota(e.target.value)} placeholder="150" className="prestamos-input" />
            </label>
          </div>

          <div className="prestamos-grid-2">
            <label className="prestamos-campo">
              <span className="prestamos-label">Tiempo pagando</span>
              <input type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="3" className="prestamos-input" />
            </label>
            <label className="prestamos-campo">
              <span className="prestamos-label">Unidad</span>
              <select value={unidadDuracion} onChange={(e) => setUnidadDuracion(e.target.value)} className="prestamos-input">
                {UNIDADES_DURACION.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </label>
          </div>

          <span className="prestamos-label">Frecuencia de pago</span>
          <div className="prestamos-frecuencias">
            {FRECUENCIAS.map((f) => (
              <button key={f.id} type="button" className={frecuencia === f.id ? 'prestamos-btn-frec activo' : 'prestamos-btn-frec'} onClick={() => setFrecuencia(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          <button type="submit" className="prestamos-btn-calcular">Calcular Préstamo</button>
        </form>
      </Card>

      {resultado && (
        <div className={`prestamos-resultado result-${resultado.riesgo.nivel}`}>
          <div className="resultado-header">
            <Semaforo estado={resultado.riesgo.nivel} />
            <span className="resultado-alerta">{resultado.riesgo.texto}</span>
          </div>
          <div className="resultado-monto-total">
            <span className="resultado-label">Vas a pagar en total</span>
            <span className="resultado-valor">{formatearSoles(resultado.totalPagar)}</span>
          </div>
          <div className="resultado-detalles">
            <div className="resultado-detalle-item">
              <span>Interés generado</span>
              <strong className="rojo">+{formatearSoles(resultado.interes)}</strong>
            </div>
            <div className="resultado-detalle-item">
              <span>Equivale a</span>
              <strong>{resultado.porcentaje.toFixed(0)}% del monto</strong>
            </div>
            <div className="resultado-detalle-item">
              <span>Interés anual estimado</span>
              <strong>{resultado.interesAnualEstimado.toFixed(0)}%</strong>
            </div>
          </div>
          <p className="resultado-resumen">
            Pagarás <strong>{resultado.numeroCuotas} cuotas</strong> de <strong>{formatearSoles(resultado.valorCuota)}</strong> {labelFrecuencia === 'mensual' ? 'al mes' : `de forma ${labelFrecuencia}`} durante <strong>{resultado.duracion} {labelUnidad}</strong>.
          </p>
        </div>
      )}

      <h3 className="prestamos-seccion-titulo" style={{ marginTop: '24px' }}>
        Mis deudas
        <button className="prestamos-btn-mini" onClick={() => setMostrarForm(!mostrarForm)}>{mostrarForm ? 'Cancelar' : '+ Agregar'}</button>
      </h3>

      {mostrarForm && (
        <Card>
          <form onSubmit={guardarDeuda} className="prestamos-form">
            <label className="prestamos-campo">
              <span className="prestamos-label">¿A quién le debes?</span>
              <input type="text" value={nuevaDeuda.nombre} onChange={(e) => setNuevaDeuda({ ...nuevaDeuda, nombre: e.target.value })} placeholder="Ej: Caja Huancayo" className="prestamos-input" />
            </label>
            <div className="prestamos-grid-2">
              <label className="prestamos-campo">
                <span className="prestamos-label">Monto total (S/)</span>
                <input type="number" value={nuevaDeuda.montoTotal} onChange={(e) => setNuevaDeuda({ ...nuevaDeuda, montoTotal: e.target.value })} placeholder="5000" className="prestamos-input" />
              </label>
              <label className="prestamos-campo">
                <span className="prestamos-label">Cuota mensual (S/)</span>
                <input type="number" value={nuevaDeuda.cuotaMensual} onChange={(e) => setNuevaDeuda({ ...nuevaDeuda, cuotaMensual: e.target.value })} placeholder="350" className="prestamos-input" />
              </label>
            </div>
            <button type="submit" className="prestamos-btn-calcular">Guardar deuda</button>
          </form>
        </Card>
      )}

      {deudas.length > 0 && (
        <div className="prestamos-deudas-lista">
          <div className={`prestamos-deuda-resumen card-${estadoDeuda}`}>
            <div className="deuda-resumen-header">
              <Semaforo estado={estadoDeuda} />
              <span>{estadoDeuda === 'verde' ? 'Deudas bajo control' : estadoDeuda === 'amarillo' ? 'Cuidado con tus deudas' : 'Deudas peligrosas'}</span>
            </div>
            <div className="deuda-resumen-totales">
              <span>Deuda total: <strong>{formatearSoles(total)}</strong></span>
              <span>Cuota mensual: <strong>{formatearSoles(cuotaMensual)}</strong></span>
            </div>
          </div>
          
          {deudas.map((d) => (
            <div key={d.id} className="prestamos-deuda-item">
              <div className="deuda-item-info">
                <span className="deuda-item-nombre">{d.nombre}</span>
                <span className="deuda-item-cuota">Cuota: {formatearSoles(d.cuotaMensual)}/mes</span>
              </div>
              <span className="deuda-item-monto">{formatearSoles(d.montoTotal)}</span>
              <button className="deuda-item-eliminar" onClick={() => confirm('¿Eliminar?') && eliminarDeuda(setDeudas, d.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      <h3 className="prestamos-seccion-titulo" style={{ marginTop: '24px' }}>Verificar prestamista</h3>
      <p className="prestamos-subtitulo" style={{ marginBottom: '12px' }}>Verifica si una entidad es segura antes de firmar.</p>

      <Card>
        <div className="prestamos-buscador">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Ej: Caja Huancayo, BCP, gota a gota..." className="prestamos-input-buscador" />
        </div>
      </Card>

      {busqueda.trim().length >= 2 && (
        <div className="prestamos-resultados-busqueda">
          {resultados.length === 0 ? (
            <Card className="card-alerta"><p className="prestamos-alerta-texto">No encontramos "{busqueda}". Ten cuidado con desconocidos. Verifica en www.sbs.gob.pe</p></Card>
          ) : (
            resultados.map((p, i) => (
              <Card key={i} className={`prestamos-prestamista-card border-${p.estado}`}>
                <div className="prestamista-header">
                  <div className="prestamista-titulo">
                    <span className="prestamista-icono">{TIPOS[p.tipo]?.icono}</span>
                    <div>
                      <span className="prestamista-nombre">{p.nombre}</span>
                      <span className="prestamista-tipo">{TIPOS[p.tipo]?.label}</span>
                    </div>
                  </div>
                  <Semaforo estado={p.estado} />
                </div>
                <p className="prestamista-nota">{p.nota}</p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
export default Prestamos;