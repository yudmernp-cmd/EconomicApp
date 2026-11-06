# Cuadra tus Lucas

Aplicación de finanzas familiares en soles, construida con React y Vite.

## Funciones

- Panel con balance, ingresos, gastos por categoría y movimientos recientes.
- Presupuesto mensual editable con seguimiento y aviso al superar el límite.
- Registro y edición de ingresos/gastos, búsqueda sin tildes y filtros por tipo y período.
- Descarga CSV de los movimientos filtrados, compatible con importes en centavos.
- Simulador de préstamos, lecciones y perfil familiar.
- Navegación inferior en móvil y barra lateral en escritorio.

Los movimientos, el perfil, las deudas y el presupuesto se conservan en este navegador mediante localStorage. Los cambios se sincronizan entre componentes y pestañas del mismo origen. La descarga CSV permite conservar una copia del historial; no hay sincronización de estos datos con Supabase.

## Desarrollo

Se validó con Node.js 24 y npm 11.

```sh
npm ci
npm run dev
```

Las variables de Supabase y las credenciales de las integraciones se gestionan en Vercel. No se incluyen valores en el repositorio. Vite por sí solo no ejecuta las funciones serverless de `api/` ni hereda las variables de Vercel. La compilación y las pruebas de lógica funcionan sin esas variables; la autenticación real necesita la configuración del despliegue.

## Comprobaciones

```sh
npm run lint
npm test
npm run build
```

Las pruebas cubren límites de semanas/quincenas/meses, fechas locales, sumas en centavos, filtros combinados, validación de movimientos y escape de CSV. El comando de pruebas usa Node.js 24 y no añade dependencias.

## Períodos y presupuesto

- Semanal: lunes a domingo.
- Quincenal: días 1 a 15 y 16 al último día del mes.
- Mensual e irregular: mes calendario.

El resumen incluye movimientos desde el inicio del período hasta hoy. Los días restantes incluyen el día actual. El presupuesto siempre usa los gastos del mes calendario, independientemente del ciclo elegido en Perfil; su límite se mantiene para cada mes hasta editarlo o quitarlo. Quitar el límite conserva los movimientos.
