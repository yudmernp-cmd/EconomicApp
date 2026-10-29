import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { movimientos, deudas } = req.body;

  try {
    // 1. Configurar la autenticación con las variables de entorno
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Reemplazamos los \n literales por saltos de línea reales
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // 2. Preparar los datos de Movimientos
    const filasMovimientos = movimientos.map((m) => [
      m.fecha,
      m.tipo,
      m.categoria,
      m.descripcion || '',
      m.monto,
    ]);

    // 3. Escribir en la hoja (Hoja 1: Movimientos)
    // Limpiamos los datos viejos y ponemos los nuevos
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Hoja 1!A1:E1', // Asumiendo que la hoja se llama "Hoja 1"
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'], // Encabezados
          ...filasMovimientos,
        ],
      },
    });

    // 4. Preparar los datos de Deudas
    const filasDeudas = deudas.map((d) => [
      d.nombre,
      d.montoTotal,
      d.cuotaMensual,
    ]);

    // 5. Escribir Deudas en otra hoja (Si no existe, creará el rango, pero es mejor crearla a mano en Sheets)
    // Para evitar errores, escribimos en la "Hoja 2". 
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Hoja 2!A1:C1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          ['Entidad', 'Monto Total', 'Cuota Mensual'],
          ...filasDeudas,
        ],
      },
    });

    return res.status(200).json({ 
      exito: true, 
      mensaje: 'Datos exportados correctamente',
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
    });

  } catch (error) {
    console.error('Error exportando a Sheets:', error);
    return res.status(500).json({ 
      error: 'No se pudo exportar a Google Sheets. Verifica las credenciales y permisos.' 
    });
  }
}