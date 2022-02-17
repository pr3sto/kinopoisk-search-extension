chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "kinopoiskSearch",
    title: "Kinopoisk Search",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId == "kinopoiskSearch" && clickData.selectionText) {
    openInNewTab(getKpSearchUrl(clickData.selectionText));
  }
});

function getKpSearchUrl(searchText) {
  return "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(searchText);
}

function openInNewTab(pageUrl) {
  chrome.tabs.create({
    url: pageUrl
  });
}
