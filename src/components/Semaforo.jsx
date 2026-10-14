import './Semaforo.css';

function Semaforo({ estado }) {
  return (
    <span className={`semaforo semaforo-${estado}`}>
      <span className="semaforo-punto"></span>
    </span>
  );
}

export default Semaforo;