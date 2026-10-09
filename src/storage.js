import { useLocalStorage } from './hooks/useLocalStorage.js';

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
  const hoy = new Date();
  const inicioCiclo = new Date();

  // Calcular inicio del ciclo según configuración
  switch (perfil.cicloIngreso) {
    case 'semanal':
      inicioCiclo.setDate(hoy.getDate() - 7);
      break;
    case 'quincenal':
      inicioCiclo.setDate(hoy.getDate() - 15);
      break;
    case 'mensual':
      inicioCiclo.setMonth(hoy.getMonth() - 1);
      break;
    default:
      inicioCiclo.setDate(hoy.getDate() - 7);
  }

  // Filtrar movimientos del ciclo
  const delCiclo = movimientos.filter((m) => {
    const fecha = new Date(m.fecha);
    return fecha >= inicioCiclo && fecha <= hoy;
  });

  const ingresos = delCiclo
    .filter((m) => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + Number(m.monto), 0);

  const gastos = delCiclo
    .filter((m) => m.tipo === 'gasto')
    .reduce((sum, m) => sum + Number(m.monto), 0);

  const disponible = ingresos - gastos;

  // Calcular fin del ciclo
  const finCiclo = new Date(inicioCiclo);
  switch (perfil.cicloIngreso) {
    case 'semanal':
      finCiclo.setDate(inicioCiclo.getDate() + 7);
      break;
    case 'quincenal':
      finCiclo.setDate(inicioCiclo.getDate() + 15);
      break;
    case 'mensual':
      finCiclo.setMonth(inicioCiclo.getMonth() + 1);
      break;
    default:
      finCiclo.setDate(inicioCiclo.getDate() + 7);
  }

  const diasRestantes = Math.max(
    1,
    Math.ceil((finCiclo - hoy) / (1000 * 60 * 60 * 24))
  );

  const disponiblePorDia = disponible > 0 ? disponible / diasRestantes : 0;

  // Estado del semáforo
  let estado = 'verde';
  if (disponible <= 0) estado = 'rojo';
  else if (disponiblePorDia < 10) estado = 'amarillo';

  return {
    ingresos,
    gastos,
    disponible,
    diasRestantes,
    disponiblePorDia,
    estado,
  };
}

export function agregarMovimiento(setMovimientos, movimiento) {
  setMovimientos((prev) => [
    ...prev,
    {
      id: Date.now().toString(),
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
      id: Date.now().toString(),
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