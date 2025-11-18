// ===== CONFIGURACIÓN DE DEBUGGING =====
console.log('🔧 Sistema de Agenda - Vicerrectoría de Investigaciones');
console.log('📊 Spreadsheet ID:', SHEETS_CONFIG.spreadsheetId);
console.log('🔑 API Key configurada:', SHEETS_CONFIG.options.apiKey ? 'SÍ' : 'NO');
console.log('📋 Sheet Name:', SHEETS_CONFIG.sheetName);
console.log('📁 Modo datos:', SHEETS_CONFIG.options.useSampleData ? 'Ejemplo' : 'Google Sheets');

// Función para debug
function debugConnection() {
    console.log('=== DIAGNÓSTICO DE CONEXIÓN ===');
    
    // Verificar configuración
    console.log('1. Configuración:', {
        spreadsheetId: SHEETS_CONFIG.spreadsheetId,
        sheetName: SHEETS_CONFIG.sheetName,
        apiKey: SHEETS_CONFIG.options.apiKey ? 'Configurada' : 'No configurada',
        useSampleData: SHEETS_CONFIG.options.useSampleData
    });
    
    // Verificar URL
    const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${SHEETS_CONFIG.sheetName}?key=${SHEETS_CONFIG.options.apiKey}`;
    console.log('2. URL de prueba:', testUrl);
    
    // Probar conexión
    return fetch(testUrl)
        .then(response => {
            console.log('3. Respuesta HTTP:', response.status, response.statusText);
            return response.json();
        })
        .then(data => {
            console.log('4. Datos recibidos:', data);
            if (data.error) {
                console.error('❌ Error en API:', data.error);
            } else if (data.values) {
                console.log('✅ Datos encontrados:', data.values.length, 'filas');
            }
            return data;
        })
        .catch(error => {
            console.error('❌ Error de conexión:', error);
        });
}

// Hacer disponible globalmente para debugging
window.debugConnection = debugConnection;

console.log('💡 Para diagnosticar problemas, ejecuta: debugConnection()');
console.log('📖 Ver: DIAGNOSTICO-CONEXION.md para más información');