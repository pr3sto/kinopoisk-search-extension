var contextMenuItem = {
    "id": "kinopoiskSearch",
    "title": chrome.i18n.getMessage("extensionName"),
    "contexts": ["selection"]
};

chrome.contextMenus.create(contextMenuItem);

chrome.contextMenus.onClicked.addListener(function (clickData) {
    if (clickData.menuItemId == "kinopoiskSearch" && clickData.selectionText) {
        openInNewTab(getKpSearchUrl(clickData.selectionText));
    }
});

/**
 * Creates kinopoisk search request url
 *
 * @param {string} searchText search request
 */
function getKpSearchUrl(searchText) {
    return "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(searchText);
}

/**
 * Opens page in new tab
 *
 * @param {string} url url of a page
 */
function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}
