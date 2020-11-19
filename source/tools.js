/**
 * Opens page in a new tab
 *
 * @param {string} pageUrl url of a page
 */
function openInNewTab(pageUrl) {
    chrome.tabs.create({
        url: pageUrl
    });
}

/**
 * Sets element's visibility
 *
 * @param {HTMLElement} htmlElement
 * @param {boolean} visiblity
 */
function setVisibility(htmlElement, visiblity) {
    if (visiblity) {
        htmlElement.removeAttribute("hidden");
    } else {
        htmlElement.setAttribute("hidden", true);
    }
}

/**
 * Check Enter buttons pressed
 *
 * @param {KeyboardEvent} event
 *
 * @returns {bool}
 */
function isButtonEnter(event) {
    return event.key === "Enter" || event.code === "Enter" || event.keyCode === 13;
}

/**
 * Check Arrow Down buttons pressed
 *
 * @param {KeyboardEvent} event
 *
 * @returns {bool}
 */
function isButtonDown(event) {
    return event.key === "ArrowDown" || event.code === "ArrowDown" || event.keyCode === 40;
}

/**
 * Check Arrow Up buttons pressed
 *
 * @param {KeyboardEvent} event
 *
 * @returns {bool}
 */
function isButtonUp(event) {
    return event.key === "ArrowUp" || event.code === "ArrowUp" || event.keyCode === 38;
}

/**
 * Returns value from object by its key
 *
 * @param {any} obj object
 * @param {string} key compound key
 *
 * @returns {any}
 */
function get(obj, key) {
    return key.split(".").reduce(function (o, x) {
        return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
}

/**
 * Generates unique id
 *
 * @returns {string}
 */
function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
