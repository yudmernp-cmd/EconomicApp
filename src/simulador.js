// Lista simple de prestamistas (ejemplo académico)
// En una versión real se conectaría con la SBS
export const PRESTAMISTAS = [
  {
    nombre: 'Caja Huancayo',
    estado: 'verde',
    nota: 'Autorizado por SBS. Tasa regulada.',
  },
  {
    nombre: 'Mi Banco',
    estado: 'verde',
    nota: 'Autorizado por SBS.',
  },
  {
    nombre: 'Compartamos',
    estado: 'verde',
    nota: 'Autorizado por SBS.',
  },
  {
    nombre: 'Préstamo rápido (WhatsApp)',
    estado: 'rojo',
    nota: 'Reportado por cobros abusivos y extorsión.',
  },
  {
    nombre: 'Gota a gota',
    estado: 'rojo',
    nota: 'No autorizado. Interés anual superior al 100%.',
  },
  {
    nombre: 'App Préstamos Ya',
    estado: 'rojo',
    nota: 'Denunciada por acceder a contactos y fotos.',
  },
];

// Buscar prestamista por nombre (búsqueda simple)
export function buscarPrestamista(termino) {
  if (!termino || termino.trim() === '') return [];
  const t = termino.toLowerCase().trim();
  return PRESTAMISTAS.filter((p) => p.nombre.toLowerCase().includes(t));
}

// Evaluar el nivel de riesgo del préstamo (basado en interés anual estimado)
export function evaluarRiesgo(interesAnual) {
  if (interesAnual < 40) {
    return {
      nivel: 'verde',
      texto: 'Interés razonable. Es un préstamo manejable.',
    };
  } else if (interesAnual < 80) {
    return {
      nivel: 'amarillo',
      texto: 'Interés alto. Piensa bien antes de aceptarlo.',
    };
  } else {
    return {
      nivel: 'rojo',
      texto: 'Interés muy alto. Este préstamo puede hundirte.',
    };
  }
}