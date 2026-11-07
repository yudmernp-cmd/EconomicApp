import { Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './GuiaInicial.css';

export default function GuiaInicial({ perfil, movimientos, presupuesto, metas }) {
  const [oculta, setOculta] = useLocalStorage('finanzas_guia_oculta', false);
  const pasos = [
    { titulo: 'Tu familia', detalle: 'Ponle nombre a tu espacio', listo: Boolean(perfil.nombreFamilia?.trim() && perfil.nombreFamilia !== 'Mi Familia'), ruta: '/perfil' },
    { titulo: 'Primer ingreso', detalle: 'Empieza con lo que recibiste', listo: movimientos.some((m) => m.tipo === 'ingreso'), ruta: '/mi-plata?tipo=ingreso' },
    { titulo: 'Tu presupuesto', detalle: 'Elige un límite mensual', listo: presupuesto.monto > 0, destino: 'presupuesto-titulo' },
    { titulo: 'Una meta', detalle: 'Dale un propósito al ahorro', listo: metas.length > 0, destino: 'plan-familiar' },
  ];
  const completos = pasos.filter((paso) => paso.listo).length;
  const cambiar = () => { try { setOculta(!oculta); } catch (error) { window.alert(error.message); } };
  if (oculta) return <button className="guia-mostrar" onClick={cambiar}>Mostrar mis primeros pasos · {completos}/4</button>;
  return <section className="guia-inicial" aria-labelledby="guia-titulo">
    <div className="guia-encabezado"><div><span className="inicio-eyebrow">UN BUEN COMIENZO</span><h2 id="guia-titulo">{completos === 4 ? 'Ya tienes un plan en marcha' : 'Haz espacio para tus planes'}</h2><p>Cuatro pequeños pasos para empezar a cuidar tus lucas.</p></div><button onClick={cambiar} aria-label="Ocultar primeros pasos">Ocultar</button></div>
    <div className="guia-avance"><progress value={completos} max="4" aria-label="Primeros pasos completados" /><span>{completos} de 4</span></div>
    <div className="guia-pasos">{pasos.map((paso, i) => {
      const contenido = <><span className={`guia-numero ${paso.listo ? 'listo' : ''}`} aria-label={paso.listo ? 'Completado' : `Paso ${i + 1}`}>{paso.listo ? '✓' : i + 1}</span><span><strong>{paso.titulo}</strong><small>{paso.detalle}</small></span></>;
      return paso.ruta ? <Link key={paso.titulo} to={paso.ruta}>{contenido}</Link> : <button key={paso.titulo} onClick={() => {
        const destino = document.getElementById(paso.destino);
        destino?.scrollIntoView({ behavior: 'instant', block: 'start' });
        destino?.focus({ preventScroll: true });
      }}>{contenido}</button>;
    })}</div>
  </section>;
}
