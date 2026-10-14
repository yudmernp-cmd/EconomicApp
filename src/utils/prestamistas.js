// Base de datos de prestamistas en Perú (Huánuco)
// Clasificados por tipo y estado ante la SBS

export const TIPOS = {
  banco: { label: 'Banco', color: 'azul', icono: '🏦' },
  caja: { label: 'Caja Municipal', color: 'verde', icono: '🏛️' },
  financiera: { label: 'Financiera', color: 'azul', icono: '💼' },
  edpyme: { label: 'Edpyme', color: 'azul', icono: '📊' },
  cooperativa: { label: 'Cooperativa', color: 'amarillo', icono: '🤝' },
  informal: { label: 'Informal', color: 'rojo', icono: '⚠️' },
  estafa: { label: 'Reportado', color: 'rojo', icono: '🚨' },
};

export const PRESTAMISTAS = [
  // ===== BANCOS =====
  {
    nombre: 'Banco de Crédito del Perú (BCP)',
    aliases: ['bcp', 'credito', 'banco de credito'],
    tipo: 'banco',
    estado: 'verde',
    tasa: '15% - 45% anual',
    nota: 'Banco autorizado por la SBS. Requiere historial crediticio.',
    web: 'https://www.viabcp.com',
  },
  {
    nombre: 'BBVA Perú',
    aliases: ['bbva', 'continental'],
    tipo: 'banco',
    estado: 'verde',
    tasa: '18% - 50% anual',
    nota: 'Banco autorizado por la SBS. Ofrece créditos personales.',
    web: 'https://www.bbva.pe',
  },
  {
    nombre: 'Interbank',
    aliases: ['interbank', 'inter'],
    tipo: 'banco',
    estado: 'verde',
    tasa: '20% - 55% anual',
    nota: 'Banco autorizado por la SBS.',
    web: 'https://interbank.pe',
  },
  {
    nombre: 'Scotiabank Perú',
    aliases: ['scotiabank', 'scotia'],
    tipo: 'banco',
    estado: 'verde',
    tasa: '18% - 48% anual',
    nota: 'Banco autorizado por la SBS.',
    web: 'https://www.scotiabank.com.pe',
  },
  {
    nombre: 'Banco de la Nación',
    aliases: ['banco de la nacion', 'bn'],
    tipo: 'banco',
    estado: 'verde',
    tasa: 'Tasas preferenciales',
    nota: 'Banco estatal. Ofrece créditos sociales a tasas bajas.',
    web: 'https://www.bn.com.pe',
  },
  {
    nombre: 'Mibanco',
    aliases: ['mibanco', 'mi banco'],
    tipo: 'banco',
    estado: 'verde',
    tasa: '35% - 75% anual',
    nota: 'Especializado en microempresas. Autorizado por la SBS.',
    web: 'https://www.mibanco.com.pe',
  },

  // ===== CAJAS MUNICIPALES =====
  {
    nombre: 'Caja Huancayo',
    aliases: ['huancayo', 'caja huancayo', 'cmac huancayo'],
    tipo: 'caja',
    estado: 'verde',
    tasa: '25% - 60% anual',
    nota: 'Caja municipal autorizada por la SBS. Presencia en Huánuco.',
    web: 'https://www.cajahuancayo.com.pe',
  },
  {
    nombre: 'Caja Piura',
    aliases: ['piura', 'caja piura', 'cmac piura'],
    tipo: 'caja',
    estado: 'verde',
    tasa: '28% - 65% anual',
    nota: 'Caja municipal autorizada por la SBS.',
    web: 'https://www.cajapiura.pe',
  },
  {
    nombre: 'Caja Arequipa',
    aliases: ['arequipa', 'caja arequipa'],
    tipo: 'caja',
    estado: 'verde',
    tasa: '25% - 60% anual',
    nota: 'Caja municipal autorizada por la SBS.',
    web: 'https://www.cajaarequipa.pe',
  },
  {
    nombre: 'Caja Cusco',
    aliases: ['cusco', 'caja cusco'],
    tipo: 'caja',
    estado: 'verde',
    tasa: '26% - 62% anual',
    nota: 'Caja municipal autorizada por la SBS.',
    web: 'https://www.cajacusco.com.pe',
  },
  {
    nombre: 'Caja Trujillo',
    aliases: ['trujillo', 'caja trujillo'],
    tipo: 'caja',
    estado: 'verde',
    tasa: '27% - 63% anual',
    nota: 'Caja municipal autorizada por la SBS.',
    web: 'https://www.cajatrujillo.com.pe',
  },
  {
    nombre: 'Caja Paita',
    aliases: ['paita', 'caja paita'],
    tipo: 'caja',
    estado: 'verde',
    tasa: '25% - 60% anual',
    nota: 'Caja municipal autorizada por la SBS.',
    web: 'https://www.cajapaita.pe',
  },

  // ===== FINANCIERAS =====
  {
    nombre: 'Crediscotia',
    aliases: ['crediscotia', 'scotia'],
    tipo: 'financiera',
    estado: 'verde',
    tasa: '40% - 90% anual',
    nota: 'Financiera autorizada por la SBS.',
    web: 'https://www.crediscotia.com.pe',
  },
  {
    nombre: 'Compartamos Financiera',
    aliases: ['compartamos', 'compartamos financiera'],
    tipo: 'financiera',
    estado: 'verde',
    tasa: '45% - 95% anual',
    nota: 'Autorizada por la SBS. Interés más alto que un banco.',
    web: 'https://www.compartamos.com.pe',
  },
  {
    nombre: 'Financiera Efectiva',
    aliases: ['efectiva', 'financiera efectiva'],
    tipo: 'financiera',
    estado: 'verde',
    tasa: '45% - 95% anual',
    nota: 'Autorizada por la SBS.',
    web: 'https://www.efectiva.com.pe',
  },
  {
    nombre: 'Financiera Oh!',
    aliases: ['oh', 'financiera oh', 'oh!'],
    tipo: 'financiera',
    estado: 'verde',
    tasa: '40% - 85% anual',
    nota: 'Autorizada por la SBS.',
    web: 'https://www.financieraoh.com.pe',
  },

  // ===== EDPYMES =====
  {
    nombre: 'Acceso Crediticio',
    aliases: ['acceso', 'acceso crediticio'],
    tipo: 'edpyme',
    estado: 'verde',
    tasa: '40% - 90% anual',
    nota: 'Edpyme autorizada por la SBS.',
    web: 'https://www.accesocrediticio.com.pe',
  },
  {
    nombre: 'Credivisión',
    aliases: ['credivision'],
    tipo: 'edpyme',
    estado: 'verde',
    tasa: '45% - 95% anual',
    nota: 'Edpyme autorizada por la SBS.',
    web: 'https://www.credivision.pe',
  },

  // ===== COOPERATIVAS =====
  {
    nombre: 'Cooperativa San Francisco',
    aliases: ['san francisco', 'coop san francisco'],
    tipo: 'cooperativa',
    estado: 'amarillo',
    tasa: '20% - 60% anual',
    nota: 'Cooperativa. No todas están reguladas por la SBS. Verifica.',
    web: '',
  },
  {
    nombre: 'Cooperativa Santa María Magdalena',
    aliases: ['santa maria', 'magdalena'],
    tipo: 'cooperativa',
    estado: 'amarillo',
    tasa: '20% - 60% anual',
    nota: 'Cooperativa. Verifica si está en el registro de la SBS.',
    web: '',
  },

  // ===== INFORMALES / RIESGO =====
  {
    nombre: 'Gota a gota',
    aliases: ['gota', 'gota a gota', 'prestamo gota'],
    tipo: 'informal',
    estado: 'rojo',
    tasa: '200% - 1000% anual',
    nota: 'NO autorizado. Interés altísimo. Cobran con amenazas.',
    web: '',
  },
  {
    nombre: 'Préstamo por WhatsApp',
    aliases: ['whatsapp', 'prestamo whatsapp', 'prestamo rapido'],
    tipo: 'informal',
    estado: 'rojo',
    tasa: 'Variable, usualmente > 150%',
    nota: 'NO autorizado. Suelen ser estafas. NUNCA des tus datos.',
    web: '',
  },
  {
    nombre: 'Préstamos con garantía de pertenencias',
    aliases: ['garantia', 'prenda', 'empeño'],
    tipo: 'informal',
    estado: 'rojo',
    tasa: 'Variable, usualmente > 200%',
    nota: 'Si no pagas, pierdes tus cosas. Evítalos.',
    web: '',
  },
  {
    nombre: 'App de préstamos no autorizada',
    aliases: ['app prestamo', 'prestamo app', 'app prestamos ya'],
    tipo: 'estafa',
    estado: 'rojo',
    tasa: 'Usualmente > 300%',
    nota: 'Denunciadas. Piden acceso a contactos y fotos. NUNCA las instales.',
    web: '',
  },
];

// ===== BÚSQUEDA =====

// Quitar tildes y pasar a minúsculas
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function buscarPrestamista(termino) {
  if (!termino || termino.trim().length < 2) return [];

  const t = normalizar(termino);

  // Buscar por nombre o aliases
  const coincidencias = PRESTAMISTAS.filter((p) => {
    const nombre = normalizar(p.nombre);
    const aliases = (p.aliases || []).map(normalizar);

    return (
      nombre.includes(t) ||
      aliases.some((a) => a.includes(t) || t.includes(a))
    );
  });

  // Ordenar: primero los de estado "verde", luego amarillo, luego rojo
  const orden = { verde: 1, amarillo: 2, rojo: 3 };
  return coincidencias.sort(
    (a, b) => (orden[a.estado] || 9) - (orden[b.estado] || 9)
  );
}