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
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // 1. Limpiamos la hoja de Movimientos (desde la fila 2 hacia abajo)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `Movimientos!A2:E1000`, 
    });

    // 2. Escribimos los datos
    const filasMovimientos = movimientos.map((m) => [
      m.fecha, m.tipo, m.categoria, m.descripcion || '', m.monto,
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      // EL TRUCO ESTÁ AQUÍ: Usamos A:E (sin el 1) para que Google deje expandirse hacia abajo
      range: `Movimientos!A:E`, 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'],
          ...filasMovimientos,
        ],
      },
    });

    // 3. Lo mismo para Deudas
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `Deudas!A2:C1000`,
    });

    const filasDeudas = deudas.map((d) => [
      d.nombre, d.montoTotal, d.cuotaMensual,
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      // Usamos A:C (sin el 1)
      range: `Deudas!A:C`,
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