export const LECCIONES = [
  {
    id: 1,
    titulo: '¿Qué es el interés?',
    contenido: [
      'El interés es el dinero extra que pagas cuando te prestan plata.',
      'Ejemplo: Si te prestan S/ 1,000 y al final pagas S/ 1,300, el interés es S/ 300.',
      'Mientras más tiempo tardes en pagar, más interés acumulas.',
      'Antes de aceptar un préstamo, siempre pregunta: ¿cuánto pagaré al final?',
    ],
    preguntas: [
      {
        texto: 'Si te prestan S/ 1,000 y pagas S/ 1,300, ¿cuánto es el interés?',
        opciones: ['S/ 100', 'S/ 300', 'S/ 1,300'],
        correcta: 1,
      },
      {
        texto: '¿Qué pasa si tardas más tiempo en pagar un préstamo?',
        opciones: ['Pagas lo mismo', 'El interés baja', 'El interés sube'],
        correcta: 2,
      },
      {
        texto: '¿Qué debes preguntar siempre antes de aceptar un préstamo?',
        opciones: ['¿Cuánto pagaré al final?', '¿Me darán el dinero hoy?', '¿Tienen app?'],
        correcta: 0,
      }
    ],
  },
  {
    id: 2,
    titulo: '¿Cómo detecto un préstamo estafa?',
    contenido: [
      'Si te piden acceso a tus contactos o fotos, es señal de peligro.',
      'Si el interés es altísimo (más del 80% al año), no lo aceptes.',
      'Si no te dan un contrato claro, desconfía.',
      'Verifica siempre si está autorizado por la SBS.',
    ],
    preguntas: [
      {
        texto: '¿Cuál es una señal clara de que un préstamo es estafa?',
        opciones: ['Te piden acceso a tus contactos', 'Te dan un contrato', 'Están en la SBS'],
        correcta: 0,
      },
      {
        texto: 'Si no te dan un contrato por escrito, ¿qué debes hacer?',
        opciones: ['Aceptar rápido', 'Desconfiar y no aceptar', 'Pedir más dinero'],
        correcta: 1,
      },
      {
        texto: '¿Dónde puedes verificar si una entidad es segura?',
        opciones: ['En Facebook', 'En la SBS', 'En WhatsApp'],
        correcta: 1,
      }
    ],
  },
  {
    id: 3,
    titulo: '¿Por qué ahorrar 1 sol al día sirve?',
    contenido: [
      'Ahorrar S/ 1 al día son S/ 30 al mes y S/ 365 al año.',
      'Ese dinero puede ayudarte en una emergencia.',
      'No necesitas ahorrar mucho. Necesitas ahorrar siempre.',
      'Guarda el ahorro en un lugar separado, no en el mismo bolsillo.',
    ],
    preguntas: [
      {
        texto: '¿Cuánto ahorras en un año si guardas S/ 1 al día?',
        opciones: ['S/ 30', 'S/ 100', 'S/ 365'],
        correcta: 2,
      },
      {
        texto: '¿Dónde es mejor guardar el dinero que estás ahorrando?',
        opciones: ['En el mismo bolsillo del gasto diario', 'En un lugar separado', 'Prestándolo a un amigo'],
        correcta: 1,
      },
      {
        texto: '¿Para qué sirve principalmente el ahorro?',
        opciones: ['Para emergencias', 'Para comprar cosas inútiles', 'Para pagar intereses'],
        correcta: 0,
      }
    ],
  },
  {
    id: 4,
    titulo: '¿Cómo hago un presupuesto si gano poco?',
    contenido: [
      'Primero anota todo lo que entra en el mes.',
      'Luego anota lo que SÍ o SÍ debes pagar: comida, luz, agua, alquiler.',
      'Lo que sobra, repártelo: mitad para ahorro, mitad para gustos.',
      'Si no alcanza, revisa qué gastos puedes reducir.',
    ],
    preguntas: [
      {
        texto: '¿Qué se anota primero al hacer un presupuesto?',
        opciones: ['Los gustos', 'Los ingresos', 'Las deudas'],
        correcta: 1,
      },
      {
        texto: 'Si te sobra un poco de dinero, ¿qué es lo más recomendable?',
        opciones: ['Gastarlo todo en gustos', 'Repartirlo entre ahorro y gustos', 'Guardarlo debajo del colchón'],
        correcta: 1,
      },
      {
        texto: '¿Qué debes hacer si tu presupuesto no alcanza?',
        opciones: ['Pedir un préstamo caro', 'Revisar qué gastos puedes reducir', 'No pagar las cuentas'],
        correcta: 1,
      }
    ],
  },
  {
    id: 5,
    titulo: '¿Qué hago si no me alcanza a fin de mes?',
    contenido: [
      'No pidas préstamos con intereses altos para cubrir gastos básicos.',
      'Habla con tu familia y revisen juntos los gastos.',
      'Reduce primero los gastos pequeños que se repiten.',
      'Si es urgente, busca apoyo en programas sociales antes que un prestamista informal.',
    ],
    preguntas: [
      {
        texto: '¿Qué NO debes hacer si no te alcanza el dinero?',
        opciones: ['Reducir gastos', 'Pedir préstamos con interés altísimo', 'Hablar con tu familia'],
        correcta: 1,
      },
      {
        texto: '¿Qué tipo de gastos debes intentar reducir primero?',
        opciones: ['La comida', 'Los pequeños que se repiten mucho', 'La renta de casa'],
        correcta: 1,
      },
      {
        texto: 'Si tienes una emergencia y no te alcanza, ¿a dónde deberías acudir primero?',
        opciones: ['A un "gota a gota"', 'A un programa social o familiar', 'A una app de préstamos rápidos'],
        correcta: 1,
      }
    ],
  },
  {
    id: 6,
    titulo: '¿Qué es la SBS y cómo me protege?',
    contenido: [
      'La SBS es la Superintendencia de Banca, Seguros y AFP.',
      'Solo las entidades autorizadas por la SBS son seguras.',
      'Si tienes un problema con una entidad, puedes reportarla a la SBS.',
      'Antes de pedir un préstamo, verifica en la web de la SBS.',
    ],
    preguntas: [
      {
        texto: '¿Qué significa SBS?',
        opciones: ['Superintendencia de Banca, Seguros y AFP', 'Sistema Bancario Seguro', 'Sociedad de Buenos Servicios'],
        correcta: 0,
      },
      {
        texto: '¿Qué tipo de entidades son seguras para pedir dinero?',
        opciones: ['Cualquier persona que preste', 'Las autorizadas por la SBS', 'Las que aparecen en redes sociales'],
        correcta: 1,
      },
      {
        texto: '¿Dónde debes verificar antes de pedir un préstamo?',
        opciones: ['En la web de la SBS', 'En el periódico', 'Preguntando a un amigo'],
        correcta: 0,
      }
    ],
  },
  {
    id: 7,
    titulo: '¿Deuda buena vs deuda mala?',
    contenido: [
      'Deuda buena: te ayuda a crecer. Ej: un préstamo para un negocio.',
      'Deuda mala: te hunde más. Ej: préstamo para pagar otro préstamo.',
      'Antes de endeudarte, pregúntate: ¿esto me va a generar más dinero?',
      'Si la respuesta es no, mejor no lo hagas.',
    ],
    preguntas: [
      {
        texto: '¿Cuál es un ejemplo de deuda buena?',
        opciones: ['Préstamo para pagar otra deuda', 'Préstamo para hacer crecer un negocio', 'Préstamo para comprar gustos'],
        correcta: 1,
      },
      {
        texto: '¿Cuál es un ejemplo de deuda mala?',
        opciones: ['Préstamo para una casa', 'Préstamo para pagar otro préstamo', 'Préstamo para estudiar'],
        correcta: 1,
      },
      {
        texto: '¿Qué pregunta clave debes hacerte antes de endeudarte?',
        opciones: ['¿Me alcanzará para la cuota?', '¿Esto me va a generar más dinero?', '¿Qué dirá mi familia?'],
        correcta: 1,
      }
    ],
  },
  {
    id: 8,
    titulo: '¿Cómo enseño a mis hijos sobre dinero?',
    contenido: [
      'Dales una propina semanal pequeña y enséñales a repartirla.',
      'Que guarden una parte, gasten otra, y ayuden con otra.',
      'Hablen de dinero en familia sin pelear.',
      'Los niños aprenden más de lo que ven que de lo que les dicen.',
    ],
    preguntas: [
      {
        texto: '¿Cómo aprenden mejor los niños sobre el dinero?',
        opciones: ['Viendo el ejemplo de sus padres', 'Solo con libros', 'No pueden aprender'],
        correcta: 0,
      },
      {
        texto: 'Si le das propina a un niño, ¿qué es bueno enseñarle a hacer?',
        opciones: ['Que se lo gaste todo', 'Que lo reparta entre ahorro y gasto', 'Que lo preste a sus amigos'],
        correcta: 1,
      },
      {
        texto: '¿Cómo deben ser las conversaciones sobre dinero en familia?',
        opciones: ['Peleando', 'Sin hablar del tema', 'Tranquilas y sin pelear'],
        correcta: 2,
      }
    ],
  },
];