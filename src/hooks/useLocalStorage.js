import { useState, useEffect } from 'react';

export function useLocalStorage(clave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const item = window.localStorage.getItem(clave);
      return item ? JSON.parse(item) : valorInicial;
    } catch (error) {
      console.error('Error leyendo localStorage:', error);
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }, [clave, valor]);

  return [valor, setValor];
}