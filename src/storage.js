import { useLocalStorage } from './hooks/useLocalStorage.js';
import { resumirMovimientos } from './utils/finanzas.js';

// Claves de almacenamiento
export const CLAVES = {
  MOVIMIENTOS: 'finanzas_movimientos',
  PERFIL: 'finanzas_perfil',
  DEUDAS: 'finanzas_deudas',
};

// ===== HOOKS =====

export function useMovimientos() {
  return useLocalStorage(CLAVES.MOVIMIENTOS, []);
}

export function usePerfil() {
  return useLocalStorage(CLAVES.PERFIL, {
    nombreFamilia: 'Mi Familia',
    integrantes: 4,
    cicloIngreso: 'semanal', // semanal | quincenal | mensual | irregular
    ingresoEstimado: 0,
  });
}

export function useDeudas() {
  return useLocalStorage(CLAVES.DEUDAS, []);
}

// ===== CÁLCULOS DE MOVIMIENTOS =====

export function calcularResumen(movimientos, perfil) {
  return resumirMovimientos(movimientos, perfil.cicloIngreso);
}

export function agregarMovimiento(setMovimientos, movimiento) {
  setMovimientos((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      ...movimiento,
    },
  ]);
}

export function eliminarMovimiento(setMovimientos, id) {
  setMovimientos((prev) => prev.filter((m) => m.id !== id));
}

// ===== CÁLCULOS DE PRÉSTAMOS =====

/**
 * Calcula los datos de un préstamo.
 *
 * @param {number} monto - Cuánto te prestan
 * @param {number} valorCuota - Cuánto pagas en cada cuota
 * @param {number} duracion - Cuánto tiempo pagarás (ej: 3)
 * @param {string} unidadDuracion - semana | mes | bimestre | trimestre | semestre | año
 * @param {string} frecuencia - diaria | semanal | quincenal | mensual
 * @returns {object} Datos completos del préstamo
 */
export function calcularPrestamo(
  monto,
  valorCuota,
  duracion,
  unidadDuracion,
  frecuencia
) {
  // Cuántos días representa cada unidad de duración
  const diasPorUnidad = {
    semana: 7,
    mes: 30,
    bimestre: 60,
    trimestre: 90,
    semestre: 180,
    año: 365,
  };

  // Cuántos días hay entre cada cuota según la frecuencia
  const diasPorFrecuencia = {
    diaria: 1,
    semanal: 7,
    quincenal: 15,
    mensual: 30,
  };

  const diasTotales = duracion * (diasPorUnidad[unidadDuracion] || 30);
  const diasEntreCuotas = diasPorFrecuencia[frecuencia] || 30;

  // Número de cuotas que se pagarán
  const numeroCuotas = Math.max(
    1,
    Math.round(diasTotales / diasEntreCuotas)
  );

  const totalPagar = valorCuota * numeroCuotas;
  const interes = totalPagar - monto;
  const porcentaje = monto > 0 ? (interes / monto) * 100 : 0;

  const meses = diasTotales / 30;
  const interesAnualEstimado = meses > 0 ? (porcentaje / meses) * 12 : 0;

  return {
    monto,
    valorCuota,
    duracion,
    unidadDuracion,
    frecuencia,
    numeroCuotas,
    totalPagar,
    interes,
    porcentaje,
    meses,
    interesAnualEstimado,
  };
}

// ===== CÁLCULOS DE DEUDAS =====

export function agregarDeuda(setDeudas, deuda) {
  setDeudas((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      ...deuda,
    },
  ]);
}

export function eliminarDeuda(setDeudas, id) {
  setDeudas((prev) => prev.filter((d) => d.id !== id));
}

export function calcularTotalDeudas(deudas) {
  const total = deudas.reduce((sum, d) => sum + Number(d.montoTotal), 0);
  const cuotaMensual = deudas.reduce(
    (sum, d) => sum + Number(d.cuotaMensual),
    0
  );
  return { total, cuotaMensual };
}