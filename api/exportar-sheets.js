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

    // --- 1. PREPARAR DATOS DE MOVIMIENTOS ---
    // Ordenamos por fecha (más reciente primero) y formateamos textos
    const movimientosOrdenados = [...movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const filasMovimientos = movimientosOrdenados.map((m) => [
      m.fecha,
      m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1), // "Ingreso" o "Gasto"
      m.categoria.charAt(0).toUpperCase() + m.categoria.slice(1), // "Comida", "Pasaje"
      m.descripcion || '-',
      parseFloat(m.monto), // Mandamos el número puro para que Sheets lo trate como moneda
    ]);

    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `Movimientos!A2:E1000` });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Movimientos!A:E`, 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto (S/)'],
          ...filasMovimientos,
        ],
      },
    });

    // --- 2. PREPARAR DATOS DE DEUDAS ---
    const filasDeudas = deudas.map((d) => [
      d.nombre,
      parseFloat(d.montoTotal),
      parseFloat(d.cuotaMensual),
    ]);

    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `Deudas!A2:C1000` });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Deudas!A:C`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          ['Entidad', 'Monto Total (S/)', 'Cuota Mensual (S/)'],
          ...filasDeudas,
        ],
      },
    });

    // --- 3. DAR FORMATO VISUAL (EL TRUCO BONITO) ---
    // Pintamos los encabezados de verde, texto blanco, negrita y ajustamos columnas
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Formato para Movimientos
          {
            repeatCell: {
              range: { sheetId: await obtenerIdHoja(sheets, spreadsheetId, 'Movimientos'), startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { backgroundColor: { red: 15/255, green: 81/255, blue: 50/255 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true } } },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          // Formato para Deudas
          {
            repeatCell: {
              range: { sheetId: await obtenerIdHoja(sheets, spreadsheetId, 'Deudas'), startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { backgroundColor: { red: 15/255, green: 81/255, blue: 50/255 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true } } },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          }
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
    return res.status(500).json({ error: `Error: ${error.message}` });
  }
}

// Función auxiliar para obtener el ID interno de la pestaña
async function obtenerIdHoja(sheets, spreadsheetId, nombreHoja) {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const hoja = res.data.sheets.find(s => s.properties.title === nombreHoja);
  return hoja ? hoja.properties.sheetId : 0;
}