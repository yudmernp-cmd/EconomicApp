import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

const EVENTO = 'finanzas-storage';

function leer(clave) {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function interpretar(texto, inicial) {
  try {
    const valor = texto === null ? inicial : JSON.parse(texto);
    if (valor === null || Array.isArray(valor) !== Array.isArray(inicial) || typeof valor !== typeof inicial) return inicial;
    return valor;
  } catch {
    return inicial;
  }
}

// Compartir la instantánea evita cifras antiguas en otros componentes/pestañas.
export function useLocalStorage(clave, valorInicial) {
  const [inicial] = useState(() => valorInicial);
  const suscribir = useCallback((actualizar) => {
    const listener = (evento) => {
      if (evento.type === EVENTO ? evento.detail === clave : !evento.key || evento.key === clave) actualizar();
    };
    window.addEventListener('storage', listener);
    window.addEventListener(EVENTO, listener);
    return () => {
      window.removeEventListener('storage', listener);
      window.removeEventListener(EVENTO, listener);
    };
  }, [clave]);
  const instantanea = useCallback(() => leer(clave), [clave]);
  const texto = useSyncExternalStore(suscribir, instantanea, () => null);
  const valor = useMemo(() => interpretar(texto, inicial), [texto, inicial]);
  const setValor = useCallback((actualizar) => {
    const previo = interpretar(leer(clave), inicial);
    const siguiente = typeof actualizar === 'function' ? actualizar(previo) : actualizar;
    try {
      window.localStorage.setItem(clave, JSON.stringify(siguiente));
    } catch {
      throw new Error('No se pudieron guardar los cambios. Revisa el espacio y los permisos de almacenamiento del navegador.');
    }
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: clave }));
  }, [clave, inicial]);
  return [valor, setValor];
}
