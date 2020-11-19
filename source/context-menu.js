chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "kinopoiskSearch",
        title: chrome.i18n.getMessage("extensionName"),
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(function (clickData) {
    if (clickData.menuItemId == "kinopoiskSearch" && clickData.selectionText) {
        openInNewTab(getKpSearchUrl(clickData.selectionText));
    }
});

/**
 * Creates kinopoisk search request url
 *
 * @param {string} searchText search request
 *
 * @returns {string}
 */
function getKpSearchUrl(searchText) {
    return "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(searchText);
}

/**
 * Opens page in new tab
 *
 * @param {string} pageUrl url of a page
 */
function openInNewTab(pageUrl) {
    chrome.tabs.create({
        url: pageUrl
    });
}
