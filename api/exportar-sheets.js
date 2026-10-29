import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { movimientos, deudas } = req.body;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Limpiamos la llave por si Vercel le puso comillas de más
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // 1. Escribir Movimientos (Forzamos el nombre "movimientos")
    const filasMovimientos = movimientos.map((m) => [
      m.fecha, m.tipo, m.categoria, m.descripcion || '', m.monto,
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `movimientos!A2:E1000`, // Limpiamos datos viejos (dejando los encabezados)
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `movimientos!A1:E1`, 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'],
          ...filasMovimientos,
        ],
      },
    });

    // 2. Escribir Deudas (Forzamos el nombre "deudas")
    const filasDeudas = deudas.map((d) => [
      d.nombre, d.montoTotal, d.cuotaMensual,
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `deudas!A2:C1000`, // Limpiamos datos viejos
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `deudas!A1:C1`,
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
    console.error('Error exportando a Sheets:', error.message);
    return res.status(500).json({ 
      error: `Error: ${error.message}` 
    });
  }
}