import './SplashScreen.css';

function SplashScreen({ mensaje = 'Cargando...' }) {
  return (
    <div className="splash">
      {/* Formas decorativas de fondo */}
      <div className="splash-decoracion splash-decor-1"></div>
      <div className="splash-decoracion splash-decor-2"></div>

      <div className="splash-contenido">
        <div className="splash-logo">
          <img
            src="/logo.svg"
            alt="Cuadra tus Lucas"
            className="splash-logo-img"
          />
        </div>

        <h1 className="splash-titulo">
          Cuadra tus
          <br />
          <span className="splash-titulo-grande">Lucas</span>
        </h1>

        <p className="splash-eslogan">Tu familia, en orden</p>

        <div className="splash-cargando">
          <div className="splash-puntos">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="splash-mensaje">{mensaje}</span>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;