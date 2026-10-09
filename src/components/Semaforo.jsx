import './Semaforo.css';

function Semaforo({ estado }) {
  return <div className={`semaforo semaforo-${estado}`}></div>;
}

export default Semaforo;